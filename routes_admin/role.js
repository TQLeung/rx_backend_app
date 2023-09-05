const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const models = require('../model');
const { Op } = require('sequelize');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { md5, paging } = require('../util');
const middleware = require('../middleware');
const serviceRole = require('../service/role').instance();
const serviceRolePermission = require('../service/role_permission').instance();
const serviceUserRole = require('../service/user_role').instance();
const serviceResource = require('../service/resource').instance();

router.prefix('/admin/role');
router.use(middleware.adminTokenRequired);

router.get('/', async (ctx) => {
	const pagination = paging(ctx.query);

	const condition = {};

	if (ctx.query.name) {
		condition.name = ctx.query.name;
	}

	const result = await serviceRole.findAllByOption({
		where: condition,
		limit: pagination.pageSize,
		offset: pagination.offset,
		order: [
			['created_at', 'DESC']
		],
	});

	const count = await serviceRole.count({
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

router.get('/:id/permission', async (ctx) => {
	const result = await serviceRolePermission.findAllByOption({
		where: {
			role_id: ctx.params.id,
		},
		attributes: ['id', 'role_id', 'resource_id'],
	});

	// find resource by resource id
	const resource = await serviceResource.findAllByOption({
		where: {
			id: result.map(item => item.resource_id),
		},
	});

	for (const item of result) {
		const resource_item = resource.find(r => item.resource_id == r.id);
		item.resource = resource_item;
	}

	ctx.body = {
		code: 0,
		data: result,
		message: '获取成功',
	};
});

router.post('/', async (ctx) => {
	const schema = Joi.object({
		name: Joi.string().trim().required(),
		remark: Joi.string().trim(),
		resources: Joi.array().items(Joi.number().required()),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	const body = ctx.request.body;

	const result = await serviceRole.create({
		name: body.name,
		remark: body.remark,
	});

	// save to role_permission
	await Promise.all(body.resources.map(item => {
		return serviceRolePermission.create({
			resource_id: item,
			role_id: result.id,
		});
	}));

	ctx.body = {
		code: 0,
		message: '新建成功'
	};
});

router.put('/:id', async (ctx) => {
	const schema = Joi.object({
		name: Joi.string().trim().required(),
		resources: Joi.array().items(Joi.number().required()),
		remark: Joi.string().trim(),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	const body = ctx.request.body;

	const result = await serviceRole.update({
		name: body.name,
		remark: body.remark,
	}, {
		where: {
			id: ctx.params.id,
		},
	});

	// save to role_permission
	await Promise.all(body.resources.map(item => {
		return serviceRolePermission.upsert({
			resource_id: item,
			role_id: ctx.params.id,
		}, {
			fields: ['resource_id', 'role_id'],
		});
	}));

	// remove no need records if resource_id is not in body.resources
	await serviceRolePermission.destroy({
		where: {
			role_id: ctx.params.id,
			resource_id: {
				[Op.notIn]: body.resources,
			}
		},
	});

	ctx.body = {
		code: 1,
		message: '更新成功'
	};
});

router.delete('/:id', async (ctx) => {

	// TODO: use a transaction?

	await serviceRole.destroy({
		where: {
			id: ctx.params.id,
		},
	});

	// remove user role record
	await serviceUserRole.destroy({
		where: {
			role_id: ctx.params.id,
		},
	});

	// remove role permission record
	await serviceRolePermission.destroy({
		where: {
			role_id: ctx.params.id,
		},
	});

	ctx.body = {
		code: 3,
		message: '删除成功',
	}
});

router.post('/user', async (ctx) => {
	const schema = Joi.object({
		user_id: Joi.number().required(),
		user_type: Joi.string().valid(Object.values(constv.ADMIN_USER_TYPE)),
		role: Joi.array().items(Joi.number()),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	const body = ctx.request.body;

	// FIXME: change to upsert?
	// await serviceUserRole.bulkCreate(body.role.map(item => {
	//   return {
	//     user_id: body.user_id,
	//     user_type: body.user_type,
	//     role_id: item,
	//   };
	// }));

	// save to user_role
	await Promise.all(body.role.map(item => {
		return serviceUserRole.upsert({
			role_id: item,
			user_id: body.user_id,
			user_type: body.user_type
		}, {
			fields: ['user_id', 'user_type', 'role_id'],
		});
	}));

	// remove no need records if role_id is not in body.role
	await serviceUserRole.destroy({
		where: {
			user_id: body.user_id,
			user_type: body.user_type,
			role_id: {
				[Op.notIn]: body.role,
			}
		},
	});

	const result = await serviceUserRole.findAllByOption({
		where: {
			user_id: body.user_id,
			user_type: body.user_type,
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
		message: '成功'
	};
});

module.exports = router;
