# @alifd/api-extractor
一个从 React 组件代码中提取 API 信息的工具，一般用来生成 API 文档，开发编辑器组件 API 提示插件以及开发页面搭建平台组件物料的属性面板，代码中附加信息书写方式来源于[jsDoc](http://usejsdoc.org/)，整体底层解析工具依赖于 [react-docgen](https://github.com/reactjs/react-docgen) 和 [doctrine](https://github.com/eslint/doctrine)。

[![npm package](https://img.shields.io/npm/v/@alifd/api-extractor.svg?style=flat-square)](https://www.npmjs.org/package/@alifd/api-extractor)

## Feature
* 支持通过`propTypes`获得属性类型
* 支持通过`defaultProps`获得属性默认值
* 支持通过`propTypes`上的 jsDoc 注释获得属性描述，自定义属性默认值
* 支持通过书写 jsDoc 获取函数类型属性的参数和返回值
* 支持通过书写 jsDoc 获取对象类型属性的属性
* 支持通过书写 jsDoc 获取组件静态方法和实例方法的描述，参数以及返回值
* 支持根据提取的 API 信息生成 markdown 片段，方便灵活组织API文档
* 支持通过按照约定书写组件上的 jsDoc 来获得父组件与子组件关系
* 支持通过`propTypes = {...Base.propTypes}`的方式扩展

## Install

```
npm install @alifd/api-extractor
```

## Usage

``` js
const extractor = require('@alifd/api-extractor');
const apiInfo = extractor.extract(componentDirPath);
// const apiInfo = extractor.extractFile(componentFilePath);
```

## API

### extract(componentDirPath, options, parentMap)
**参数**：

* componentDirPath `String` 组件代码文件夹路径
* options `Object` 可选项
  * md `Boolean` 是否生成`props`和`method`的 markdown 片段，默认值为`false`
  * fileErrorHandler `Function` 自定义单个文件的错误处理函数，默认直接抛出错误
* parentMap `Object` 可选项 组件继承关系，例如 Nav 继承自 Menu ，通过该参数可将 Menu 上的props merge到 Nav上
```js
{
  'Nav': {
    name: 'Menu',
    path: 'my-path/src/menu'
  },
  'Nav.Item': {
    name: 'Menu.Item',
    path: 'my-path/src/menu'
  }
}
```

**返回值**：

`Object` 参考下方 Example

### extractFile(componentFilePath, options)
**参数**：

* componentFilePath `String` 组件代码文件路径
* options `Object` 可选项
  * md `Boolean` 是否生成`props`和`method`的 markdown 片段，默认值为`false`

**返回值**：

`Object` 参考下方 Example

### generatePropsMD(props)
**参数**：

* props `Object` 使用`extract`方法生成api信息的`props`属性

**返回值**：

`String` props对应的markdown文本

### generateMethodMD(method)
**参数**：

* method `Object` 使用`extract`方法生成api信息的`methods`属性的Item

**返回值**：

`String` method对应的markdown文本

## Example

如果传入的组件代码根路径下存在以下两个文件：

menu.js

``` js
import React, { Component} from 'react';
import PropTypes from 'prop-types';

/**
 * Menu
 **/
export default class Menu extends Component {
  static propTypes = {
    /**
     * the menu size
     **/
    size: PropTypes.string,
    /**
     * select menu callback
     * @param {Array} selectedKeys the seleced keys
     **/
    onSelect: PropTypes.func
  };

  static defaultProps = {
    size: 'medium',
    onSelect: () => {}
  };

  render() {
    // ...
  }
}
```

menu-item.js

``` js
import React, { Component} from 'react';
import PropTypes from 'prop-types';

/**
 * Menu.Item
 **/
export default class Item extends Component {
  // ...
}
```

我们会得到如下的 json 结构：

``` js
{
  "name": "Menu",                              // 组件名
  "props": {
    "size": {                                  // 属性名
      "type": {
        "name": "string"                       // 属性类型
      },
      "required": false,                       // 属性是否必需
      "description": "the menu size",          // 属性描述
      "defaultValue": {
        "value": "'medium'",                   // 属性默认值
        "computed": false
      }
    },
    "onSelect": {
      "type": {
        "name": "func"
      },
      "required": false,
      "description": "select menu callback",
      "defaultValue": {
        "value": "() => {}",
        "computed": false
      },
      "docblock": "select menu callback\n@param {Array} selectedKeys the seleced keys",
      "params": [                               // 函数参数
        {
          "name": "selectedKeys",               // 函数参数名
          "description": "the seleced keys",    // 函数参数描述
          "type": {
            "name": "Array"                     // 函数参数类型
          }
        }
      ],
      "returns": null                           // 函数返回值
    }
  },
  "propsMD": "...",                             // 开启了md参数后，所有属性渲染出的 Markdown 文件
  "methods": [],                                // 方法
  "subComponents": [                            // 子组件
    {
      "description": "Item",
      // ...
    }
  ]
}
```

该 json 结构在[react-docgen 生成的 json 结构](https://github.com/reactjs/react-docgen#proptypes)基础上扩展而成。主要增加了`subComponents`，`propsMD`，属性为函数时的`parmas`，`return`和属性为对象时的`properties`结构。

`propsMD` 属性一般用来生成README.md中的API文档，`Menu` 组件的 `propsMD` 具体如下所示：

```
参数 | 说明 | 类型 | 默认值
-----|-----|-----|-----
size | the menu size | String | 'medium'
onSelect | select menu callback<br><br>**签名**:<br>Function(selectedKeys: Array) => void<br>**参数**:<br>selectedKeys {Array} the seleced keys | Function | () => {}
```

## Note
1. 只有添加了 jsDoc 注释的组件类，组件的属性以及组件的方法，才会被工具提取出相应的 API 信息。

2. 只有在文件中被`export default`的组件类才会被提取 API 信息

3. 默认传入的组件路径下只有一个根组件，如果想对外暴露两个组件，如`Row`和`Col`，也请在 jsDoc 的注释中添加根组件的前缀，如`Grid.Row`和`Grid.Col`。

4. 如果想控制子组件在`subComponents`中出现的顺序，以方便生成对应的 API 文档，可以为组件类的 jsDoc 注释中添加`order`字段（默认按照首字母顺序排列），如下所示：

      row.js
      ``` js
      /**
       * Grid.Row
       * @order 1
       */
      export default class Row extends Component {
        // ...
      }
      ```

      col.js

      ``` js
      /**
       * Grid.Col
       * @order 2
       */
      export default class Col extends Component {
        // ...
      }
      ```

5. 工具只支持一层的子组件，也就是说无法处理`AAA.BBB.CCC`的情况，当然我们也不认为这是一个组件应该对外暴露的使用方式。

6. 如果想自定义属性默认值，可以采用下面方法（其优先级高于`defaultProps`）：

    ``` js
    /**
     * Description of prop "aaa"
     * @default custom
     **/
    aaa: PropTypes.string,
    ```

7. 如果像添加属性枚举值的描述，可以采用下面方法


    ``` js
    /**
     * Description of prop "aaa"
     * @enumdesc left, right
     **/
    bbb: PropTypes.oneOf(['left', 'right']),
    ```

8. 可以通过书写 description tag 来为组件增加描述

    ``` js
    /**
     * Upload.ImageUpload
     * @description 继承 [Upload](http://fusion-demo.alibaba-inc.com/api/1.0/views/next?themeId=next&name=upload#upload-1) 的 API，除非特别说明
     */
    class ImageUpload extends Component {
      //...
    }
    ```
9. 以下的写法，可以获得 Base 组件中声明的 API 信息

    ``` js
    import Base from './base';

    export default class Menu extends Component {
        static propTypes = {
            ...Base.propTypes,
            /**
             * description
             */
            onSelect: PropTypes.func
        }
    }
    ```
