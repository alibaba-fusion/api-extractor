const fs = require('fs');
const path = require('path');
const glob = require('glob');
const reactDocs = require('react-docgen');
const doctrine = require('doctrine');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const parseJsDoc = require('./parseJsDoc');

function getApiInfos(dir, options, parentMap, staticMethodsWrapper, needDeep) {

  const relativePaths = glob.sync('**/*.@(jsx)', {
    cwd: dir,
    ignore: 'node_modules/**'
  });

  return relativePaths.reduce((ret, relativePath) => {
    const fullPath = path.join(dir, relativePath);
    const apiInfo = extractFile(fullPath, options);

    if (apiInfo) {
      const parent = parentMap && parentMap[apiInfo.name];

      if (parent && needDeep) {
        const parentName = parent.name;
        const parentPath = parent.path;

        if (needDeep && dir === parentPath) {
          needDeep = false;
        }

        const parentApiInfos = getApiInfos(parentPath, {}, parentMap, { methods: [] }, needDeep);
        const parentItem = parentApiInfos.find(item => item.name === parentName);
        apiInfo.props = Object.assign({}, parentItem.props, apiInfo.props);
      }

      ret.push(apiInfo);
    }

    staticMethodsWrapper.methods = staticMethodsWrapper.methods.concat(getExportMethod(fullPath));

    return ret;
  }, []);

}
/**
 *
 * @param {String} dir dir path
 * @param {Object} options
 * @param {Object} parentMap { ${childProps}: { name: ${parentProps}, path: ''}} e.g.
 *                          {
 *                              'Nav': {
                                    name: 'Menu',
                                    path: 'my-path/src/menu'
                                },
                                'Nav.Item': {
                                    name: 'Menu.Item',
                                    path: 'my-path/src/menu'
                                }
                            }
 */
function extract(dir, options = {}, parentMap = {}) {
  let methodsWrapper = {};
  methodsWrapper.methods = [];
  const apiInfos = getApiInfos(dir, options, parentMap, methodsWrapper, true);

  const staticMethods = methodsWrapper.methods;

  if (apiInfos.length) {
    let mainAPIInfo;
    let mainIndex = apiInfos.findIndex(apiInfo => apiInfo.name.indexOf('.') === -1);
    if (mainIndex === -1) {
      mainAPIInfo = {
        name: apiInfos[0].name.split('.')[0]
      };
    } else {
      mainAPIInfo = apiInfos[mainIndex];
      apiInfos.splice(mainIndex, 1);
    }
    apiInfos.forEach(apiInfo => {
      apiInfo.name = apiInfo.name.split('.')[1];
    });
    const apiInfosWithOrder = apiInfos
      .filter(apiInfo => ('order' in apiInfo))
      .sort((prev, next) => prev.order - next.order);
    const apiInfosWithoutOrder = apiInfos
      .filter(apiInfo => !('order' in apiInfo));
    mainAPIInfo.subComponents = apiInfosWithOrder.concat(apiInfosWithoutOrder);
    mainAPIInfo.methods = (mainAPIInfo.methods || []).concat(staticMethods);

    return mainAPIInfo;
  }

  return null;
}

function extractFile(filePath, options = {}) {
  const source = fs.readFileSync(filePath, 'utf8');

  let componentInfo;
  try {
    componentInfo = reactDocs.parse(source, reactDocs.resolver.findExportedComponentDefinition, reactDocs.defaultHandlers);

    const composes = componentInfo.composes;
    if (composes && composes.length > 0) {
      for (var i = 0; i < composes.length; i++) {
        let name = composes[i];
        if (name.indexOf('.jsx') === -1) {
          name = name + '.jsx';
        }
        const composesPath = path.resolve(path.dirname(filePath), name);

        if (fs.existsSync(composesPath)) {
          const composesInfo = reactDocs.parse(fs.readFileSync(composesPath, 'utf8'), reactDocs.resolver.findExportedComponentDefinition, reactDocs.defaultHandlers);
          componentInfo.props = Object.assign({}, composesInfo.props, componentInfo.props);
        }
      }
    }
  } catch (e) {
    if (options.fileErrorHandler) {
      options.fileErrorHandler(e);
    } else {
      if (e.message !== 'No suitable component definition found.') {
        e.message = `${e.message}\n[${filePath}]`;
        throw e;
      }
    }
  }

  if (componentInfo && componentInfo.description) {
    return filter(componentInfo, options);
  }
  return null;
}

