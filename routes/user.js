const router = require('koa-router')();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const sequelize = require('sequelize');
const models = require('../model');
const redis = require('../lib/ioredis');
const miniProgramApi = require('../lib/mini-program-api');
const constv = require('../config/constv');
const config = require('../config');
const { md5 } = require('../util');
const middleware = require('../middleware');
const serviceAdmin = require('../service/admin').instance();
const serviceUserAdmin = require('../service/user_admin').instance();
const serviceChannelAdmin = require('../service/channel_admin').instance();
const serviceStoreEmployee = require('../service/store_employee').instance();
const serviceStore = require('../service/user_store').instance();

router.prefix('/api/v1');

router.post('/user/login', async (ctx) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  const body = ctx.request.body;

  const password = md5(`${body.password}:${config.passwordSalt}`);

  //TODO: can use Promise.all
  const result_user = await serviceUserAdmin.findOne({
    where: {
      phone: body.name,
      password,
    }
  });

  const result_channel = await serviceChannelAdmin.findOne({
    where: {
      phone: body.name,
      password,
    }
  });

  const result_admin = await serviceAdmin.findOne({
    where: {
      name: body.name,
      password,
    },
  });

  const result_employee = await serviceStoreEmployee.findOne({
    where: {
      name: body.name,
      password,
    },
  });

  if (!(result_user || result_channel || result_admin || result_employee)) {
    ctx.throw(400, '帐号或密码不正确');
  }

  let result = null;
  let type = null;

  if (result_admin) {
    result = result_admin;
    type = constv.ADMIN_USER_TYPE.ADMIN;
  }

  if (result_user) {
    result = result_user;
    result.id = result_user.user_id;
    delete result.user_id;
    type = constv.ADMIN_USER_TYPE.USER;
  }

  if (result_channel) {
    result = result_channel;
    result.id = result_channel.channel_id;
    delete result.channel_id;
    type = constv.ADMIN_USER_TYPE.CHANNEL;
  }

  if (result_employee) {
    result = result_employee;
    result.id = result_employee.id;
    type = constv.ADMIN_USER_TYPE.EMPLOYEE;
    const store = await serviceStore.findOne({
      where: {
        id: result_employee.store_id,
      },
    });
    result.user_id = store.user_id;
  }


  result.user_type = type;

  // generate token
  const EXPIRE_TIME = 60 * 60 * 16; // 16 hour
  const token = jwt.sign({
    id: result.id,
    type,
    name: result.name,
    user_id: result.user_id,
  }, constv.MINI_PROGRAM_TOKEN_SECRET, { expiresIn: EXPIRE_TIME });

  result.token = token;

  ctx.body = {
    data: result,
  };
});

router.get('/code2session', async (ctx) => {
  if (!ctx.query.js_code) {
    ctx.throw(400, 'js_code is required');
  }

  const result =  await miniProgramApi.code2Session(ctx.query.js_code);

  if (result.errcode) {
    ctx.throw(400, result.errmsg);
  }

  ctx.body = {
    data: {
      openid: result.openid,
    },
  };
});

router.post('/user/password/modify', middleware.miniProgramTokenRequired, async (ctx) => {
  const schema = Joi.object({
    password_old: Joi.string().trim().required(),
    password_new: Joi.string().trim().required(),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  const body = ctx.request.body;

  const password_old = md5(`${body.password_old}:${config.passwordSalt}`);

  let result = null;
  
  const password_new = md5(`${body.password_new}:${config.passwordSalt}`);
  
  if (ctx.user.type == constv.ADMIN_USER_TYPE.USER) {
    result = await serviceUserAdmin.update({
      password: password_new,
    }, {
      where: {
        user_id: ctx.user.id,
        password: password_old,
      },
      fields: ['password'],
    });
  } else if (ctx.user.type == constv.ADMIN_USER_TYPE.CHANNEL) {
    result = await serviceChannelAdmin.update({
      password: password_new,
    }, {
      where: {
        channel_id: ctx.user.id,
        password: password_old,
      },
      fields: ['password'],
    });
  } else if (ctx.user.type == constv.ADMIN_USER_TYPE.ADMIN) {
    result = await serviceAdmin.update({
      password: password_new,
    }, {
      where: {
        id: ctx.user.id,
        password: password_old,
      },
      fields: ['password'],
    });
  }

  if (result && result[0] < 1) {
    ctx.throw(400, '旧密码有误，请重新输入');
  }

  ctx.body = {
    code: 0,
    message: '更新成功',
  };
});

module.exports = router;
