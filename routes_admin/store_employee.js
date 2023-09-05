const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const { Op } = require('sequelize');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { md5, paging } = require('../util');
const middleware = require('../middleware');
const serviceStoreEmployee = require('../service/store_employee').instance();

router.prefix('/admin/user/store');
router.use(middleware.adminTokenRequired);

router.post('/:store_id/employee', async (ctx) => {
	const schema = Joi.object({
		name: Joi.string().trim().required(),
		role: Joi.string().trim().valid(constv.EMPLOYEE_TYPE.OPERATOR,
			constv.EMPLOYEE_TYPE.CHEF, constv.EMPLOYEE_TYPE.STORE_MANAGER)
			.required(),
		password: Joi.string().trim().required(),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	if (!ctx.params.store_id) {
		ctx.throw(400, 'no store id');
	}

	const body = ctx.request.body;

	const password = md5(`${body.password}:${config.passwordSalt}`);

	const result = await serviceStoreEmployee.create(Object.assign(body, {
		store_id: ctx.params.store_id,
		password,
	}));

	ctx.body = {
		code: 0,
		message: '新建成功'
	};
});

router.put('/:store_id/employee/:id', async (ctx) => {
	const schema = Joi.object({
		name: Joi.string().trim(),
		role: Joi.string().trim().valid(constv.EMPLOYEE_TYPE.OPERATOR,
			constv.EMPLOYEE_TYPE.CHEF, constv.EMPLOYEE_TYPE.STORE_MANAGER),
		password: Joi.string().trim(),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	if (!ctx.params.store_id) {
		ctx.throw(400, 'no store id');
	}

	const body = ctx.request.body;

	const updateData = { ...body };

	if (updateData.password) {
		const password = md5(`${updateData.password}:${config.passwordSalt}`);
		updateData.password = password;
	}


	const result = await serviceStoreEmployee.update(updateData, {
		where: {
			id: ctx.params.id,
			store_id: ctx.params.store_id,
		}
	});

	ctx.body = {
		code: 1,
		message: '更新成功'
	};
});

router.get('/:store_id/employee/:id', async (ctx) => {
	if (!ctx.params.user_id) {
		ctx.throw(400, 'no store id');
	}

	const result = await serviceStoreEmployee.findOne({
		where: {
			id: ctx.params.id,
			store_id: ctx.params.store_id,
		},
	});

	ctx.body = {
		code: 0,
		data: result,
		message: '获取成功',
	};
});

router.get('/:store_id/employee', async (ctx) => {
	if (!ctx.params.store_id) {
		ctx.throw(400, 'no store id');
	}

	const pagination = paging(ctx.query);

	const condition = {
		store_id: ctx.params.store_id,
	};

	if (ctx.query.name) {
		condition.name = ctx.query.name;
	}

	const result = await serviceStoreEmployee.findAllByOption({
		where: condition,
		limit: pagination.pageSize,
		offset: pagination.offset,
		order: [
			['created_at', 'DESC']
		],
	});

	const count = await serviceStoreEmployee.count({
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

router.delete('/:store_id/employee/:id', async (ctx) => {
	if (!ctx.params.store_id) {
		ctx.throw(400, 'no user id in param');
	}

	await serviceStoreEmployee.destroy({
		where: {
			id: ctx.params.id,
			store_id: ctx.params.store_id,
		},
		force: true,
	});

	ctx.body = {
		code: 3,
		message: '删除成功'
	}
});

module.exports = router;
