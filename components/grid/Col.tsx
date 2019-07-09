import React from 'react';
import classNames from 'classnames';
import RowContext from './RowContext';
import { ConfigConsumer, ConfigConsumerProps } from '../ConfigProvider';

type ColSpanType = number | string;

export interface ColSize {
  span?: ColSpanType;
  order?: ColSpanType;
  offset?: ColSpanType;
}

export interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: ColSpanType;
  order?: ColSpanType;
  offset?: ColSpanType;
  prefixCls?: string;
}

export default class Col extends React.Component<ColProps, {}> {
  renderCol = ({ getPrefixCls }: ConfigConsumerProps) => {
    const {
      prefixCls: customizePrefixCls,
      span,
      order,
      offset,
      className,
      children,
      ...others
    } = this.props;
    const prefixCls = getPrefixCls('col', customizePrefixCls);
    const classes = classNames(
      prefixCls,
      {
        [`${prefixCls}-${span}`]: span !== undefined,
        [`${prefixCls}-order-${order}`]: order,
        [`${prefixCls}-offset-${offset}`]: offset,
      },
      className,
    );

    return (
      <RowContext.Consumer>
        {({ gutter }) => {
          let style = others.style;
          if (gutter! > 0) {
            style = {
              paddingLeft: gutter! / 2,
              paddingRight: gutter! / 2,
              ...style,
            };
          }
          return (
            <div {...others} style={style} className={classes}>
              {children}
            </div>
          );
        }}
      </RowContext.Consumer>
    );
  };

  render() {
    return <ConfigConsumer>{this.renderCol}</ConfigConsumer>
  }
}
