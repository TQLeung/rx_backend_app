
const Koa = require('koa');
const path = require('path');
const koaBody = require('koa-body');
const json = require('koa-json');
const server = require('koa-static');
const load = require('./lib/load');
const middleware = require('./middleware');
const logger = require('./lib/logger');
const env = require('./config/env');
const compress = require('koa-compress');
const koaSession = require('koa-session');
const config = require('./config');
const redisSession = require('./lib/redis-session').instance();

const app = new Koa();
const sequelize = require('sequelize');
const auth = require('koa-basic-auth');

module.exports = app;

if (env.DOC_SERVER) {
  const apiDocApp = new Koa();
  apiDocApp.use(async (ctx, next) => {
    let err = null;
    try {
      await next();
    } catch (error) {
      err = error;
      if (err.status === 401) {
        ctx.status = 401;
        ctx.set('WWW-Authenticate', 'Basic');
        ctx.body = 'cant haz that';
      } else {
        throw err;
      }
    }
  });

  apiDocApp.use(auth({
    name: env.DOC_AUTH_NAME,
    pass: env.DOC_AUTH_PASSWORD,
  }));

  apiDocApp.use(server(path.join(__dirname, '/apidoc')));
  apiDocApp.listen(env.DOC_PORT);
}

app.use(koaBody({
  // files: true,
  multipart: true,
  fields: true,
  formidable: {},
  text: true,
  formLimit: '100mb',
  jsonLimit: '100mb',
  textLimit: '100mb',
}));

app.proxy = true;

app.use(middleware.crossOrigin);
app.use(middleware.requestLogger);
app.use(compress());
app.use(middleware.errorHandler);

app.use(json());

// mock service
env.IS_MOCK && app.use(middleware.mockService);

app.keys = [config.sessionKey];

app.use(koaSession({
  key: 'rx-sess',
  maxAge: 24 * 3600 * 1000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
  store: redisSession,
  secure: false,
  // sameSite: 'none',
}, app));

load(app, `${__dirname}/routes`);
load(app, `${__dirname}/routes_admin`);
load(app, `${__dirname}/routes_iot`);
load(app, `${__dirname}/routes_device`);

app.on('error', (err, ctx) => {
  const code = err.status || 500;
  const meta = {};
  if (ctx) {
    meta.path = ctx.path;
    meta.headers = JSON.stringify(ctx.headers);
    meta.query = JSON.stringify(ctx.request.query);
    meta.ip = ctx.ip;
    meta.ips = JSON.stringify(ctx.ips);
    meta.status = ctx.status;
    meta.body = JSON.stringify(ctx.request.body);
    meta.state = JSON.stringify(ctx.state);
    if (err instanceof sequelize.Error) {
      meta.original = err.original;
      meta.parent = err.parent;
      meta.sql = err.sql;
      meta.message = err.message;
      meta.name = err.name;
    }
  }
  if (err instanceof sequelize.Error) {
    logger.error(err, meta);
  } else if (code >= 500) {
    logger.error(err, meta);
  } else {
    logger.warn(err, meta);
  }
});

process.on('uncaughtException', (err) => {
  logger.info('catch uncaughtException error');
  logger.error(err);
});
