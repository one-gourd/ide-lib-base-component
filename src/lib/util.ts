import React, { Component } from 'react';

// some from recompose: https://github.com/acdlite/recompose/blob/master/src/packages/recompose/isClassComponent.js

export const isClassComponent = (
  Component: any
): Component is React.Component<any, any> =>
  Boolean(
    Component &&
      Component.prototype &&
      typeof Component.prototype.render === 'function'
  );

export function getDisplayName(WrappedComponent: any) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export const toClass = <Props>(baseComponent: React.FC<Props>) =>
  isClassComponent(baseComponent)
    ? baseComponent
    : class ToClass extends Component {
        static displayName = getDisplayName(baseComponent);
        static propTypes = baseComponent.propTypes;
        static contextTypes = baseComponent.contextTypes;
        static defaultProps = baseComponent.defaultProps;
        render() {
          if (typeof baseComponent === 'string') {
            return React.createElement(baseComponent, this.props);
          }
          return baseComponent((this as any).props, this.context);
        }
      };
