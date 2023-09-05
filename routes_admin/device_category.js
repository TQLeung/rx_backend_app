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
const serviceDeviceCategory = require('../service/device_category').instance();
const serviceAdmin = require('../service/admin').instance();

router.prefix('/admin/device-category');

router.use(middleware.adminTokenRequired);

router.post('/', async (ctx) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    code: Joi.string().trim().length(2).required(),
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

  await serviceDeviceCategory.create(Object.assign(body, {
    operator_id: operator.id,
    operator_name: operator.name,
  }));


  ctx.body = {
    code: 0,
    message: '新建成功'
  };
});

router.get('/:id', async (ctx) => {
  const result = await serviceDeviceCategory.findOne({
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
    code: Joi.string().trim().length(2),
    remark: Joi.string().trim(),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  await serviceDeviceCategory.update(ctx.request.body, {
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

  const result = await serviceDeviceCategory.findAllByOption({
    where: condition,
    limit: pagination.pageSize,
    offset: pagination.offset,
    order: [
      ['created_at', 'DESC']
    ],
  });

  const count = await serviceDeviceCategory.count({
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
