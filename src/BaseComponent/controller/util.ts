import Application, { middlewareFunction } from 'ette';
import proxy from 'ette-proxy';

import { debugIO, debugError } from '../../lib/debug';
import { invariant } from 'ide-lib-utils';

export interface IProxyRule {
  name: string;
  targets: string[];
}

export interface IRewrite {
  [prop: string]: string;
}

/**
 * 挂载 stores 、innerApps 到上下文中，注意这里的 next 必须要使用 async，否则 proxy 的时候将出现异步偏差
 * @param stores - store 模型
 * @param innerApps - innerApps 对象
 */
export const injectStoresAndInnerApps = (
  stores: any,
  innerApps: object = {}
) => {
  return async (ctx: any, next: any) => {
    ctx.stores = stores;
    ctx.innerApps = innerApps;
    // 因为存在代理，url 中的路径将有可能被更改
    const originUrl = ctx.request.url;
    debugIO(`[${stores.id}] request: ${JSON.stringify(ctx.request.toJSON())}`);
    await next();
    debugIO(
      `[${stores.id}] [${
        ctx.request.method
      }] ${originUrl} ==> response: ${JSON.stringify(ctx.response.toJSON())}`
    );
  };
};

/**
 * 在 app 中快速应用代理规则，请求转发；是从 A 应用转发到 B 应用中去
 * 比如将 请求 '/clients/schemaTree/nodes' 转发到 schemaTree 中的 '/nodes' 中去
 * @param {Application} app - ette 实例
 * @param {(IProxyRule | IProxyRule[])} proxyRules - 代理规则
 * @param {string} namespace - 代理后的命名空间
 */
