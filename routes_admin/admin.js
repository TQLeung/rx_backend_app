const router = require('koa-router')();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const sequelize = require('sequelize');
const models = require('../model');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { md5 } = require('../util');
const middleware = require('../middleware');
const serviceAdmin = require('../service/admin').instance();
const serviceUserAdmin = require('../service/user_admin').instance();
const serviceChannelAdmin = require('../service/channel_admin').instance();
const serviceUserRole = require('../service/user_role').instance();
const serviceRolePermission = require('../service/role_permission').instance();
const serviceRole = require('../service/role').instance();
const serviceResource = require('../service/resource').instance();

router.prefix('/admin');

router.post('/login', async (ctx) => {
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

  const result_admin = await serviceAdmin.findOne({
    where: {
      name: body.name,
      password,
    },
  });

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

  if (!(result_admin || result_user || result_channel)) {
    ctx.throw(400, '查无此人');
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

  result.admin_type = type;

  // generate token
  const EXPIRE_TIME = 60 * 60 * 16; // 16 hour
  const token = jwt.sign({
    id: result.id,
    type,
    name: result.name,
  }, constv.ADMIN_TOKEN_SECRET, { expiresIn: EXPIRE_TIME });

  result.token = token;

  // find the login user role
  const user_role_data = await serviceUserRole.findAllByOption({
    where: {
      user_id: result.id,
      user_type: type,
    },
    attributes: ['role_id'],
  });

  // find the role permission
  const role_permission_data = await serviceRolePermission.findAllByOption({
    where: {
      role_id: user_role_data.map(item => item.role_id)
    },
    attributes: ['resource_id'],
  });

  // find the resource data
  const resource_data = await serviceResource.findAllByOption({
    where: {
      id: role_permission_data.map(item => item.resource_id),
    },
  });

  result.role_permission = resource_data;

  ctx.session.admin = {
    id: result.id,
    type,
    name: result.name,
  };

  ctx.body = {
    code: 0,
    data: result,
    message: ''
  };
});

router.post('/', middleware.adminTokenRequired, middleware.adminRootRequired, async (ctx) => {
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

  const result = await serviceAdmin.create({
    name: body.name,
    role: body.role,
    password,
  });

  ctx.body = {
    code: 0,
    data: {
      id: result.id,
      name: result.name,
      role: result.role,
      created_at: result.created_at,
    },
    message: '',
  };
});

router.put('/:id', middleware.adminTokenRequired, middleware.adminRootRequired, async (ctx) => {
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

  const result = await serviceAdmin.create({
    name: body.name,
    password,
  });

  ctx.body = {
    code: 1,
    message: '更新成功',
  };
});

module.exports = router;
