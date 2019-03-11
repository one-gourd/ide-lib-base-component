import React, { useCallback } from 'react';
import Application, { Client } from 'ette';
import { ThemeProvider } from 'styled-components';
import { getValueByPath } from 'ide-lib-utils';
import { TAnyMSTModel } from './schema/stores';

import { debugRender } from '../lib/debug';

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


function getDisplayName(WrappedComponent: React.SFC<IBaseComponentProps>) {
  return WrappedComponent.displayName ||
    WrappedComponent.name || 'Component';
}
/**
 * 使用高阶组件默认注入 theme 和 css 组件
 * @param subComponents - 子组件列表
 */
export const based = (WrappedComponent: React.SFC<IBaseComponentProps>, defaultProps: IBaseComponentProps = {}) => {
  const BaseComponent = function (props: IBaseComponentProps) {
    // const { SchemaTreeComponent } = subComponents;
    const mergedProps = Object.assign({}, defaultProps, props);
    const { theme = {} } = mergedProps;

    debugRender('[based] 接收到的 props: %o', props);
    return <ThemeProvider theme={theme}>
      <WrappedComponent {...mergedProps} />
    </ThemeProvider>
  }

  BaseComponent.displayName = `Based${getDisplayName(WrappedComponent)}`;
  return BaseComponent;
}



/* ----------------------------------------------------
    以下是专门配合 store 时的工具函数
----------------------------------------------------- */

export interface IStoresEnv<T> {
  stores: T;
  app: Application,
  client: Client,
  innerApps?: Record<string, Application>
}

export function extracSubEnv<T, K>(storesEnv: IStoresEnv<T>, subName: string) {
  const stores: K = getValueByPath(storesEnv, `stores.${subName}`);
  const app = getValueByPath(storesEnv, `innerApps.${subName}`);
  return {
    stores,
    app: app,
    client: app && app.client,
    innerApps: app && app.innerApps || {}
  }
}


export type TAnyFunction = (...args: any[]) => void;

export function injectBehavior<T extends Record<string, any>, K>(storesEnv: IStoresEnv<K>, props: T, eventName: string, behaviors: TAnyFunction[]) {

  // 根据名字获取指定响应事件
  const eventFn = props[eventName] as TAnyFunction;
  type eventType = Parameters<typeof eventFn>;

  if (!eventFn) return;

  return function (...eventArgs: eventType) {

    // 给页面注入行为
    [].concat(behaviors).forEach(action => {
      action(storesEnv)(...eventArgs);
    });

    // 实现用户自定义的函数行为
    eventFn(...eventArgs);
  }
};

export interface IEventMap {
  [prop: string]: TAnyFunction[];
}

/**
 * 重新分配事件，使用 useCallback 来增强性能
 */
export function useInjectedEvents<T extends Record<string, any>, K>(storesEnv: IStoresEnv<K>, props: T, eventMap: IEventMap) {
  const injectedEvent: Record<string, any> = {};
  for (const eventName in eventMap) {
    // 获取函数
    const behaviors = eventMap[eventName];
    injectedEvent[eventName] = useCallback(injectBehavior<T, K>(storesEnv, props, eventName, behaviors), []);
  }

  return Object.assign({}, props, injectedEvent);
}
