import Ette, { Request, Response, Client, IContext } from 'ette';
import Router from 'ette-router';
import { aliasPathProxy } from '../src';

const ORI_SERVERNAME = 'fromServer';
const app = new Ette({ domain: ORI_SERVERNAME });
const router = new Router();
const client = app.client;

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

// client.get('/aliasSub/user').then((res: Response) => {
//   console.log(555, res);

//   expect(res.body.domain).toBe(ORI_SERVERNAME);
//   expect(res.body.path).toBe('/sub/api/user');
//   expect(res.status).toBe(204);
// });

export const test = function() {
  client.get('/aliasSub/user').then((res: Response) => {
    console.log(555, res);
  });
  client.get('/aliasApi/user').then((res: Response) => {
    console.log(666, res);
  });
};
