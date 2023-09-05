const router = require('koa-router')();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const models = require('../model');
const redis = require('../lib/ioredis');
const miniProgramApi = require('../lib/mini-program-api');
const constv = require('../config/constv');
const config = require('../config');
const { md5, paging } = require('../util');
const middleware = require('../middleware');
const kincoApi = require('../lib/kinco-api');
const serviceUser = require('../service/user').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();
const serviceChannel = require('../service/channel').instance();
const serviceOrder = require('../service/order').instance();
const serviceUserStore = require('../service/user_store').instance();

router.prefix('/api/v1/user/device');
router.use(middleware.miniProgramTokenRequired);

router.get('/journal', async (ctx) => {
  const pagination = paging(ctx.query);

	const condition = {
		rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
	};

	if (ctx.query.device_code) {
		condition.device_code = ctx.query.device_code;
	}

  if (ctx.user && ctx.user.type == constv.ADMIN_USER_TYPE.USER) {
    condition.user_id = ctx.user.id;
  }

  if (ctx.user && ctx.user.type == constv.ADMIN_USER_TYPE.CHANNEL) {
    condition.channel_id = ctx.user.id;
  }

	if (ctx.user && ctx.user.type == constv.ADMIN_USER_TYPE.EMPLOYEE) {
    condition.user_id = ctx.user.user_id;
  }

	if (ctx.query.status) {
		condition.status = ctx.query.status;
	}

	const STATUS2PAY = '未付费';
	if (ctx.query.status == STATUS2PAY) {
		condition.service_end = {
			[Op.or]: {
				[Op.lt]: new Date(),
				[Op.is]: null,
			},
		};
		delete condition.status;
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

	const orderResult = await Promise.all(result.map(item => serviceOrder.findOne({
		where: {
			device_journal_id: item.id,
		},
	})));

	result.forEach((item, index) => {
		item.device_info = deviceInfos[index];
		item.channel = channelResult[index];
		item.user = userResult[index];
		item.order = orderResult[index];
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

router.get('/journal/:id', async (ctx) => {
	const result = await serviceDeviceJournal.findOne({
		where: {
			id: ctx.params.id,
		},
	});

	if(!result) {
		ctx.throw(400, 'found but no that journal');
	}

	const deviceInfos = await serviceDeviceJournal.decode(result.device_code);

	const channelResult = await serviceChannel.findOne({
		where: {
			id: result.channel_id,
		},
		attributes: ['id', 'name', 'phone'],
		include: [{
			model: models.channel_area,
			required: true,
			attributes: ['channel_id', 'province', 'city', 'area'],
		}],
		raw: true,
		nest: true,
	});

	const userResult = await serviceUser.findOne({
		where: {
			id: result.user_id,
		},
		attributes: ['name', 'phone'],
	});

	const storeResult = await serviceUserStore.findOne({
		where: {
			id: result.store_id,
		},
		attributes: ['name', 'address_detail'],
	});

	result.deviceInfos = deviceInfos;
	result.channel = channelResult;
	result.user = userResult;
	result.store = storeResult;

	ctx.body = {
		code: 0,
		data: result,
	};
});

router.get('/stat', async (ctx) => {
	const condition = {
		rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
	};

	if (ctx.query.device_code) {
		condition.device_code = ctx.query.device_code;
	}

  if (ctx.user && ctx.user.type == constv.ADMIN_USER_TYPE.USER) {
    condition.user_id = ctx.user.id;
  }

  if (ctx.user && ctx.user.type == constv.ADMIN_USER_TYPE.CHANNEL) {
    condition.channel_id = ctx.user.id;
  }

	if (ctx.user && ctx.user.type == constv.ADMIN_USER_TYPE.EMPLOYEE) {
    condition.user_id = ctx.user.user_id;
  }

	const resultAll = await serviceDeviceJournal.count({
		where: condition,
	});

	//operating
	const resultOperating = await serviceDeviceJournal.count({
		where: Object.assign({}, condition, { status: constv.DEVICE_STATUS.OPERATING }),
	});

	//error
	const resultError = await serviceDeviceJournal.count({
		where: Object.assign({}, condition, { status: constv.DEVICE_STATUS.ERROR}),
	});

	//TODO: topay stat
	const result2pay = await serviceDeviceJournal.count({
		where: Object.assign({}, condition, {
			service_end: {
				[Op.or]: {
					[Op.lt]: new Date(),
					[Op.is]: null,
				},
			},
		}),
	});

	ctx.body = {
		code: 0,
		data: {
			all: resultAll,
			operating: resultOperating,
			error: resultError,
			topay: result2pay,
		},
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
