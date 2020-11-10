import React from 'react';
import PropTypes from 'prop-types';

class Base extends React.Component {
    static propTypes = {
        /**
         * 样式前缀
         */
        prefix: PropTypes.string,
        /**
         * 当前值
         */
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        /**
         * 初始化值
         */
        defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        /**
         * 发生改变的时候触发的回调
         * @param {String} value 数据
         * @param {Event} e DOM事件对象
         */
        onChange: PropTypes.func,
        /**
         * 禁用状态
         */
        disabled: PropTypes.bool,
        /**
         * 最大长度
         */
        maxLength: PropTypes.number,
        /**
         * 是否展现最大长度样式
         */
        hasLimitHint: PropTypes.bool,
        /**
         * 当设置了maxLength时，是否截断超出字符串
         */
        cutString: PropTypes.bool,
        /**
         * 只读
         */
        readOnly: PropTypes.bool,
        /**
         * onChange返回会自动去除头尾空字符
         */
        trim: PropTypes.bool,
        /**
         * 输入提示
         */
        placeholder: PropTypes.string,
        /**
         * 按下回车的回调
         */
        onPressEnter: PropTypes.func,
        /**
         * 获取焦点时候触发的回调
         */
        onFocus: PropTypes.func,
        /**
         * 失去焦点时候触发的回调
         */
        onBlur: PropTypes.func,
        onKeyDown: PropTypes.func,
        /**
         * 自定义字符串计算长度方式
         * @param {String} value 数据
         * @returns {Number} 自定义长度
         * @version 1.2.0+
         * @device PC
         */
        getValueLength: PropTypes.func,
        inputStyle: PropTypes.object,
        /**
         * 自定义class
         */
        className: PropTypes.string,
        /**
         * 自定义内联样式
         */
        style: PropTypes.object,
        /**
         * 原生type
         */
        htmlType: PropTypes.string,
        state: PropTypes.string,
    };
    static defaultProps = {
        disabled: false,
        prefix: 'next-',
        maxLength: null,
        hasLimitHint: false,
        cutString: true,
        readOnly: false,
        trim: false,
        state: '',
        onPressEnter() {
        },
        onFocus() {
        },
        onBlur() {
        },
        onKeyDown() {
        },
        onChange() {
        },
        getValueLength() {
        },
    };
}

export default Base;
