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
const serviceDeviceCode = require('../service/device_code').instance();
const serviceAdmin = require('../service/admin').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();

router.prefix('/admin/device-code');

router.use(middleware.adminTokenRequired);

router.post('/', async (ctx) => {
  const schema = Joi.object({
    code: Joi.string().trim().length(19).required(),
    screen_code: Joi.string().trim().required(),
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

  await serviceDeviceCode.create(Object.assign(body, {
    operator_id: operator.id,
    operator_name: operator.name,
  }));

  ctx.body = {
    code: 0,
    message: '新建成功'
  };
});

router.get('/:id', async (ctx) => {
  const result = await serviceDeviceCode.findOne({
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
    code: Joi.string().trim().length(19),
    screen_code: Joi.string().trim(),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  await serviceDeviceCode.update(ctx.request.body, {
    where: {
      id: ctx.params.id,
    },
    fields: ['code', 'screen_code'],
  });

  ctx.body = {
    code: 1,
    message: '更新成功'
  };
});

router.delete('/:id', async (ctx) => {

  await serviceDeviceCode.destroy({
    where: {
      id: ctx.params.id,
      is_used: constv.DEVICE_CODE_IS_USED.NO,
    },
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

  if (ctx.query.screen_code) {
    condition.screen_code = ctx.query.screen_code;
  }

  const result = await serviceDeviceCode.findAllByOption({
    where: condition,
    limit: pagination.pageSize,
    offset: pagination.offset,
    order: [
      ['created_at', 'DESC']
    ],
  });

  const count = await serviceDeviceCode.count({
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

router.post('/:id/enable', async (ctx) => {
  const result = await serviceDeviceCode.update({
    is_used: constv.DEVICE_CODE_IS_USED.YES,
  }, {
    where: {
      id: ctx.params.id,
      is_used: constv.DEVICE_CODE_IS_USED.NO,
    },
    fields: ['is_used'],
  });

  // judgement update result
  if (result[0]) {
    const deviceRecord = await serviceDeviceCode.findOne({
      where: {
        id: ctx.params.id,
      },
    });

    if (!deviceRecord) {
      ctx.throw(400, 'no that device record');
    }

    await serviceDeviceJournal.create({
      device_id: deviceRecord.id,
      device_code: deviceRecord.code,
      status: constv.DEVICE_STATUS.IN_STOREHOUSE,
    });
  }

  ctx.body = {
    code: 1,
    message: '成功'
  };
});


module.exports = router;
