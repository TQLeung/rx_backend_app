const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const models = require('../model');
const redis = require('../lib/ioredis');
const logger = require('../lib/logger').label('route-admin:user');
const constv = require('../config/constv');
const config = require('../config');
const { Op } = require('sequelize');
const { md5, paging, preZeroFill } = require('../util');
const middleware = require('../middleware');
const serviceUser = require('../service/user').instance();
const serviceUserChannel = require('../service/user_channel').instance();
const serviceUserStore = require('../service/user_store').instance();
const serviceUserAdmin = require('../service/user_admin').instance();

router.prefix('/admin/user');
router.use(middleware.adminTokenRequired);

router.post('/', async (ctx) => {
	const schema = Joi.object({
		name: Joi.string().trim().required(),
		type: Joi.string().trim().valid(constv.USER_TYPE.COMPANY, constv.USER_TYPE.PERSONAL).required(),
		contact: Joi.string().trim().required(),
		phone: Joi.string().trim().length(11).required(),
		password: Joi.string().trim().required(),
		channel_id: Joi.number().required(),
		company: Joi.string().trim(),
		tax_number: Joi.string().trim(),
		payment_account: Joi.string().trim(),
		province: Joi.string().trim(),
		province_code: Joi.string().trim(),
		city: Joi.string().trim(),
		city_code: Joi.string().trim(),
		area: Joi.string().trim(),
		area_code: Joi.string().trim(),
		remark: Joi.string().trim(),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	const body = ctx.request.body;

	const password = md5(`${body.password}:${config.passwordSalt}`);

	// generate user code
	let max_code = await serviceUser.max('code');

	let number = 0;
	if (max_code) {
		number = parseInt(max_code.slice(2));
	}

	// user code rule: 
	// for company: 'QY'+ 5 number; eg, QY00001
	// for personal: 'GR' + 5 number; eg, GR00001
	let prefix = null;
	if (body.type == constv.USER_TYPE.COMPANY) {
		prefix = 'QY';
	} else if (body.type == constv.USER_TYPE.PERSONAL) {
		prefix = 'GR';
	}
	const code_str = `${prefix}${preZeroFill(number + 1, 5)}`;

	const result = await serviceUser.create(Object.assign(body, {
		code: code_str,
		password
	}));

	ctx.body = {
		code: 0,
		message: '新建成功'
	};
});

router.put('/:id', async (ctx) => {
	const schema = Joi.object({
		name: Joi.string().trim().required(),
		type: Joi.string().trim().valid(constv.USER_TYPE.COMPANY, constv.USER_TYPE.PERSONAL).required(),
		contact: Joi.string().trim().required(),
		phone: Joi.string().trim().length(11).required(),
		password: Joi.string().trim().required(),
		channel_id: Joi.number().required(),
		company: Joi.string().trim(),
		tax_number: Joi.string().trim(),
		payment_account: Joi.string().trim(),
		province: Joi.string().trim(),
		province_code: Joi.string().trim(),
		city: Joi.string().trim(),
		city_code: Joi.string().trim(),
		area: Joi.string().trim(),
		area_code: Joi.string().trim(),
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

		const result = await serviceUser.update(Object.assign(body, { password }), {
			where: {
				id: ctx.params.id
			}
		});

		if (body.name || body.phone) {
			const data2update = {};
			body.name && (data2update.name = body.name);
			body.phone && (data2update.phone = body.phone);

			await serviceUserAdmin.update(data2update, {
				where: {
					user_id: ctx.params.id,
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
	const result = await serviceUser.findOne({
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
		condition.name = { [Op.like]: `%${ctx.query.name}%` };
	}

	if (ctx.query.phone) {
		condition.phone = { [Op.like]: `%${ctx.query.phone}%` };
	}

	if (ctx.query.code) {
		condition.code = { [Op.like]: `%${ctx.query.code}%` };
	}

	const result = await serviceUser.findAllByOption({
		where: condition,
		limit: pagination.pageSize,
		offset: pagination.offset,
		order: [
			['created_at', 'DESC']
		],
		include: [{
			model: models.channel,
			required: true,
		}],
		raw: true,
		nest: true,
	});

	const count = await serviceUser.count({
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
	// TODO: can't delete channal if the user has devices
	const store = await serviceUserStore.findOne({
		where: {
			user_id: ctx.params.id,
		},
	});

	if (store) {
		ctx.throw(400, '该帐号下已有门店，不能删除');
	}

	await serviceUser.destroy({
		where: {
			id: ctx.params.id,
		},
	});

	ctx.body = {
		code: 3,
		message: '删除成功'
	}
});

module.exports = router;
