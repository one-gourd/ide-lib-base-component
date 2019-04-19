import React, { useCallback, useRef, useEffect, useState, useLayoutEffect } from 'react';
import Application, { Client } from 'ette';
import { reaction } from 'mobx';
import { useDisposable } from 'mobx-react-lite';
import { ThemeProvider } from 'styled-components';
import { getValueByPath } from 'ide-lib-utils';
import useComponentSize from '@rehooks/component-size'

import { TAnyMSTModel } from './schema/stores';
import { debugRender, debugModel } from '../lib/debug';
import { getDisplayName } from '../lib/util';

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type OptionalProps<T, K> = T | Omit<T, K>;
export type ValueOf<T> = T[keyof T];

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

export interface IBaseComponentEvent {
  /**
   * 当指定的 model 有更改的时候
   */
  onModelChange?: TModelChangeHandler;

}

export interface IBaseComponentProps extends IBaseComponentEvent {
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
}


export interface ISizeArea {
  point: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}


/**
 * 根据 ref 获取组件尺寸
 *
 * @param {React.MutableRefObject<any>} refContent
 */
export const getSizeArea = (refContent: React.RefObject<any>, componentSize: ISizeArea["size"]) =>{
  const rect = refContent.current && refContent.current.getBoundingClientRect() || {left: 0, top: 0};

  const area: ISizeArea = {
    point: {
      x: rect.left,
      y: rect.top
    },
    size: componentSize
  };

  return area;
}

export function useSizeArea(ref: React.RefObject<any>) {
  const componentSize = useComponentSize(ref);
  const [areaSize, setAreaSize] = useState(getSizeArea(ref, componentSize))
  // 用于获取元素尺寸
  useLayoutEffect(() => {
    // 获取组件的 offset 和 size 属性
    setAreaSize(getSizeArea(ref, componentSize));
  }, [componentSize, ref]);

  return areaSize;
}

/**
 * 使用高阶组件默认注入 theme 和 css 组件
 * 
 * 
 * @param {React.SFC<IBaseComponentProps>} WrappedComponent - 原组件 
 * @param {IBaseComponentProps} [defaultProps={}] - 默认属性
 * @param {boolean} [classed=false] - 是否转换成 class 组件
 */
export const based = (
  WrappedComponent: React.SFC<IBaseComponentProps>,
  defaultProps: IBaseComponentProps = {}
) => {
  const BaseComponent = function(props: IBaseComponentProps) {
    // const { SchemaTreeComponent } = subComponents;
    const { styles = {}, theme = {}, ...otherProps } = props;
    const mergedProps = Object.assign({}, defaultProps, otherProps);

    // 针对 styles、theme 做次级融合的处理
    mergedProps.styles = Object.assign({}, defaultProps.styles || {}, styles);
    mergedProps.theme = Object.assign({}, defaultProps.theme || {}, theme);

    debugRender('[based] 接收到的 props: %o', props);
    return (
      <ThemeProvider theme={mergedProps.theme}>
        <WrappedComponent {...mergedProps} />
      </ThemeProvider>
    );
  };

  BaseComponent.displayName = `Based${getDisplayName(WrappedComponent)}`;
  return BaseComponent;
};


/* ----------------------------------------------------
    以下是专门配合 store 时的工具函数
----------------------------------------------------- */
/**
 * get the previous props or state. 获取前一次渲染时的值
 * refer: https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-states
 * @param value - 任何 props、state 等属性值
 */
export function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

/* ----------------------------------------------------
    以下是专门配合 store 时的工具函数
----------------------------------------------------- */

export interface IStoresEnv<T> {
  stores: T;
  app: Application;
  client: Client;
  innerApps?: Record<string, Application>;
}

export function extracSubEnv<T, K>(storesEnv: IStoresEnv<T>, subName: string) {
  const stores: K = getValueByPath(storesEnv, `stores.${subName}`);
  const app = getValueByPath(storesEnv, `innerApps.${subName}`);
  return {
    stores,
    app: app,
    client: app && app.client,
    innerApps: (app && app.innerApps) || {}
  };
}

export type TAnyFunction = (...args: any[]) => void;

export interface IActionContext {
  context: { [key: string]: any }
}

export function injectBehavior<T extends Record<string, any>, K>(
  storesEnv: IStoresEnv<K>,
  props: T,
  eventName: string,
  behaviors: TAnyFunction[]
) {
  // 根据名字获取指定响应事件
  const eventFn = props[eventName] as TAnyFunction;
  type eventType = Parameters<typeof eventFn>;

  // if (!eventFn) return;

  return function(...eventArgs: eventType) {
    // 为了方便组件内部传递状态变量，给每个 action 新增上下文属性
    const actionContext: IActionContext = {context:{}};

    // 给页面注入行为
    [].concat(behaviors).forEach(action => {
      action(storesEnv, actionContext)(...eventArgs);
    });

    // 实现用户自定义的函数行为
    if (eventFn) {
      return eventFn(...eventArgs, actionContext);
    }
  };
}

export interface IEventMap {
  [prop: string]: TAnyFunction[];
}

/**
 * 重新分配事件，使用 useCallback 来增强性能
 */
export function useInjectedEvents<T extends Record<string, any>, K>(
  storesEnv: IStoresEnv<K>,
  props: T,
  eventMap: IEventMap
) {
  const injectedEvent: Record<string, any> = {};
  for (const eventName in eventMap) {
    // 获取函数
    const behaviors = eventMap[eventName];
    injectedEvent[eventName] = useCallback(
      injectBehavior<T, K>(storesEnv, props, eventName, behaviors),
      [props[eventName]]
    );
  }

  return Object.assign({}, props, injectedEvent);
}

// 处理 model change 的回调函数类型
export type TModelChangeHandler = (key: string, value: any) => void;

/**
 * 注册 mst model 制定属性变更时的回调函数
 * 场景：当我们 schema tree 有更新的的时候，想要自动调用 hander 来处理一些副作用（比如刷新预览页面）
 *
 * @param model - 想要监听的 model 对象（mst 对象）
 * @param keys - 要监听的属性
 * @param handler - model 属性变更时调用的回调函数
 */
export function addModelChangeListener(
  model: TAnyMSTModel,
  keys: string | string[],
  handler: TModelChangeHandler
) {
  if (!model) {
    debugModel('[addModelChangeListener] 没有 model 对象，不注册');
    return;
  }

  if (!keys || !keys.length) {
    debugModel(
      `[addModelChangeListener] 没有指定要监听的属性列表 (keys:${keys})，不注册`
    );
    return;
  }

  if (!handler) {
    debugModel(`[addModelChangeListener] 没有指定要监听的 handler，不注册`);
    return;
  }

  const targetKeys = [].concat(keys);
  // 监听各个属性
  targetKeys.forEach((key: string) => {
    useDisposable(
      () =>
        reaction(
          () => (model[key].toJSON ? model[key].toJSON() : model[key]), // 兼容普通对象，不过话说回来普通对象并不是这个函数的目的；（也触发不了）
          () => {
            // change
            debugModel(
              `监听到 model['${key}'] 有变更，将执行 onModelChange 方法. %o`,
              model[key]
            );
            handler(key, model[key]);
          }
        ),
      [model[key]]
    );
  });
}
