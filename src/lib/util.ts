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

export const toClass: <Props>(
  baseComponent: React.FC<Props>
) => any = baseComponent => {
  return isClassComponent(baseComponent)
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
          const { props, context } = this;
          return baseComponent(props as any, context as any);
        }
      };
};

// 拷贝到粘贴板:
// reference: https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
export const copyToClipboard = (str: string) => {
  return new Promise((resolve, reject)=>{
    try {
      const el = document.createElement('textarea');  // Create a <textarea> element
      el.value = str;                                 // Set its value to the string that you want copied
      el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
      el.style.position = 'absolute';
      el.style.left = '-9999px';                      // Move outside the screen to make it invisible
      document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
      const selected =
        document.getSelection().rangeCount > 0        // Check if there is any content selected previously
          ? document.getSelection().getRangeAt(0)     // Store selection if found
          : false;                                    // Mark as false to know no selection existed before
      el.select();                                    // Select the <textarea> content
      document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
      document.body.removeChild(el);                  // Remove the <textarea> element
      if (selected) {                                 // If a selection existed before copying
        document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
        document.getSelection().addRange(selected);   // Restore the original selection
      }
      resolve(str);
    } catch (err) {
      reject(err)
    }
  });
  
};
