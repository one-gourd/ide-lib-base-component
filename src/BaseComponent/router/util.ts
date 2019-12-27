import { IContext, isEtteApplication } from 'ette';
import {
  isExist,
  IPlainObject,
  getValueByPath,
  invariant,
  Debug
} from 'ide-lib-utils';
import { debugModel, debugError } from '../../lib/debug';

// 链路染色开关
const enableDebugDyer = Debug.enabled('dyer');

/* ----------------------------------------------------
    链路染色
----------------------------------------------------- */
export interface IDyerConfig {
  name: string; // 染色名
}

/**
 * 给请求添加 “染色” 配置，方便最终请求链路
 * 入参 dyerConfigOrName 可以是对象或者直接用 name
 *
 * @param {IDyerConfig | string} dyerConfigOrName - 染色配置
 * @param {IPlainObject} reqData - 请求数据
 * @returns
 */
export function addDyer(
  dyerConfigOrName: IDyerConfig | string,
  reqData: IPlainObject = {}
) {
  // 不开启开关的话，直接返回原始数据
  if (!enableDebugDyer) return reqData;

  let dyerConfig = dyerConfigOrName;
  if (typeof dyerConfigOrName === 'string') {
    dyerConfig = {
      name: dyerConfigOrName
    };
  } else {
    invariant(
      !!dyerConfigOrName.name,
      '[addDyer] dyer 配置项必须包含 name 属性'
    );
  }

  return {
    ...reqData,
    dyer: dyerConfig
  };
}

/**
 * 提取链路中的 dyer name 属性，方便给下一个路由串接
 *
 * @param {IContext} ctx - context 上下文
 * @returns
 */
export function extractDyerName(ctx: IContext) {
  if (!enableDebugDyer) return '';

  const dyerConfig = getValueByPath(ctx, 'request.data.dyer');
  return dyerConfig ? dyerConfig.name : '';
}

export interface IDyerJoinConfig {
  starterTag?: string;
  joiner?: string;
  style?: string;
}
export const DEFAULT_JOIN_CONIFG = {
  starterTag: '[R]',
  joiner: '->',
  style:
    'color:#8CB369;font-size:0.8rem;-webkit-text-stroke: 1px #8CB369;font-weight:bold'
};

/**
 * 当前的 dyer name 属性
 * 先抽取出当前的 ctx dyer 属性，然后和传入的 name 合并
 *
 * @param {IContext} ctx - context 对象
 * @param {string} name - 当前 dyer name
 * @param {IDyerJoinConfig} [joinConfig=DEFAULT_JOIN_CONIFG] - join配置
 * @returns
 */
export function createDyerName(
  ctx: IContext,
  name: string,
  joinConfig: IDyerJoinConfig = DEFAULT_JOIN_CONIFG
) {
  if (!enableDebugDyer) return '';

  const method = ctx.req.method;
  const prevDyerName = extractDyerName(ctx) || joinConfig.starterTag;
  return [prevDyerName, `[${method}]${name}`].join(joinConfig.joiner);
}

// 快捷方式，聚合 addDyer + createDyerName
export function addContextDyerName(
  ctx: IContext,
  name: string,
  reqData: IPlainObject = {}
) {
  return addDyer(createDyerName(ctx, name), reqData);
}

/**
 * 创建染色链路，通过 `debug=router:dyer` 开启 console 查看
 *
 * @param {IContext} ctx - context 对象
 * @param {IDyerJoinConfig} [joinConfig=DEFAULT_JOIN_CONIFG] - 染色配置项
 */
function buildDyeChain(
  ctx: IContext,
  joinConfig: IDyerJoinConfig = DEFAULT_JOIN_CONIFG
) {
// 只有在开启链路染色后方才进行渲染
  if (enableDebugDyer) {
    const apiName = ctx._matchedRouteName || 'unknown';
    //  这里可以打印 dyer name
    const dyerChain = createDyerName(ctx, apiName, joinConfig);
    if (dyerChain) {
      console.log('%c %s', joinConfig.style, dyerChain);
    }
  }
}

// ==================

/**
 * 统一的 response 结构
 *
 * @export
 * @param {IContext} ctx - ette 上下文对象
 * @param {number} [status=200] - 响应 code
 * @param {*} data - 响应具体内容
 * @param {string} [message='SUCCESS'] - 响应消息文案
 */
export function buildNormalResponse(
  ctx: IContext,
  status = 200,
  data: any,
  message = 'SUCCESS'
) {
  // 显示染色链路，方便排查问题
  buildDyeChain(ctx);

  ctx.response.status = status;
  ctx.response.body = {
    api: ctx._matchedRoute || 'unknown',
    apiName: ctx._matchedRouteName || 'unknown',
    request: ctx.request.toJSON(),
    data: data || {},
    success: isExist(data), // 如果有数据则为 true，不论数据内容长什么样
    message: message
  };
}

/**
 * 获取子组件的 router 前缀（即格式为 `/clients/schemaTree` 这样的格式）
 *
 * @template T
 * @param {T} appEnum
 * @returns {Record<keyof T, string>}
 */
export function getSubRouterPrefix<T>(appEnum: T): Record<keyof T, string> {
  const subPrefixes = {} as Record<keyof T, string>;
  for (const name in appEnum) {
    if (appEnum.hasOwnProperty(name)) {
      subPrefixes[name] = `/clients/${name}`;
    }
  }
  return subPrefixes;
}

/**
 * 从 ctx 中里提取出指定的子 client，方便进行子组件的请求转发
 *
 * @export
 * @param {Record<string, Application>} innerApps - innerApps 实例
 * @param {string} name - 子 app 名
 */
export function getClientFromCtx(ctx: IContext, subAppName: string) {
  const { stores, innerApps } = ctx;
  const baseMsg = `正在从 ${stores.id} 中提取 ${subAppName} 中的 client`;
  if (!innerApps) {
    debugError(
      `${baseMsg}: 失败. 不存在 innerApps 对象；请前往 controller/index.js 检查是否将 innerApps 挂载到 app 对象上`
    );
    return;
  }

  const subApp = innerApps[subAppName];
  if (!subApp) {
    debugError(
      `${baseMsg}: 失败. innerApp 上不存在为名 ${subAppName} 子 app.`,
      subApp
    );
    return;
  }
  if (!isEtteApplication(subApp)) {
    debugError(
      `${baseMsg}: 失败. innerApp.${subAppName} 不是合法的 ette 实例. %o`,
      subApp
    );
    return;
  }

  if (!subApp.client) {
    debugError(
      `${baseMsg}: 失败. 虽然 innerApp.${subAppName} 对象存在，但没有 client 属性: %o`,
      subApp
    );
    return;
  }

  debugModel(`${baseMsg}: 成功`);
  return subApp.client;
}
