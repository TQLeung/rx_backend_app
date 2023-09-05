const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const models = require('../model');
const redis = require('../lib/ioredis');
const logger = require('../lib/logger').label('route-admin:channel');
const constv = require('../config/constv');
const config = require('../config');
const { md5, paging, preZeroFill } = require('../util');
const { Op } = require('sequelize');
const middleware = require('../middleware');
const serviceChannel = require('../service/channel').instance();
const serviceUser = require('../service/user').instance();
const serviceChannelAdmin = require('../service/channel_admin').instance();

router.prefix('/admin/channel');
router.use(middleware.adminTokenRequired);

router.post('/', async (ctx) => {
	const schema = Joi.object({
		name: Joi.string().trim().required(),
		company: Joi.string().trim().required(),
		tax_number: Joi.string().trim().required(),
		phone: Joi.string().trim().length(11).required(),
		contact: Joi.string().trim().required(),
		password: Joi.string().trim().required(),
		province: Joi.string().trim().required(),
		province_code: Joi.string().trim().required(),
		city: Joi.string().trim().required(),
		city_code: Joi.string().trim().required(),
		area: Joi.string().trim().required(),
		area_code: Joi.string().trim().required(),
		operation_mode: Joi.string().trim().valid(Object.values(constv.OPERATION_MODE)),
		payment_account: Joi.string().trim(),
		remark: Joi.string().trim(),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	const body = ctx.request.body;

	const password = md5(`${body.password}:${config.passwordSalt}`);

	// generate channel code
	let max_code = await serviceChannel.max('code');

	let number = 0;
	if (max_code) {
		number = parseInt(max_code.slice(2));
	}

	// channel code rule: 'QD'+ 5 number; eg, QD00001
	const code_str = `QD${preZeroFill(number + 1, 5)}`;

	const result = await serviceChannel.create(Object.assign(body, {
		code: code_str,
		password,
	}));

	ctx.body = {
		code: 0,
		message: '新建成功'
	};
});

router.put('/:id', async (ctx) => {
	const schema = Joi.object({
		name: Joi.string().trim().required(),
		company: Joi.string().trim().required(),
		tax_number: Joi.string().trim().required(),
		phone: Joi.string().trim().length(11).required(),
		contact: Joi.string().trim().required(),
		password: Joi.string().trim().required(),
		province: Joi.string().trim().required(),
		province_code: Joi.string().trim().required(),
		city: Joi.string().trim().required(),
		city_code: Joi.string().trim().required(),
		area: Joi.string().trim().required(),
		area_code: Joi.string().trim().required(),
		operation_mode: Joi.string().trim().valid(Object.values(constv.OPERATION_MODE)),
		payment_account: Joi.string().trim(),
		remark: Joi.string().trim(),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	const body = ctx.request.body;

	const password = md5(`${body.password}:${config.passwordSalt}`);

	const trx = await db.transaction();

	try {
		const result = await serviceChannel.update(Object.assign(body, { password }), {
			where: {
				id: ctx.params.id
			},
			transaction: trx,
		});

		if (body.name || body.phone) {
			const data2update = {};
			body.name && (data2update.name = body.name);
			body.phone && (data2update.phone = body.phone);

			await serviceChannelAdmin.update(data2update, {
				where: {
					channel_id: ctx.params.id,
				},
				fields: ['name', 'phone'],
				transaction: trx,
			});
		}

		await trx.commit();
	} catch(err) {
		await trx.rollback();
    logger.error('##### err: ', JSON.stringify(err));
    throw err;
	}
	
	ctx.body = {
		code: 1,
		message: '更新成功'
	};
});

router.get('/:id', async (ctx) => {
	const result = await serviceChannel.findOne({
		where: {
			id: ctx.params.id,
		},
		include: [{
			model: models.channel_area,
			required: true,
		}],
		raw: true,
		nest: true,
	});

	ctx.body = {
		code: 0,
		data: result,
		message: '获取成功',
	};
});

router.get('/', async (ctx) => {
	const pagation = paging(ctx.query);

	const condition = {};

	if (ctx.query.name) {
		condition.name = { [Op.like]: `%${ctx.query.name}%` };
	}

	if (ctx.query.phone) {
		condition.phone = { [Op.like]: `%${ctx.query.phone}%` };
	}

	if (ctx.query.code) {
		condition.code = { [Op.like]: `%${ctx.query.code}%` };
	}

	const result = await serviceChannel.findAllByOption({
		where: condition,
		limit: pagation.pageSize,
		offset: pagation.offset,
		order: [
			['created_at', 'DESC']
		],
		include: [{
			model: models.channel_area,
			required: true,
		}],
		raw: true,
		nest: true,
	});

	const count = await serviceChannel.count({
		where: condition,
	});
	pagation.total = count;

	ctx.body = {
		code: 0,
		data: result,
		paging: pagation,
		message: '获取成功',
	};
});

router.delete('/:id', async (ctx) => {
	//find user belong to that channel
	const user = await serviceUser.findOne({
		where: {
			channel_id: ctx.params.id,
		},
	});

	if (user) {
		ctx.throw(400, '名下有客户, 不能删除');
	}

	await serviceChannel.destroy({
		where: {
			id: ctx.params.id,
		},
		force: true,
	});

	ctx.body = {
		code: 3,
		message: '删除成功'
	};

});

module.exports = router;
