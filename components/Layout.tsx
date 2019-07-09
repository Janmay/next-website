import React from 'react';
import classNames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from './ConfigProvider';

export interface BasicProps extends React.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
}

export interface GeneratorProps {
  suffixCls: string;
  tagName: 'header' | 'footer' | 'main' | 'section';
}

interface BasicPropsWithTagName extends BasicProps {
  tagName: 'header' | 'footer' | 'main' | 'section';
}

function generator({ suffixCls, tagName }: GeneratorProps) {
  return (BasicComponent: React.ComponentClass<BasicPropsWithTagName>): any => {
    return class Adapter extends React.Component<BasicProps, any> {
      static Header: any;
      static Footer: any;
      static Content: any;

      renderComponent = ({getPrefixCls}: ConfigConsumerProps) => {
        const {prefixCls: customizePrefixCls} = this.props;
        const prefixCls = getPrefixCls(suffixCls, customizePrefixCls);

        return <BasicComponent prefixCls={prefixCls} tagName={tagName} {...this.props} />;
      };

      render() {
        return <ConfigConsumer>{this.renderComponent}</ConfigConsumer>;
      }
    }
  };
}

class Basic extends React.Component<BasicPropsWithTagName, any> {
  render() {
    const { prefixCls, className, children, tagName, ...others } = this.props;
    const classString = classNames(className, prefixCls);
    return React.createElement(tagName, { className: classString, ...others }, children);
  }
}

const Layout: React.ComponentClass<BasicProps> & {
  Header: React.ComponentClass<BasicProps>;
  Footer: React.ComponentClass<BasicProps>;
  Content: React.ComponentClass<BasicProps>;
} = generator({
  suffixCls: 'layout',
  tagName: 'section',
})(Basic);

const Header = generator({
  suffixCls: 'layout-header',
  tagName: 'header',
})(Basic);

const Footer = generator({
  suffixCls: 'layout-footer',
  tagName: 'footer',
})(Basic);

const Content = generator({
  suffixCls: 'layout-content',
  tagName: 'main',
})(Basic);

Layout.Header = Header;
Layout.Footer = Footer;
Layout.Content = Content;

export default Layout;
