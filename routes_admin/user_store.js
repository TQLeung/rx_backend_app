const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const { Op } = require('sequelize');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { md5, paging, preZeroFill } = require('../util');
const middleware = require('../middleware');
const serviceUserStore = require('../service/user_store').instance();
const serviceUser = require('../service/user').instance();
const serviceChannel = require('../service/channel').instance();
const serviceStoreEmployee = require('../service/store_employee').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();

router.prefix('/admin/user-store');
router.use(middleware.adminTokenRequired);

router.post('/', async (ctx) => {
	const schema = Joi.object({
		user_id: Joi.number().required(),
		name: Joi.string().trim().required(),
		province: Joi.string().trim().required(),
		province_code: Joi.string().trim().required(),
		city: Joi.string().trim().required(),
		city_code: Joi.string().trim().required(),
		area: Joi.string().trim().required(),
		area_code: Joi.string().trim().required(),
		town: Joi.string().trim().allow(''),
		town_code: Joi.string().trim().allow(''),
		address_detail: Joi.string().trim(),
		service: Joi.string().trim().required(),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	const body = ctx.request.body;

	// generate store code
	let max_code = await serviceUserStore.max('code', {
		where: {
			code: {
				[Op.startsWith]: `${body.city_code}`,
			},
		},
		paranoid: false,
	});

	let number = 0;
	if (max_code) {
		number = parseInt(max_code.slice(6));
	}

	// store code rule: city_code + 5 number; eg, 44030000001
	const code_str = `${body.city_code}${preZeroFill(number + 1, 5)}`;

	const result = await serviceUserStore.create(Object.assign(body, {
		code: code_str,
	}));

	ctx.body = {
		code: 0,
		message: '新建成功'
	};
});

router.put('/:id', async (ctx) => {
	const schema = Joi.object({
		user_id: Joi.number(),
		name: Joi.string().trim(),
		province: Joi.string().trim(),
		province_code: Joi.string().trim(),
		city: Joi.string().trim(),
		city_code: Joi.string().trim(),
		area: Joi.string().trim(),
		area_code: Joi.string().trim(),
		town: Joi.string().trim().allow(''),
		town_code: Joi.string().trim().allow(''),
		address_detail: Joi.string().trim(),
		service: Joi.string().trim(),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	const body = ctx.request.body;

	const result = await serviceUserStore.update(body, {
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
	const result = await serviceUserStore.findOne({
		where: {
			id: ctx.params.id,
		},
	});

	const response = {
		code: 0,
		data: result,
		message: '获取成功',
	};

	if (!result) {
		ctx.body = response;
		return;
	}

	//find the user record
	const user = await serviceUser.findOne({
		where: {
			id: result.user_id,
		},
	});

	if (user) {
		//find the channel record
		const channel = await serviceChannel.findOne({
			where: {
				id: user.channel_id,
			},
		});

		result.channel = channel;
	}

	result.user = user;

	ctx.body = response;

});

router.get('/', async (ctx) => {
	const pagination = paging(ctx.query);

	const condition = {};

	if (ctx.query.name) {
		condition.name = { [Op.like]: `%${ctx.query.name}%` };
	}

	if (ctx.query.province) {
		condition.province = ctx.query.province;
	}

	if (ctx.query.city) {
		condition.city = ctx.query.city;
	}

	if (ctx.query.area) {
		condition.area = ctx.query.area;
	}

	if (ctx.query.town) {
		condition.town = ctx.query.town;
	}

	if (ctx.query.user_name) {
		const user = await serviceUser.findAllByOption({
			where: {
				name: {
					[Op.like]: `%${ctx.query.user_name}%`,
				},
			}
		});

		condition.user_id = user.map(item => item.id);
	}

	const result = await serviceUserStore.findAllByOption({
		where: condition,
		limit: pagination.pageSize,
		offset: pagination.offset,
		order: [
			['created_at', 'DESC']
		],
	});

	// get employee information
	const user_record = await serviceUser.findAllByOption({
		where: {
			id: result.map(item => item.user_id),
		},
		attributes: ['id', 'name'],
	});

	const employee_record = await serviceStoreEmployee.findAllByOption({
		where: {
			store_id: result.map(item => item.id),
		},
		attributes: ['id', 'store_id', 'name', 'role'],
	});

	result.forEach(item => {
		//find user 
		item.user = user_record.find(element => item.user_id == element.id);

		// find store employee
		item.employee = [];

		employee_record.forEach((employee_item, index) => {
			if (employee_item.store_id == item.id) {
				item.employee.push(employee_item);
			}
		});
	});

	const count = await serviceUserStore.count({
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

	// check the store if used

	const employee = await serviceStoreEmployee.findOne({
		where: {
			store_id: ctx.params.id,
		},
	});

	const deviceJournal = await serviceDeviceJournal.findOne({
		where: {
			store_id: ctx.params.id,
		},
	});

	if (employee || deviceJournal) {
		ctx.throw(400, '门店使用中, 不能删除');
	}

	await serviceUserStore.destroy({
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
