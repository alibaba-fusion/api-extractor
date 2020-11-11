const doctrine = require('doctrine');

function getType(tag) {
  if (!tag.type) {
    return null;
  }

  if (tag.type.type === 'UnionType') {
    return {
      name: 'union',
      value: tag.type.elements.map(element => element.name)
    };
  }

  if (tag.type.type === 'AllLiteral') {
    return {
      name: 'mixed'
    };
  }

  return {
    name: tag.type.name ? tag.type.name : tag.type.expression.name
  };
}

function getReturnsJsDoc(jsDoc) {
  const returnTag = jsDoc.tags.find(tag => tag.title === 'return' || tag.title === 'returns');
  if (returnTag) {
    return {
      description: returnTag.description,
      type: getType(returnTag)
    };
  }
  return null;
}

function getDefaultJsDoc(jsDoc) {
  const defaultTag = jsDoc.tags.find(tag => tag.title === 'default');
  if (defaultTag) {
    return {
      value: defaultTag.description,
      computed: false
    };
  }
  return null;
}

function getEnumdescJsDoc(jsDoc) {
  const enumdescTag = jsDoc.tags.find(tag => tag.title === 'enumdesc');
  if (enumdescTag) {
    return enumdescTag.description.split(/,\s*/);
  }
  return null;
}

function getSpecialTagJsDoc(jsDoc, tagTitle) {
  return jsDoc.tags
    .filter(tag => tag.title === tagTitle)
    .map(tag => {
      return {
        name: tag.name,
        description: tag.description,
        type: getType(tag)
      };
    });
}

function getDeviceJsDoc(jsDoc) {
  const deviceTag = jsDoc.tags.find(tag => tag.title === 'device');
  if (deviceTag) {
    // computed 为react-docgen协议要求
    // 标注value是需要运行计算的表达式，还是非计算的常量
    return {
      value: deviceTag.description,
      computed: false
    };
  }
}

function getVersionJsDoc(jsDoc) {
  const versionTag = jsDoc.tags.find(tag => tag.title === 'version');
  if (versionTag) {
    return {
      value: versionTag.description,
      computed: false
    };
  }
}

module.exports = function parseJsDoc(docblock, type) {
  const jsDoc = doctrine.parse(docblock);
  const result = {
    description: jsDoc.description || null,
    docblock: docblock
  };

  if (type.name === 'func') {
    result.params = getSpecialTagJsDoc(jsDoc, 'param');
    result.returns = getReturnsJsDoc(jsDoc);
  } else if (['object', 'objectOf', 'shape'].indexOf(type.name) > -1) {
    result.properties = getSpecialTagJsDoc(jsDoc, 'property');
  } else if (type.name === 'enum') {
    const enumdesc = getEnumdescJsDoc(jsDoc);
    if (enumdesc) {
      result.value = type.value.map((v, i) => {
        v.description = enumdesc[i];
        return v;
      });
    }
  }

  const defaultValue = getDefaultJsDoc(jsDoc);
  if (defaultValue && defaultValue.value) {
    result.defaultValue = defaultValue;
  }

  const deviceValue = getDeviceJsDoc(jsDoc);
  if (deviceValue && deviceValue.value) {
    result.device = deviceValue;
  }

  const versionValue = getVersionJsDoc(jsDoc);
  if (versionValue && versionValue.value) {
    result.version = versionValue;
  }

  return result;
};
