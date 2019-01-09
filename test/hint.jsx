import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Icon from '@alife/next-icon';
import { obj, func } from '@alife/next-util';
import ConfigProvider from '@alife/next-config-provider';

// preventDefault here can stop onBlur to keep focus state
function preventDefault(e) {
  e.preventDefault();
}

class Clear extends React.Component {
  static propTypes = {
    prefix: PropTypes.string,
    /**
     * 水印 Icon
     */
    hint: PropTypes.string,
    /**
     * 是否出现clear按钮
     */
    hasClear: PropTypes.bool
  };

  static defaultProps = {
    prefix: 'next-'
  };

  render() {
    const { hint, prefix, hasClear, onClick } = this.props;

    let hintIcon = null;
    if (hint) {
      hintIcon = <Icon type={hint} className={`${prefix}input-hint`} />;
    } else {
      hintIcon = (
        <Icon
          type="delete-filling"
          className={`${prefix}input-hint`}
          onClick={onClick}
          onMouseDown={preventDefault}
        />
      );
    }

    const cls = classNames({
      [`${prefix}input-hint-wrap`]: true
    });

    return (
      <span className={`${prefix}input-hint-wrap`}>
        {hasClear && hint ? (
          <Icon
            type="delete-filling"
            className={`${prefix}input-clear`}
            onClick={onClick}
            onMouseDown={preventDefault}
          />
        ) : null}
        {hintIcon}
      </span>
    );
  }
}

export default ConfigProvider.config(Clear);
