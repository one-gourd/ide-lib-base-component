import { IContext, isEtteApplication } from 'ette';
import { isExist } from 'ide-lib-utils';
import { debugModel, debugError } from '../../lib/debug';


/**
 * 统一的 response 结构
 *
 * @export
 * @param {IContext} ctx - ette 上下文对象
 * @param {number} [status=200] - 响应 code 
 * @param {*} data - 响应具体内容
 * @param {string} [message='SUCCESS'] - 响应消息文案
 */
export function buildNormalResponse(ctx: IContext, status = 200, data: any, message = 'SUCCESS') {
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
            subPrefixes[name] = `/clients/${name}`
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
    const {stores, innerApps} = ctx;
    const baseMsg = `正在从 ${stores.id} 中提取 ${subAppName} 中的 client`;
    if(!innerApps) {
        debugError(`${baseMsg}: 失败. 不存在 innerApps 对象；请前往 controller/index.js 检查是否将 innerApps 挂载到 app 对象上`);
        return;
    };

    const subApp = innerApps[subAppName];
    if (!subApp) {
        debugError(`${baseMsg}: 失败. innerApp 上不存在为名 ${subAppName} 子 app.`, subApp);
        return;
    }
    if (!isEtteApplication(subApp)){
        debugError(`${baseMsg}: 失败. innerApp.${subAppName} 不是合法的 ette 实例. %o`, subApp);
        return;
    }

    if(!subApp.client) {
        debugError(`${baseMsg}: 失败. 虽然 innerApp.${subAppName} 对象存在，但没有 client 属性: %o`, subApp);
        return;
    }

    debugModel(`${baseMsg}: 成功`);
    return subApp.client;
}