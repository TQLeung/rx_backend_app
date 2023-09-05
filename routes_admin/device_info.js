const router = require('koa-router')();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const sequelize = require('sequelize');
const models = require('../model');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { paging } = require('../util');
const middleware = require('../middleware');
const serviceDeviceInfo = require('../service/device_info').instance();
const serviceAdmin = require('../service/admin').instance();

router.prefix('/admin/device-info');

router.use(middleware.adminTokenRequired);

router.post('/', async (ctx) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    category: Joi.string().trim().required(),
    category_code: Joi.string().trim().length(2).required(),
    type: Joi.string().trim().required(),
    type_code: Joi.string().trim().length(2).required(),
    version: Joi.string().trim().required(),
    version_code: Joi.string().trim().length(2).required(),
    standard: Joi.string().trim(),
    voltage: Joi.string().trim(),
    electric_current: Joi.string().trim(),
    rate: Joi.string().trim(),
    power: Joi.string().trim(),
    net_weight: Joi.string().trim(),
    remark: Joi.string().trim(),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  const body = ctx.request.body;

  const operator = await serviceAdmin.findOne({
    where: {
      id: ctx.session.admin.id,
    },
  });

  // TODO: check category_code from db

  await serviceDeviceInfo.create(Object.assign(body, {
    operator_id: operator.id,
    operator_name: operator.name,
  }));

  ctx.body = {
    code: 0,
    message: '新建成功'
  };
});

router.get('/:id', async (ctx) => {
  const result = await serviceDeviceInfo.findOne({
    where: {
      id: ctx.params.id,
    },
  });

  ctx.body = {
    code: 0,
    data: result,
    message: '获取成功',
  };
});

router.put('/:id', async (ctx) => {
  const schema = Joi.object({
    name: Joi.string().trim(),
    category: Joi.string().trim(),
    category_code: Joi.string().trim().length(2),
    type: Joi.string().trim(),
    type_code: Joi.string().trim().length(2),
    version: Joi.string().trim(),
    version_code: Joi.string().trim().length(2),
    standard: Joi.string().trim(),
    voltage: Joi.string().trim(),
    electric_current: Joi.string().trim(),
    rate: Joi.string().trim(),
    power: Joi.string().trim(),
    net_weight: Joi.string().trim(),
    remark: Joi.string().trim(),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  await serviceDeviceInfo.update(ctx.request.body, {
    where: {
      id: ctx.params.id,
    },
    force: true,
  });

  ctx.body = {
    code: 1,
    message: '更新成功'
  };
});

router.delete('/:id', async (ctx) => {

  await serviceDeviceInfo.destroy({
    where: {
      id: ctx.params.id,
    },
    force: true,
  });

  ctx.body = {
    code: 3,
    message: '删除成功'
  }
});

router.get('/', async (ctx) => {
  const pagination = paging(ctx.query);

  const condition = {};

  if (ctx.query.code) {
    condition.code = ctx.query.code;
  }

  if (ctx.query.name) {
    condition.name = ctx.query.name;
  }

  const result = await serviceDeviceInfo.findAllByOption({
    where: condition,
    limit: pagination.pageSize,
    offset: pagination.offset,
    order: [
      ['created_at', 'DESC']
    ],
  });

  const count = await serviceDeviceInfo.count({
    where: condition,
  });
  pagination.total = count;

  ctx.body = {
    code: 0,
    data: result,
    paging: pagination,
    message: '获取成功',
  };
});

module.exports = router;
