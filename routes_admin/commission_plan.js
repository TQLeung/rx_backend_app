const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { md5, paging } = require('../util');
const middleware = require('../middleware');
const serviceCommissionPlan = require('../service/commission_plan').instance();

router.prefix('/admin/commission-plan');
router.use(middleware.adminTokenRequired);

router.post('/', async (ctx) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    type: Joi.string().trim().valid(...Object.values(constv.COMMISSION_TYPE))
      .required(),
    discount: Joi.number().min(0).max(100).required(),
    renxin_amount: Joi.number().min(0).required(),
    agent_amount: Joi.number().min(0).required(),
    settlement_day: Joi.number().min(1).required(31),
    remark: Joi.string().trim(),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  const body = ctx.request.body;

  const result = await serviceCommissionPlan.create(body);

  ctx.body = {
    code: 0,
    message: '新建成功'
  };
});

router.put('/:id', async (ctx) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    type: Joi.string().trim().required(),
    discount: Joi.number().min(0).max(100).required(),
    renxin_amount: Joi.number().min(0).required(),
    agent_amount: Joi.number().min(0).required(),
    settlement_day: Joi.number().min(1).required(31),
    remark: Joi.string().trim(),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  const body = ctx.request.body;

  const result = await serviceCommissionPlan.update(body, {
    where: {
      id: ctx.params.id
    }
  });

  ctx.body = {
    code: 1,
    message: '更新成功'
  };
});

router.get('/:id', async (ctx) => {
  const result = await serviceCommissionPlan.findOne({
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

router.get('/', async (ctx) => {
  const pagination = paging(ctx.query);

  const condition = {};

  if (ctx.query.name) {
    condition.name = ctx.query.name;
  }

  const result = await serviceCommissionPlan.findAllByOption({
    where: condition,
    limit: pagination.pageSize,
    offset: pagination.offset,
    order: [
      ['created_at', 'DESC']
    ],
  });

  const count = await serviceCommissionPlan.count({
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

router.delete('/:id', async (ctx) => {

  await serviceCommissionPlan.destroy({
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

module.exports = router;
