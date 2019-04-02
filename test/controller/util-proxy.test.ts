import {
  getRootPath,
  isSameRoot,
  aliasPathProxy,
  hoistSubRoutes
} from '../../src';
import * as Chance from 'chance';
import Ette, { Request, Response, Client, IContext } from 'ette';
import Router from 'ette-router';

const ORI_SERVERNAME = 'fromServer';

describe('[controller] getRootPath - 根据输入的路径获取 root 形式的路径', () => {
  test('空字符应当返回 "/"', () => {
    expect(getRootPath('')).toBe('/');
  });

  test('非根路径 "a/b" 应当转换成 "/a/b" ', () => {
    expect(getRootPath('a/b')).toBe('/a/b');
  });

  test('根路径 "/a/b" 仍旧为 "/a/b" ', () => {
    expect(getRootPath('/a/b')).toBe('/a/b');
  });
});

describe('[controller] isSameRoot - 判断是否是相同的根路径', () => {
  test('空字符都表示根路径', () => {
    expect(isSameRoot('', '')).toBeTruthy();
  });

  test('根路径的判断逻辑', () => {
    expect(isSameRoot('', '/')).toBeTruthy();
  });

  test('a 和 "/a" 是相同根路径', () => {
    expect(isSameRoot('a', '/a')).toBeTruthy();
  });

  test('/a 和 "/b" 是不同根路径', () => {
    expect(isSameRoot('a', 'b')).toBeFalsy();
    expect(isSameRoot('a/a', 'b/a')).toBeFalsy();
    expect(isSameRoot('a/b', 'b/a')).toBeFalsy();

    expect(isSameRoot('/a', '/b')).toBeFalsy();
    expect(isSameRoot('/a/a', '/b/a')).toBeFalsy();
    expect(isSameRoot('/a/b', '/b/a')).toBeFalsy();
  });
});

