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
const serviceCommissionPlan = require('../service/commission_plan').instance();

router.prefix('/api/v1');
router.use(middleware.miniProgramTokenRequired);

router.get('/commission-plan', async (ctx) => {

  const commissionPlan = await serviceCommissionPlan.findAllByOption({
    where: {

    },
  });

  ctx.body = {
    code: 0,
    data: commissionPlan,
    message: '获取成功',
  };

});

module.exports = router;
