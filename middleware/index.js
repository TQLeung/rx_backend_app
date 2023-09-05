const sequelize = require('sequelize');
const logger = require('../lib/logger').label('middleware');
const util = require('../util');
const crypto = require('crypto');
const request = require('request-promise');
const env = require('../config/env');
const jwt = require('jsonwebtoken');
const constv = require('../config/constv');
const redis = require('../lib/ioredis');
const config = require('../config');
const querystring = require('querystring');
const wechatpay_api = require('../lib/wechatpay-v3-api');

module.exports = {
  crossOrigin: async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin);
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Accept, X-Requested-With, x-api-token, x-captcha-id, x-captcha-token, x-admin-token, x-portal-token');
    ctx.set('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    ctx.set('Access-Control-Max-Age', 60 * 60 * 24);
    ctx.set('Access-Control-Allow-Credentials', true);
    if (ctx.method.toUpperCase() === 'OPTIONS') {
      ctx.status = 204;
      return;
    }
    await next();
  },
  requestLogger: async (ctx, next) => {
    // if(ctx.url?.startsWith('/kinco/iot')) {
    //   await next();
    // } else {
      const start = new Date();
      logger.info(JSON.stringify(ctx.request.body));
      await next();
      const ms = new Date() - start;
      logger.info(`${ctx.method} ${ctx.response.status} ${ctx.url} -- ${ms}ms`);
      logger.info(JSON.stringify(ctx.request.body));
    // }
  },
  errorHandler: async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      logger.info('header: ', ctx.request.header);
      logger.info('body: ', ctx.request.body);
      if (err.status && err.status < 500) {
        logger.warn(err.stack || err);
      } else if (err instanceof sequelize.Error) {
        logger.error({
          original: err.original,
          parent: err.parent,
          sql: err.sql,
          message: err.message,
          name: err.name,
        });
      } else {
        logger.error(err.stack || err);
      }

      if (err.status) {
        if (!ctx.headerSent) {
          ctx.status = err.status || 500;
          const {
            message,
          } = err;
          const errorBody = {
            code: ctx.status,
            message: message || 'error',
          };
          ctx.body = errorBody;
        }
      } else if (!ctx.headerSent) {
        ctx.status = err.status || 500;
        const errorBody = {
          code: ctx.status,
          message: 'Internal Server Error',
        };
        if (!util.isProduction()) {
          // errorBody.message = (err && err.message) || errorBody.message;
          if (err.name == 'SequelizeUniqueConstraintError') {
            errorBody.message = `【${Object.values(err.fields)}】记录已存在，请勿重复添加`;
          }
        }
        ctx.body = errorBody;
      }
    }
  },
  fixHeader: async (ctx, next) => {
    await next();
  },
  tokenRequired: async (ctx, next) => {
    const token = ctx.header[constv.TOKEN_KEY] || ctx.query[constv.TOKEN_KEY]
      || ctx.request.body[constv.TOKEN_KEY];
    if (!token) {
      ctx.throw(401);
    }

    // verify token
    try {
      const user = jwt.verify(token, constv.TOKEN_SECRET);
      user && (ctx.session = {
        admin: user,
      });
    } catch (err) {
      ctx.throw(401, err.name);
    }
    await next();
  },
  loginRequired: async (ctx, next) => {
    if (ctx.session && ctx.session.userId) {
      ctx.user = { id: ctx.session.userId };
      await next();
    } else {
      ctx.throw(401);
    }
  },
  isLoginByToken: async (ctx, next) => {
    // const token = ctx.header[constv.TOKEN_KEY] || ctx.query[constv.TOKEN_KEY]
    // || ctx.request.body[constv.TOKEN_KEY];
    // // verify token
    // try {
    //   if (token) {
    //     const record = jwt.verify(token, constv.TOKEN_SECRET);
    //     if (record) {
    //       ctx.user = { id: record.userId };
    //       ctx.isUserLogin = true;
    //     } else {
    //       ctx.isUserLogin = false;
    //     }
    //   }
    // } catch (err) {
    //   // ctx.throw(401, err.name);
    // }
    // await next();

    ctx.isUserLogin = false;

    if (ctx.session && ctx.session.userId) {
      ctx.user = { id: ctx.session.userId };
      ctx.isUserLogin = true;
    }

    await next();
  },
  adminTokenRequired: async (ctx, next) => {
    const token = ctx.header[constv.ADMIN_TOKEN_KEY] || ctx.query[constv.ADMIN_TOKEN_KEY];
    if (!token) {
      ctx.throw(401);
    }

    // verify token
    try {
      const user = jwt.verify(token, constv.ADMIN_TOKEN_SECRET);
      user && (ctx.session = {
        admin: user,
      });
    } catch (err) {
      ctx.throw(401, err.name);
    }
    await next();
  },
  isLoginByAdminToken: async (ctx, next) => {
    const token = ctx.header[constv.ADMIN_TOKEN_KEY] || ctx.query[constv.ADMIN_TOKEN_KEY];

    // verify token
    try {
      const user = jwt.verify(token, constv.ADMIN_TOKEN_SECRET);
      if (user) {
        ctx.admin = { id: user.userId };
        ctx.isAdminLogin = true;
      } else {
        ctx.isAdminLogin = true;
      }
    } catch (err) {
      // ctx.throw(401, err.name);
    }
    await next();
  },
  mockService: async (ctx, next) => {
    const prefix = env.MOCK_BASE_URL;
    const mockUrl = `${prefix}${ctx.request.path}`;
    const option = {
      url: mockUrl,
      method: ctx.request.method,
      json: true,
      headers: ctx.request.headers,
      qs: ctx.query,
    };
    const result = await request(option);
    ctx.body = result;

    // no need
    // await next();
  },
  captchaRequired: async (ctx, next) => {
    const captchaId = ctx.header[constv.CAPTCHA_ID_KEY] || ctx.query[constv.CAPTCHA_ID_KEY];
    const captchaToken = ctx.header[constv.CAPTCHA_TOKEN_KEY]
      || ctx.query[constv.CAPTCHA_TOKEN_KEY];
    if (!captchaId || !captchaToken) {
      ctx.throw(400, 'captcha required');
    }

    const token = await redis.get(`${constv.REDIS_KEY.CAPTCHA}${captchaId}`);
    redis.del(`${constv.REDIS_KEY.CAPTCHA}${captchaId}`);
    if (token === captchaToken) {
      await next();
    } else {
      ctx.throw(400, 'captcha required');
    }
  },
  adminLoginRequired: async (ctx, next) => {
    if (ctx.session && ctx.session.admin) {
      await next();
    } else {
      ctx.throw(401);
    }

  },
  adminRootRequired: async (ctx, next) => {
    const admin = ctx.session.admin;
    if (admin.type == constv.ADMIN_USER_TYPE.ADMIN) {
      await next();
    } else {
      ctx.throw(401);
    }

  },
  miniProgramTokenRequired: async (ctx, next) => {
    const token = ctx.header[constv.MINI_PROGRAM_TOKEN_KEY] || ctx.query[constv.MINI_PROGRAM_TOKEN_KEY]
      || ctx.request.body[constv.MINI_PROGRAM_TOKEN_KEY];
    if (!token) {
      ctx.throw(401);
    }

    // verify token
    try {
      const user = jwt.verify(token, constv.MINI_PROGRAM_TOKEN_SECRET);
      user && (ctx.user = user);

      logger.info('##### mini program logined user: ', user);
    } catch (err) {
      ctx.throw(401, err.name);
    }
    await next();
  },
  deviceTokenRequired: async (ctx, next) => {
    const token = ctx.header[constv.DEVICE_TOKEN_KEY] || ctx.query[constv.DEVICE_TOKEN_KEY]
      || ctx.request.body[constv.DEVICE_TOKEN_KEY];
    if (!token) {
      ctx.throw(401);
    }

    // verify token
    try {
      const user = jwt.verify(token, constv.DEVICE_TOKEN_SECRET);
      user && (ctx.user = user);

      logger.info('##### device side logined user: ', user);
    } catch (err) {
      ctx.throw(401, err.name);
    }
    await next();
  },
  userRequiredOnMiniProgram: async (ctx, next) => {
    if (ctx.user && ctx.user.type == constv.ADMIN_USER_TYPE.USER) {
      await next();
    } else {
      ctx.throw(400, '非客户帐号');
    }
  },
  verifySign4WechatPay: async (ctx, next) => {
    const timestamp = ctx.header['wechatpay-timestamp'];
    const nonce = ctx.header['wechatpay-nonce'];
    const body = ctx.request.body;
    const signature = ctx.header['wechatpay-signature'];
    const serial = ctx.header['wechatpay-serial'];

    const options = {
      timestamp,
      nonce,
      serial,
      body,
      signature,
    };

    logger.info('#####: wechat pay notify arguement: ', JSON.stringify(options));

    try {
      const flag = await wechatpay_api.verifySign(options);
      if (flag) {
        await next();
      } else {
        ctx.throw(401, 'wechat pay verify sign fail');
      }
    } catch (err) {
      ctx.throw(401, err);
    }
  },
};
