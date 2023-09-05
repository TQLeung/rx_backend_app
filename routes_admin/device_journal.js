const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const sequelize = require('sequelize');
const models = require('../model');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { md5, paging, preZeroFill } = require('../util');
const moment = require('moment');
const middleware = require('../middleware');
const kincoApi = require('../lib/kinco-api');
const serviceDeviceCode = require('../service/device_code').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();
const serviceChannel = require('../service/channel').instance();
const serviceUser = require('../service/user').instance();
const serviceUserStore = require('../service/user_store').instance();
const serviceDeviceApproval = require('../service/device_approval').instance();

router.prefix('/admin/device');
router.use(middleware.adminTokenRequired);

router.post('/:device_id/channel', async (ctx) => {
	const schema = Joi.object({
		channel_id: Joi.number().required(),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	const body = ctx.request.body;

	const deviceRecord = await serviceDeviceCode.findOne({
		where: {
			id: ctx.params.device_id
		},
	});

	if (!deviceRecord) {
		ctx.throw(400, 'no that device record');
	}

	const result = await serviceDeviceJournal.create(Object.assign(body, {
		device_id: deviceRecord.id,
		device_code: deviceRecord.code,
	}));

	ctx.body = {
		code: 0,
		message: '新建成功'
	};
});

router.get('/journal', async (ctx) => {
	const pagination = paging(ctx.query);

	const condition = {
		rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
	};

	if (ctx.query.device_code) {
		condition.device_code = { [sequelize.Op.like]: `%${ctx.query.device_code}%` };
	}

	const result = await serviceDeviceJournal.findAllByOption({
		where: condition,
		limit: pagination.pageSize,
		offset: pagination.offset,
		order: [
			['created_at', 'DESC']
		],
	});

	const deviceInfos = await Promise.all(result.map(item => serviceDeviceJournal.decode(item.device_code)));

	const channelResult = await Promise.all(result.map(item => serviceChannel.findOne({
		where: {
			id: item.channel_id,
		},
		include: [{
			model: models.channel_area,
			required: true,
		}],
		raw: true,
		nest: true,
	})));

	const userResult = await Promise.all(result.map(item => serviceUser.findOne({
		where: {
			id: item.user_id,
		},
	})));

	const storeResult = await Promise.all(result.map(item => serviceUserStore.findOne({
		where: {
			id: item.store_id,
		},
		attributes: ['id', 'name', 'address_detail'],
	})));

	const approvalResult = await Promise.all(result.map(item => serviceDeviceApproval.findAllByOption({
		where: {
			device_id: item.device_id,
		},
		group: ['type'],
		attributes: [
			[sequelize.fn('Max', sequelize.col('id')), 'id'], 
			'type',
		],
	})));

	result.forEach((item, index) => {
		item.device_info = deviceInfos[index];
		item.channel = channelResult[index];
		item.user = userResult[index];
		item.approval = approvalResult[index];
		item.store = storeResult[index];
	});

	const count = await serviceDeviceJournal.count({
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

router.post('/:device_id/approval/deployment', async (ctx) => {
	const schema = Joi.object({
		store_id: Joi.number().required(),
		remark: Joi.string(),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	const body = ctx.request.body;

	const data = {
		remark: body.remark,
	};

	//check the device if exists pending approval of deployment
	const approval = await serviceDeviceApproval.findOne({
		where: {
			device_id: ctx.params.device_id,
			type: constv.DEVICE_APPROVAL_TYPE.DEPLOYMENT,
			status: constv.DEVICE_APPROVAL_STATUS.PENDING,
		},
	});

	if (approval) {
		ctx.throw(400, '已有对应的布机工单存在, 请勿重复提交');
	}

	//generate approval code
	//code: time + random number
	const now = moment().format('YYYYMMDDHHmm');
	const random_str = Math.random().toString().slice(2, 5);
	const code = `${now}${random_str}`;

	data.code = code;

	//find the device record
	const device = await serviceDeviceCode.findOne({
		where: {
			id: ctx.params.device_id,
		},
	});

	if (!device) {
		ctx.throw(400, 'found but no device');
	}

	data.device_code = device.code;
	data.device_id = device.id;

	//find the store record 
	const store = await serviceUserStore.findOne({
		where: {
			id: body.store_id,
		},
	});

	if (!store) {
		ctx.throw(400, 'found but no store');
	}

	data.store_id = store.id;

	//find the user record
	const user = await serviceUser.findOne({
		where: {
			id: store.user_id,
		},
	});

	if (!user) {
		ctx.throw(400, 'found but no user');
	}

	data.user_id = user.id;

	//find the channel record
	const channel = await serviceChannel.findOne({
		where: {
			id: user.channel_id,
		},
	});

	if (!channel) {
		ctx.throw(400, 'found but no channel');
	}

	const deviceJournal = await serviceDeviceJournal.findOne({
		where: {
			status: constv.DEVICE_STATUS.IN_STOREHOUSE,
			device_id: ctx.params.device_id,
			rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
		},
	});

	if (!deviceJournal) {
		ctx.throw(400, 'found but not that journal');
	}

	data.channel_id = channel.id;

	data.type = constv.DEVICE_APPROVAL_TYPE.DEPLOYMENT;

	data.status = constv.DEVICE_APPROVAL_STATUS.PENDING;
	data.journal_status = deviceJournal.status;

	//the author 
	data.author = ctx.session.admin.name;
	data.author_id = ctx.session.admin.id;
	data.author_type = ctx.session.admin.type;

	//FIXME: maybe need a transaction?

	await serviceDeviceApproval.create(data);

	// update device journal status
	await serviceDeviceJournal.update({
		status: constv.DEVICE_STATUS.DEPLOYMENT,
	}, {
		where: {
			status: constv.DEVICE_STATUS.IN_STOREHOUSE,
			device_id: ctx.params.device_id,
			rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
		},
	});

	ctx.body = {
		code: 0,
		message: '新建成功'
	};

});

router.post('/:device_id/approval/change', async (ctx) => {
	const schema = Joi.object({
		store_id: Joi.number().required(),
		remark: Joi.string(),
	});

	const validation = schema.validate(ctx.request.body);

	if (validation.error) {
		ctx.throw(400, validation.error);
	}

	const body = ctx.request.body;

	const data = {
		remark: body.remark,
	};

	//check the device if exists pending approval of deployment
	const approval = await serviceDeviceApproval.findOne({
		where: {
			device_id: ctx.params.device_id,
			type: constv.DEVICE_APPROVAL_TYPE.CHANGE,
			status: constv.DEVICE_APPROVAL_STATUS.PENDING,
		},
	});

	if (approval) {
		ctx.throw(400, '已有对应的移机工单存在, 请勿重复提交');
	}

	//generate approval code
	//code: time + random number
	const now = moment().format('YYYYMMDDHHmm');
	const random_str = Math.random().toString().slice(2, 5);
	const code = `${now}${random_str}`;

	data.code = code;

	//find the device record
	const device = await serviceDeviceCode.findOne({
		where: {
			id: ctx.params.device_id,
		},
	});

	if (!device) {
		ctx.throw(400, 'found but no device');
	}

	data.device_code = device.code;
	data.device_id = device.id;

	//find the store record 
	const store = await serviceUserStore.findOne({
		where: {
			id: body.store_id,
		},
	});

	if (!store) {
		ctx.throw(400, 'found but no store');
	}

	data.store_id = store.id;

	//find the user record
	const user = await serviceUser.findOne({
		where: {
			id: store.user_id,
		},
	});

	if (!user) {
		ctx.throw(400, 'found but no user');
	}

	data.user_id = user.id;

	//find the channel record
	const channel = await serviceChannel.findOne({
		where: {
			id: user.channel_id,
		},
	});

	if (!channel) {
		ctx.throw(400, 'found but no channel');
	}

	data.channel_id = channel.id;

	const deviceJournal = await serviceDeviceJournal.findOne({
		where: {
			device_id: ctx.params.device_id,
			rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
		},
	});

	if (!deviceJournal) {
		ctx.throw(400, 'found but not that journal');
	}

	data.type = constv.DEVICE_APPROVAL_TYPE.CHANGE;

	data.status = constv.DEVICE_APPROVAL_STATUS.PENDING;
	data.journal_status = deviceJournal.status;

	//the author 
	data.author = ctx.session.admin.name;
	data.author_id = ctx.session.admin.id;
	data.author_type = ctx.session.admin.type;

	//FIXME: maybe need a transaction

	await serviceDeviceApproval.create(data);

	// update device journal status
	await serviceDeviceJournal.update({
		status: constv.DEVICE_STATUS.CHANGE,
	}, {
		where: {
			device_id: ctx.params.device_id,
			rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
		},
	});

	ctx.body = {
		code: 0,
		message: '新建成功'
	};

});

router.post('/:device_id/approval/withdrawal', async (ctx) => {

	const body = ctx.request.body;

	const data = {
		remark: body.remark,
	};

	//check the device if exists pending approval of deployment
	const approval = await serviceDeviceApproval.findOne({
		where: {
			device_id: ctx.params.device_id,
			type: constv.DEVICE_APPROVAL_TYPE.WITHDRAWAL,
			status: constv.DEVICE_APPROVAL_STATUS.PENDING,
		},
	});

	if (approval) {
		ctx.throw(400, '已有对应的撤机工单存在, 请勿重复提交');
	}

	//generate approval code
	//code: time + random number
	const now = moment().format('YYYYMMDDHHmm');
	const random_str = Math.random().toString().slice(2, 5);
	const code = `${now}${random_str}`;

	data.code = code;

	//find the device record
	const device = await serviceDeviceCode.findOne({
		where: {
			id: ctx.params.device_id,
		},
	});

	if (!device) {
		ctx.throw(400, 'found but no device');
	}

	data.device_code = device.code;
	data.device_id = device.id;

	data.type = constv.DEVICE_APPROVAL_TYPE.WITHDRAWAL;

	data.status = constv.DEVICE_APPROVAL_STATUS.PENDING;

	//find the user
	const deviceJournal = await serviceDeviceJournal.findOne({
		where: {
			device_id: ctx.params.device_id,
			rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
		},
	});

	if (!deviceJournal) {
		ctx.throw(400, 'found but no device journal');
	}

	data.user_id = deviceJournal.user_id;
	data.channel_id = deviceJournal.channel_id;
	data.store_id = deviceJournal.store_id;
	data.journal_status = deviceJournal.status;

	//the author 
	data.author = ctx.session.admin.name;
	data.author_id = ctx.session.admin.id;
	data.author_type = ctx.session.admin.type;

	//FIXME: maybe need a transaction

	await serviceDeviceApproval.create(data);

	// update device journal status
	await serviceDeviceJournal.update({
		status: constv.DEVICE_STATUS.WITHDRAWAL,
	}, {
		where: {
			device_id: ctx.params.device_id,
			rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
		},
	});

	ctx.body = {
		code: 0,
		message: '新建成功'
	};

});

router.get('/:device_code/iot/state', async (ctx) => {
	const pagination = paging(ctx.query);

	const response = await kincoApi.getMachineState({
		mach_no: ctx.params.device_code,
		page_no: pagination.page - 1,
		page_size: pagination.pageSize,
	});

	if (response && response.data) {
		response.data.forEach(item => {
			const obj = {};
			item.mach_ixs.forEach(ixs => {
				obj[ixs.ix] = ixs.iv; 
			});
			Object.assign(item, obj);
			delete item.mach_ixs;
			delete item.mach_no;
		});
	}

	ctx.body = {
		code: 0,
		data: response.data,
	};
});

router.get('/iot/state', async (ctx) => {
	const pagination = paging(ctx.query);

	const device_code = ctx.query.device_code;

	const response = await kincoApi.getMachineState({
		mach_no: device_code ? device_code : null,
		page_no: pagination.page - 1,
		page_size: pagination.pageSize,
	});

	if (response && response.data) {
		response.data.forEach(item => {
			const obj = {};
			item.mach_ixs.forEach(ixs => {
				obj[ixs.ix] = ixs.iv; 
			});
			Object.assign(item, obj);
			delete item.mach_ixs;
		});
	}

	// find the device journal
	const deviceJournalResult = await Promise.all(response.data.map(item => serviceDeviceJournal.findOne({
		where: {
			device_code: item.mach_no,
		},
		attributes: ['user_id', 'store_id', 'channel_id'],
	})));

	const userResult = await Promise.all(deviceJournalResult.map(item => item && serviceUser.findOne({
		where: {
			id: item?.user_id,
		},
		attributes: ['id', 'name'],
	})));

	const storeResult = await Promise.all(deviceJournalResult.map(item => item && serviceUserStore.findOne({
		where: {
			id: item?.store_id,
		},
		attributes: ['id', 'name'],
	})));

	response.data.forEach((item, index) => {
		item.user = userResult[index];
		item.store = storeResult[index];
	});

	ctx.body = {
		code: 0,
		data: response.data,
	};
});

router.get('/:device_code/iot/history', async (ctx) => {
	const pagination = paging(ctx.query);

	const response = await kincoApi.getMachineData({
		mach_no: ctx.params.device_code,
		page_no: pagination.page - 1,
		page_size: pagination.pageSize,
	});

	ctx.body = {
		code: 0,
		data: response.data,
	};
});

router.get('/:device_code/iot/error', async (ctx) => {
	const pagination = paging(ctx.query);

	const response = await kincoApi.getMachineErrors({
		mach_no: ctx.params.device_code,
		page_no: pagination.page - 1,
		page_size: pagination.pageSize,
	});

	ctx.body = {
		code: 0,
		data: response.data,
	};
});

router.get('/:device_code/iot/cooked', async (ctx) => {
	const pagination = paging(ctx.query);

	const response = await kincoApi.getMachineData({
		mach_no: ctx.params.device_code,
		mach_ixs: ['menu', 'menu_time', 'menu_cnt'],
		page_no: pagination.page - 1,
		page_size: pagination.pageSize,
	});

	if (response && response.data) {
		response.data.forEach(item => {
			const menu_time_element = item.mach_ixs.find(element => element.ix == 'menu_time');
			const menu_time = menu_time_element ? menu_time_element['iv'] : 0;
			item.ts_end = item.ts + menu_time * 1000;
			const obj = {};
			item.mach_ixs.forEach(ixs => {
				obj[ixs.ix] = ixs.iv; 
			});
			Object.assign(item, obj);
			delete item.mach_ixs;
			delete item.mach_no;
		});
	}

	ctx.body = {
		code: 0,
		data: response.data,
	};
});



module.exports = router;