describe('[controller] aliasPathProxy - 重命名路径路由', () => {
  let app: Ette, router: Router, client: Client;

  beforeEach(() => {
    app = new Ette({ domain: ORI_SERVERNAME });
    router = new Router();
    client = app.client;

    // 代理后的请求
    router.get('sub-router', '/sub/api/user', function(ctx: IContext) {
      const query = ctx.request.query;
      ctx.response.body = {
        domain: ctx.app.domain,
        path: ctx.request.path,
        filter: query && query.filter
      };
      ctx.response.status = 204;
    });

    // 原始请求
    router.get('api-router', '/api/user', function(ctx: IContext) {
      const query = ctx.request.query;
      ctx.response.body = {
        domain: ctx.app.domain,
        path: ctx.request.path,
        filter: query && query.filter
      };
      ctx.response.status = 200;
    });
  });

  test('没有代理之前，请求返回 404', done => {
    // 挂载路由
    app.use(router.routes());

    client.get('/sub/api/user').then((res: Response) => {
      expect(res.body.domain).toBe(ORI_SERVERNAME);
      expect(res.body.path).toBe('/sub/api/user');
      expect(res.status).toBe(204);
    });

    client.get('/alias/user').then((res: Response) => {
      expect(res.body.domain).toBeUndefined();
      expect(res.body.path).toBeUndefined();
      expect(res.status).toBe(404);

      done();
    });
  });

  test('最基本的用法，将 /alias 重定向到 /sub/api，最终看到的效果和直接请求 /sub/api 一模一样的', done => {
    // 挂载路由
    app.use(router.routes());

    aliasPathProxy(app, {
      alias: '/alias',
      path: '/sub/api'
    });

    client.get('/sub/api/user').then((res: Response) => {
      expect(res.body.domain).toBe(ORI_SERVERNAME);
      expect(res.body.path).toBe('/sub/api/user');
      expect(res.status).toBe(204);
    });

    client.get('/alias/user').then((res: Response) => {
      expect(res.body.domain).toBe(ORI_SERVERNAME);
      expect(res.body.path).toBe('/sub/api/user');
      expect(res.status).toBe(204);

      done();
    });
  });

  test('支持多个代理规则', done => {
    // 挂载路由
    app.use(router.routes());

    aliasPathProxy(app, [
      {
        alias: '/aliasSub',
        path: '/sub/api'
      },
      {
        alias: '/aliasApi',
        path: '/api'
      }
    ]);

    client.get('/aliasSub/user').then((res: Response) => {
      expect(res.body.domain).toBe(ORI_SERVERNAME);
      expect(res.body.path).toBe('/sub/api/user');
      expect(res.status).toBe(204);
    });

    client.get('/aliasApi/user').then((res: Response) => {
      expect(res.body.domain).toBe(ORI_SERVERNAME);
      expect(res.body.path).toBe('/api/user');
      expect(res.status).toBe(200);

      done();
    });
  });

  describe('namespace 功能', () => {
    beforeEach(() => {
      // 挂载路由
      app.use(router.routes());
    });

    test('[namespace] 只支持目标 root 为 /sub 的 path 转发', done => {
      aliasPathProxy(
        app,
        [
          {
            alias: '/aliasSub',
            path: '/sub/api'
          },
          {
            alias: '/aliasApi',
            path: '/api'
          }
        ],
        'sub'
      );

      // 转发成功
      client.get('/aliasSub/user').then((res: Response) => {
        expect(res.body.domain).toBe(ORI_SERVERNAME);
        expect(res.body.path).toBe('/sub/api/user');
        expect(res.status).toBe(204);
      });

      // 转发失败
      client.get('/aliasApi/user').then((res: Response) => {
        expect(res.body.domain).toBeUndefined();
        expect(res.body.path).toBeUndefined();
        expect(res.status).toBe(404);
        done();
      });
    });

    test('[namespace] 只支持目标 root 为 /api 的 path 转发', done => {
      aliasPathProxy(
        app,
        [
          {
            alias: '/aliasSub',
            path: '/sub/api'
          },
          {
            alias: '/aliasApi',
            path: '/api'
          }
        ],
        'api'
      );

      // 转发成功
      client.get('/aliasSub/user').then((res: Response) => {
        expect(res.body.domain).toBeUndefined();
        expect(res.body.path).toBeUndefined();
        expect(res.status).toBe(404);
      });

      // 转发失败
      client.get('/aliasApi/user').then((res: Response) => {
        expect(res.body.domain).toBe(ORI_SERVERNAME);
        expect(res.body.path).toBe('/api/user');
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('边界情况处理', () => {
    test('[AliasRule] alias 不能为空(根目录)', () => {
      expect(() => {
        aliasPathProxy(app, [
          {
            alias: '',
            path: '/sub/api'
          }
        ]);
      }).toThrowError();
    });
    test('[AliasRule] path 不能为空(根目录)', () => {
      expect(() => {
        aliasPathProxy(app, [
          {
            alias: '/alias',
            path: ''
          }
        ]);
      }).toThrowError();
    });

    test('[AliasRule] alias 和 path 不能为同一个 root', () => {
      expect(() => {
        aliasPathProxy(app, [
          {
            alias: '/api',
            path: '/api/some'
          }
        ]);
      }).toThrowError();

      expect(() => {
        aliasPathProxy(app, [
          {
            alias: '/api/one',
            path: '/api/some'
          }
        ]);
      }).toThrowError();
    });
  });
});

describe('[controller] hoistSubRoutes - 提升子路径', () => {
  let app: Ette, router: Router, client: Client;

  beforeEach(() => {
    app = new Ette({ domain: ORI_SERVERNAME });
    router = new Router();
    client = app.client;

    // 子路由 1
    router.get('sub-router', '/clients/schemaTree/tree', function(
      ctx: IContext
    ) {
      const query = ctx.request.query;
      ctx.response.body = {
        domain: ctx.app.domain,
        path: ctx.request.path,
        filter: query && query.filter
      };
      ctx.response.status = 204;
    });

    // 自定义子路由 1
    router.get('sub-router-custome', '/subs/schemaTree/tree', function(
      ctx: IContext
    ) {
      const query = ctx.request.query;
      ctx.response.body = {
        domain: ctx.app.domain,
        path: ctx.request.path,
        filter: query && query.filter
      };
      ctx.response.status = 203;
    });

    // 子路由 2
    router.get(
      'sub-sub-router',
      '/clients/schemaTree/clients/contextMenu/position',
      function(ctx: IContext) {
        const query = ctx.request.query;
        ctx.response.body = {
          domain: ctx.app.domain,
          path: ctx.request.path,
          filter: query && query.filter
        };
        ctx.response.status = 200;
      }
    );

    // 自定义子路由 2
    router.get(
      'sub-sub-router',
      '/subs/schemaTree/subs/contextMenu/position',
      function(ctx: IContext) {
        const query = ctx.request.query;
        ctx.response.body = {
          domain: ctx.app.domain,
          path: ctx.request.path,
          filter: query && query.filter
        };
        ctx.response.status = 202;
      }
    );
  });

  test('支持多个路由提升规则', done => {
    // 挂载路由
    app.use(router.routes());

    hoistSubRoutes(app, [
      {
        alias: '/alias/schemaTree',
        routerNames: 'schemaTree'
      },
      {
        alias: '/alias/contextMenu',
        routerNames: ['schemaTree', 'contextMenu']
      }
    ]);

    client.get('/alias/schemaTree/tree').then((res: Response) => {
      expect(res.body.domain).toBe(ORI_SERVERNAME);
      expect(res.body.path).toBe('/clients/schemaTree/tree');
      expect(res.status).toBe(204);
    });

    client.get('/alias/contextMenu/position').then((res: Response) => {
      expect(res.body.domain).toBe(ORI_SERVERNAME);
      expect(res.body.path).toBe(
        '/clients/schemaTree/clients/contextMenu/position'
      );
      expect(res.status).toBe(200);

      done();
    });
  });

  test('支持自定义 namespace', done => {
    // 挂载路由
    app.use(router.routes());

    hoistSubRoutes(
      app,
      [
        {
          alias: '/alias/schemaTree',
          routerNames: 'schemaTree'
        },
        {
          alias: '/alias/contextMenu',
          routerNames: ['schemaTree', 'contextMenu']
        }
      ],
      'subs'
    );

    client.get('/alias/schemaTree/tree').then((res: Response) => {
      expect(res.body.domain).toBe(ORI_SERVERNAME);
      expect(res.body.path).toBe('/subs/schemaTree/tree');
      expect(res.status).toBe(203);
    });

    client.get('/alias/contextMenu/position').then((res: Response) => {
      expect(res.body.domain).toBe(ORI_SERVERNAME);
      expect(res.body.path).toBe('/subs/schemaTree/subs/contextMenu/position');
      expect(res.status).toBe(202);

      done();
    });
  });

  test('边界情况 namespace 不能和重定向 path 同根', () => {
    // 挂载路由
    app.use(router.routes());
    expect(()=>{
      hoistSubRoutes(
        app,
        [
          {
            alias: '/clients/schemaTree',
            routerNames: 'schemaTree'
          },
          {
            alias: '/clients/contextMenu',
            routerNames: ['schemaTree', 'contextMenu']
          }
        ],
        'clients'
      );
    }).toThrowError();
  });
});
