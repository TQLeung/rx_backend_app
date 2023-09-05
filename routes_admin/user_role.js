const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { md5, paging } = require('../util');
const sequelize = require('sequelize');
const middleware = require('../middleware');
const serviceUserRole = require('../service/user_role').instance();
const serviceRole = require('../service/role').instance();

router.prefix('/admin/user-role');

router.get('/', middleware.adminTokenRequired, async (ctx) => {
  const { user_id, user_type } = ctx.query;

  if (!user_id) {
    ctx.throw(400, 'user_id is required');
  }

  if (!user_type) {
    ctx.throw(400, 'user_type is required');
  }

  const result = await serviceUserRole.findAllByOption({
    where: {
      user_id,
      user_type,
    },
  });

  const role_data = await serviceRole.findAllByOption({
    where: {
      id: result.map(item => item.role_id),
    },
  });

  for (const user_role of result) {
    const role_data_item = role_data.find(item => item.id == user_role.role_id);
    user_role.role = role_data_item;
  }

  ctx.body = {
    code: 0,
    data: result,
    message: '获取成功',
  };
});


module.exports = router;
