import React from 'react';
import { ThemeProvider } from 'styled-components';

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type OptionalProps<T, K> = T | Omit<T, K>;


export interface IBaseStyles {
  [propName: string]: React.CSSProperties;
}

export interface IBaseStyledProps {
  style?: React.CSSProperties;
  className?: string;
  [prop: string]: any;
}

export interface IBaseTheme {
  [prop: string]: any;
}

export interface IBaseComponentProps {
  /**
   * 样式集合，方便外部控制
   */
  styles?: IBaseStyles;

  /**
   * 设置主题
   */
  theme?: IBaseTheme;

  /**
   * 兼容其他属性
   */
  [prop: string]: any;
};


export const DEFAULT_PROPS: IBaseComponentProps = {
  theme: {
  },
  styles: {
  }
};

function getDisplayName(WrappedComponent: React.SFC<IBaseComponentProps>) {
  return WrappedComponent.displayName ||
    WrappedComponent.name || 'Component';
}
/**
 * 使用高阶组件默认注入 theme 和 css 组件
 * @param subComponents - 子组件列表
 */
export const based = (WrappedComponent: React.SFC<IBaseComponentProps>) => {
  const BaseComponent = function (props: IBaseComponentProps) {
    // const { SchemaTreeComponent } = subComponents;
    const mergedProps = Object.assign({}, DEFAULT_PROPS, props);
    const { theme } = mergedProps;

    return <ThemeProvider theme={theme}>
      <WrappedComponent {...props} />
    </ThemeProvider>
  }

  BaseComponent.displayName = `Based${getDisplayName(WrappedComponent)}`;
  return BaseComponent;
}

