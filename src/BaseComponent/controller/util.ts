import Application, { middlewareFunction } from 'ette';
import proxy from 'ette-proxy';
import { debugIO } from '../../lib/debug';

interface IProxyRule {
    name: string;
    targets: string[];
}

interface IRewrite {
    [prop: string]: string;
}

/**
 * 挂载 stores 、innerApps 到上下文中，注意这里的 next 必须要使用 async，否则 proxy 的时候将出现异步偏差
 * @param stores - store 模型
 * @param innerApps - innerApps 对象
 */
export const injectStoresAndInnerApps = (stores: any, innerApps: object = {}) => {
    return async (ctx: any, next: any) => {
        ctx.stores = stores;
        ctx.innerApps = innerApps;
        // 因为存在代理，url 中的路径将有可能被更改
        const originUrl = ctx.request.url;
        debugIO(`[${stores.id}] request: ${JSON.stringify(ctx.request.toJSON())}`);
        await next();
        debugIO(`[${stores.id}] [${ctx.request.method}] ${originUrl} ==> response: ${JSON.stringify(ctx.response.toJSON())}`);
    }
};

/**
 * 在 app 中快速应用代理规则
 * 比如将 请求 '/clients/schemaTree/nodes' 转发到 schemaTree 中的 '/nodes' 中去
 *
 * @param app - ette 实例
 * @param proxyRules -代理规则
 */
export const applyProxy = function (
    app: Application,
    proxyRules: IProxyRule | IProxyRule[]
) {
    const rules = [].concat(proxyRules);

    rules.forEach((rule: IProxyRule) => {
        const { name, targets } = rule;
        const rewrites: IRewrite = {};
        targets.forEach((target: string) => {
            rewrites[`^/clients/${name}/${target}`] = `/${target}`;
        });
        // 代理规则
        const newProxy = proxy(`/clients/${name}`, {
            defer: true,
            pathRewrite: rewrites
        });

        // 应用规则
        app.use(async (ctx: any, next: any) => {
            const { innerApps } = ctx;
            if (!innerApps[name]) {
                debugIO(
                    `[applyProxy] 在 innerApps 中不存在 ${name} 应用，不进行代理; rule: ${JSON.stringify(
                        rule
                    )}`
                );
                return next();
            }
            await (newProxy(innerApps[name]) as middlewareFunction)(ctx, next);
        });
    });
};