function getExportMethod(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const ast = parser.parse(source, {
    sourceType: 'module',
    plugins: [
      'estree',
      'jsx',
      'objectRestSpread',
      'decorators-legacy',
      'decorators2',
      'classProperties',
      'functionBind',
    ]
  });
  const methods = [];

  traverse(ast, {
    enter(path) {
      if (path.node.leadingComments &&
        path.node.leadingComments[0] &&
        path.node.leadingComments[0].type === 'CommentBlock') {
        const docblock = path.node.leadingComments[0].value.replace(/\*/g, '');
        const docAST = doctrine.parse(docblock);
        const exportNameTag = docAST.tags.find(tag => tag.title === 'exportName');

        if (exportNameTag && exportNameTag.description) {
          const params = docAST.tags.filter(tag => tag.title === 'param' || tag.title === 'params').map(tag => ({
            name: tag.name,
            description: tag.description,
            type: tag.type
          }));
          const returnsTag = docAST.tags.find(tag => tag.title === 'return' || tag.title === 'returns');
          const returns = returnsTag ? {
            description: returnsTag.description,
            type: returnsTag.type
          } : null;

          methods.push({
            name: exportNameTag.description,
            docblock,
            description: docAST.description,
            modifiers: ['static'],
            params,
            returns
          });
        }
      }
    }
  });

  return methods;
}

function filter(componentInfo, options) {

  const docblock = componentInfo.description;
  const ast = doctrine.parse(docblock);

  const name = ast.description;
  const descriptionTag = ast.tags.find(tag => tag.title === 'description');
  const extendsTag = ast.tags.find(tag => tag.title === 'propsExtends');
  const orderTag = ast.tags.find(tag => tag.title === 'order');
  const order = orderTag ? parseInt(orderTag.description) : null;

  let props = [];
  if (componentInfo.props) {
    props = Object.keys(componentInfo.props).reduce((ret, propName) => {
      const prop = componentInfo.props[propName];
      if (prop.description) {
        const docblock = prop.description;
        const ast = parseJsDoc(docblock, prop.type) || {};
        ret[propName] = Object.assign(prop, ast);
      }

      return ret;
    }, {});
  }

  let methods = [];
  if (componentInfo.methods) {
    methods = componentInfo.methods.reduce((ret, method) => {
      if (method.description) {
        if (options.md) {
          method.md = generateMethodMD(method);
        }
        ret.push(method);
      }
      return ret;
    }, []);
  }

  const apiInfo = {
    name,
    props,
    methods
  };

  if (descriptionTag) {
    apiInfo.description = descriptionTag.description;
  }
  if (extendsTag) {
    if (extendsTag.description === 'false') {
      apiInfo.propsExtends = false;
    } else {
      apiInfo.propsExtends = extendsTag.description;
    }
  }

  if (typeof order === 'number') {
    apiInfo.order = order;
  }
  if (options.md) {
    apiInfo.propsMD = generatePropsMD(props);
  }

  return apiInfo;
}

function generatePropsMD(props) {
  const hasVersion = Object.keys(props).some(propName => props[propName].version);
  if (props && Object.keys(props).length) {
    if (hasVersion) return `
参数 | 说明 | 类型 | 默认值 | 版本支持
-----|-----|-----|-----| -----
${generatePropsContentMD(props, true)}`;
    return `
参数 | 说明 | 类型 | 默认值
-----|-----|-----|-----
${generatePropsContentMD(props, false)}`;
  }
  return '';
}

function generatePropsContentMD(props, hasVersion = false) {
  return Object.keys(props).reduce((ret, name) => {
    return ret + generatePropMD(name, props[name], hasVersion);
  }, '');
}

