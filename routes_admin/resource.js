const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { md5, paging } = require('../util');
const middleware = require('../middleware');
const serviceResource = require('../service/resource').instance();

router.prefix('/admin/resource');

router.get('/', middleware.adminTokenRequired, async (ctx) => {
	const result = await serviceResource.findAllByOption({});

	ctx.body = {
		code: 0,
		data: result,
		message: '获取成功',
	};
});


module.exports = router;
