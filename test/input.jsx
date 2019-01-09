import React from 'react';
import PropTypes from 'prop-types';

import Base from './base';
import Hint from './hint';

/** Input */
class Input extends Base {
  static propTypes = {
    ...Base.propTypes,
    ...Hint.propTypes,
    /**
     * 是否出现clear按钮
     */
    hasClear: PropTypes.bool,
    /**
     * 是否有边框
     */
    hasBorder: PropTypes.bool,
    /**
     * 状态
     * @enumdesc , 错误, 校验中, 成功
     */
    state: PropTypes.oneOf(['', 'error', 'loading', 'success']),
    /**
     * 尺寸
     * @enumdesc 小, 中, 大
     */
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    /**
     * 原生type
     */
    htmlType: PropTypes.string,
    /**
     * 文字前附加内容
     */
    innerBefore: PropTypes.node,
    /**
     * 文字后附加内容
     */
    innerAfter: PropTypes.node,
    /**
     * 输入框前附加内容
     */
    addonBefore: PropTypes.node,
    /**
     * 输入框后附加内容
     */
    addonAfter: PropTypes.node,
    /**
     * 输入框前附加内容
     */
    addonTextBefore: PropTypes.node,
    /**
     * 输入框后附加内容
     */
    addonTextAfter: PropTypes.node,
    /**
     * (原生input支持)
     */
    autoComplete: PropTypes.string
  };

  static defaultProps = {
    ...Base.defaultProps,
    state: '',
    size: 'medium',
    hasBorder: true
  };
  render() {
    return <input />;
  }
}

export default Input;