export const applyProxy = function(
  app: Application,
  proxyRules: IProxyRule | IProxyRule[],
  namespace: string = 'clients'
) {
  invariant(!!namespace, '[applyProxy] 进行路径代理的时候，namespace 不能为空');
  const rules = [].concat(proxyRules);

  rules.forEach((rule: IProxyRule) => {
    const { name, targets } = rule;
    const rewrites: IRewrite = {};
    targets.forEach((target: string) => {
      rewrites[`^/${namespace}/${name}/${target}`] = `/${target}`;
    });
    // 代理规则，使用 defer 功能
    const newProxy = proxy(`/${namespace}/${name}`, {
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

export interface IAliasRule {
  alias: string;
  path: string;
}

/**
 * 将路径格式化成根路径格式
 * 比如将 'a/b/c' --> ’/a/b/c'
 *
 * @param {string} path - 路径
 */
export function getRootPath(path: string = '') {
  if (!path) return '/';

  const pathArr = path.split('/');
  if (pathArr[0] !== '') {
    pathArr.unshift('');
    return pathArr.join('/');
  } else {
    //   已经是根路径格式，所以就直接返回
    return path;
  }
}

/**
 * 判断两个 path 是否是同一个 root
 *
 * @export
 * @param {string} path1 - 路径 1
 * @param {string} path2 - 路径 2
 * @returns {boolean} 是否同 root
 * @example
 *  isSameRoot('/a/b/c', '/a/c/d'); // true
 *  isSameRoot('/a/b/c', '/d/b/c'); // false
 *
 */
export function isSameRoot(path1: string, path2: string): boolean {
  return getRootPath(path1).split('/')[1] === getRootPath(path2).split('/')[1];
}

/**
 * 同一个应用中重命名请求路径，只涉及到单个 app （这一点是和上述 `applyProxy` 最大的区别）
 * 可以理解为 app 内带有约束的 **重定向** 功能，请求 /a 会重定向到 /b/d 这样的功能
 * 目的是为了精简请求路径的编写，在大型应用中如果要请求子组件中的子组件，路径很很深，通过这个方法来精简
 * 注：alias 和普通的重定向区别，在于有更强的约束：
 *  - 不能在同一个根目录下重定向（导致回环代理）
 *  - 可以限定在 namespace 空间中重定向
 *
 * @param {Application} app - ette 实例
 * @param {(IAliasRule | IAliasRule[])} aliasRules - 重命名规则
 * @param {string} namespace - 用于重命名的空间，用于校验将要重命名的路径，防止代理回环
 */
export function aliasPathProxy(
  app: Application,
  aliasRules: IAliasRule | IAliasRule[],
  namespace: string = ''
) {
  const rules = [].concat(aliasRules);
  rules.forEach((rule: IAliasRule) => {
    const { path, alias } = rule;
    invariant(!!alias, '[aliasPathProxy] alias 不能为空');
    invariant(!!path, '[aliasPathProxy] path 不能为空');

    // 处理路径，确保在根路径下: /a/b/c
    const pathWithRoot = getRootPath(path);
    const aliasWithRoot = getRootPath(alias);

    // 首先确保 path 和 alias 不能用同一个父目录下,防止代理回环
    invariant(
      !isSameRoot(pathWithRoot, aliasWithRoot),
      `[aliasPathProxy] path: ${pathWithRoot} 不应该和 alias: ${aliasWithRoot} 有相同的 root ，会出现代理回环`
    );

    // 如果设置了命名空间，则需要确保 path 要在命名空间下
    if (!!namespace) {
      if (!isSameRoot(pathWithRoot, `/${namespace}`)) {
        debugError(
          `[aliasPathProxy] 因 {path: ${path}, alias: ${alias}} 中 path 不在 ${namespace} 下，该 alias 规则不生效. 请检查`
        );
        return; // 跳过这一次循环
      }
    }

    // 应用 proxy 规则
    const rewriter: IRewrite = {};
    rewriter[aliasWithRoot] = pathWithRoot;
    const proxyMw = proxy(aliasWithRoot, {
      target: app,
      pathRewrite: rewriter
    });
    // 应用规则
    app.use(proxyMw as middlewareFunction);
  });
}

export interface IAliasRoute {
  alias: string;
  routerNames: string | string[];
}

/**
 * 提升子组件路由路径，相当于是 `aliasPathProxy` 的进一层包装，方便调用
 * 比如将 `/clients/schemaTree/clients/contextMenu` 这么长的路径简化成 `/contextMenu` 调用
 *
 * @param {Application} app - app 实例
 * @param {(IAliasRoute | IAliasRoute[])} aliasRoutes - 路由提升映射表
 * @param {string} [namespace='clients'] - 命名空间
 */
export function hoistSubRoutes(
  app: Application,
  aliasRoutes: IAliasRoute | IAliasRoute[],
  namespace: string = 'clients'
) {
  // 将 `aliasMaps` 转换成 `aliasRules`
  const routes = [].concat(aliasRoutes);
  if (!routes.length) return;

  const rules = routes.map((routeAlias: IAliasRoute) => {
    return {
      alias: routeAlias.alias,
      path: [].concat(routeAlias.routerNames).reduce((result, routerName) => {
        result += `/${namespace}/${routerName}`;
        return result;
      }, '')
    };
  });

  return aliasPathProxy(app, rules, namespace);
}

/**
 * 判断 ette 请求返回的 code 码是否是 expectedCode（默认是 200）
 * 一般正常情况下是 200 的返回值，如果请求跑飞了，一般会返回 404
 *
 * @param {Response} res - ette response 对象
 * @param {(string | string[])} [keywords] - 方便用户给开发者定位问题的关键词
 * @param {string} [msg='请求失败，请联系开发者排查'] - 显示的提示文案
 * @param {number} [expectedCode=200] - 期望的响应值 code
 * @returns {boolean} 是否符合期望的响应值
 */
export function hasEtteException(
  res: Response,
  keywords?: string | string[],
  msg: string = '请求失败，请联系开发者排查',
  expectedCode = 200
) {
  if (res.status !== expectedCode) {
    // 有关键词才显示提示
    if (!!keywords) {
      keywords = [].concat(keywords);
      console.info(`${msg} 关键词 [${keywords.join(' ')}]`);
    }
    return true;
  } else {
    return false;
  }
}
