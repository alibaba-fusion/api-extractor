import React, { Component} from 'react';
import PropTypes from 'prop-types';

/**
 * MyComponent
 **/
class MyComponent extends React.Component {
  static propTypes = {
    // this prop will be ignored
    ignored: PropTypes.string,
    /**
     * Description of prop "aaa"
     **/
    aaa: PropTypes.bool,
    /**
     * Description of prop "bbb"
     **/
    bbb: PropTypes.oneOf(['foo', 'bar']),
    /**
     * Description of prop "ccc"
     **/
    ccc: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    /**
     *  Description of prop "ddd"
     **/
    ddd: PropTypes.arrayOf(PropTypes.number),
    /**
     *  Description of prop "eee"
     **/
    eee: PropTypes.node,
    /**
     *  Description of prop "fff"
     *  @property {Number} count Description of "count"
     *  @property {String} color Description of "color"
     **/
    fff: PropTypes.shape({
      count: PropTypes.number,
      color: PropTypes.string
    }),
    /**
     *  Description of prop "ggg"
     *  @param {String} xxx Description of "xxx"
     *  @param {Object} yyy Description of "yyy"
     *  @param {String} yyy.a Description of "yyy.a"
     *  @param {String} yyy.b Description of "yyy.b"
     *  @return {Boolean} Description of return value
     **/
    ggg: PropTypes.func
  };

  static defaultProps = {
    aaa: true,
    bbb: 'foo',
    ddd: [],
    eee: 'Please',
    ggg: () => {}
  };

  /**
   * Description of method "staticMethod"
   * @param {Number} foo Description of "foo"
   * @param {Number} bar Description of "bar"
   * @return {Number} Description of return value
   */
  static staticMethod = (foo, bar) => {
    // ...
  };

  /**
   * Description of method "instanceMethod"
   * @param {String} foo Description of "foo"
   */
  instanceMethod = foo => {
    // ...
  };

  // this method will be ignored
  ignoredMethod = () => {
    // ...
  }

  render() {
    // ...
  }
}

// only one exported component will be extracted in the file
export default MyComponent;
