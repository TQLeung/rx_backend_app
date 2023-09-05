const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { md5, paging } = require('../util');
const middleware = require('../middleware');
const serviceResource = require('../service/resource').instance();
const areaData = require('../resource/area-data.json');

router.prefix('/admin/util/area-data');

router.get('/', async (ctx) => {
	ctx.body = {
		code: 0,
		data: areaData,
		message: '获取成功',
	};
});


module.exports = router;