function generatePropMD(name, prop, hasVersion = false) {
  if (!prop.description) {
    throw new Error(`Can not get description of '${name}' prop`);
  }

  const description = prop.description.replace(/\n/g, '<br>');

  function parseFunc(prop, union = false) {
    return union ? `- *Func*<br/>${generateMethodMD(prop)}` : `<br><br>${generateMethodMD(prop)}`;
  }

  function parseEnum(prop, union = false) {
    let extra = '';
    if (Array.isArray(prop.type.value)) {
      const hasDesc = prop.type.value.some(item => !!item.description);
      extra += `${union ? '- *Enum*<br>&emsp;可选值:<br>&emsp;&emsp;' : '<br><br>**可选值**:<br>'}${prop.type.value.map(item => {
        let desc = '';
        if (item.description) {
          desc = `(${item.description})`;
        }
        return `${item.value}${desc}`;
      }).join(hasDesc ? '<br>' : ', ')}`;
    }
    return extra;
  }

  function parseShape(prop, union = false) {
    let extra = '';
    if (prop.properties && prop.properties.length) {
      extra += union ? '- *属性对象*&emsp;包括:<br>' : '<br><br>**属性**:<br>';
      extra += prop.properties.map(tag => {
        return `*${tag.name}*: {${getType(tag.type)}} ${tag.description}`;
      }).join('<br>');
    } else {
      extra += `- *${getDisplayType(prop.type)}*`;
    }
    return extra;
  }

  function parseUnion(prop) {
    let extra = '<br/><br/>**可选参数类型:**<br/>';
    if (Array.isArray(prop.type.value)) {
      extra += prop.type.value.reduce((ret, current) => {
        const result = parseAll({ type: current }, true);
        ret += result;
        return ret;
      }, '');
    }
    return extra;
  }

  function parseAll(prop, union = false) {
    switch (prop.type.name) {
    case 'func': {
      return `${parseFunc(prop, union)}<br/>`;
    }
    case 'enum': {
      return `${parseEnum(prop, union)}<br/>`;
    }
    case 'union': {
      return `${parseUnion(prop)}`;
    }
    case 'object':
    case 'objectOf':
    case 'shape': {
      return `${parseShape(prop)}<br>`;
    }
    default:
      return union ? `- *${getDisplayType(prop.type)}*<br>` : '';
    }
  }

  const extra = parseAll(prop);
  const displayType = getDisplayType(prop.type);

  const defaultValue = prop.defaultValue ?
    prop.defaultValue.value
      .replace(/\n/g, ' ')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;') :
    '-';

  const verisonValue = prop.version && !prop.version.computed ? prop.version.value : '';

  return `${name} | ${description}${extra} | ${displayType} | ${defaultValue} ${hasVersion ? `| ${verisonValue}` : ''}\n`;
}

function generateMethodMD(method) {
  const paramsSign = method.params ? method.params.reduce((ret, tag) => {
    if (tag.name.indexOf('.') === -1) {
      ret.push(`${tag.name}: ${getType(tag.type)}`);
    }
    return ret;
  }, []).join(', ') : [];
  const returnsSign = method.returns ? getType(method.returns.type) : 'void';
  const funcSign = `**签名**:<br>Function(${paramsSign}) => ${returnsSign}`;

  let paramsHTML = '';
  if (method.params && method.params.length) {
    paramsHTML += '<br>**参数**:<br>';
    paramsHTML += method.params.map(tag => {
      return `*${tag.name}*: {${getType(tag.type)}} ${tag.description}`;
    }).join('<br>');
  }

  let returnsHTML = '';
  if (method.returns) {
    returnsHTML += '<br>**返回值**:<br>';
    returnsHTML += `{${getType(method.returns.type)}} ${method.returns.description}<br>`;
  }

  return `${funcSign}${paramsHTML}${returnsHTML}`;
}

function getType(type) {
  if (!type) {
    return 'unknown';
  }

  if (type.name === 'union') {
    return type.value.join('/');
  }

  return type.name;
}

function getDisplayType(type) {
  if (type.name === 'union') {
    return type.value.map(getDisplayType).join('/');
  }

  if (type.name === 'instanceOf') {
    return type.value;
  }

  if (type.name === 'arrayOf') {
    return `Array&lt;${getDisplayType(type.value)}&gt;`;
  }

  return {
    any: 'any',
    array: 'Array',
    bool: 'Boolean',
    custom: 'custom',
    element: 'ReactElement',
    enum: 'Enum',
    func: 'Function',
    node: 'ReactNode',
    number: 'Number',
    object: 'Object',
    string: 'String',
    symbol: 'Symbol',
    objectOf: 'Object',
    shape: 'Object'
  }[type.name] || 'unknown';
}

exports.extract = extract;
exports.extractFile = extractFile;
exports.generatePropsMD = generatePropsMD;
exports.generateMethodMD = generateMethodMD;
