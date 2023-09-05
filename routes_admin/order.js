const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const logger = require('../lib/logger');
const { Op } = require('sequelize');
const models = require('../model');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { md5, paging, preZeroFill, commissionType2monthNumber } = require('../util');
const moment = require('moment');
const middleware = require('../middleware');
const serviceDeviceCode = require('../service/device_code').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();
const serviceChannel = require('../service/channel').instance();
const serviceUser = require('../service/user').instance();
const serviceUserStore = require('../service/user_store').instance();
const serviceDeviceApproval = require('../service/device_approval').instance();
const serviceOrder = require('../service/order').instance();
const serviceCommissionPlan = require('../service/commission_plan').instance();
const serviceOrderPayment = require('../service/order_payment').instance();

router.prefix('/admin/order');
router.use(middleware.adminTokenRequired);

router.get('/', async (ctx) => {
  const pagination = paging(ctx.query);

  const condition = {};

  if (ctx.query.code) {
    condition.code = ctx.query.code;
  }

  if (ctx.query.status) {
    condition.status = ctx.query.status;
  }

  const result = await serviceOrder.findAllByOption({
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

  const orderPaymentResult = await Promise.all(result.map(item => serviceOrderPayment.findOne({
    where: {
      order_id: item.id,
    },
  })));

  result.forEach((item, index) => {
    item.device_info = deviceInfos[index];
    item.channel = channelResult[index];
    item.user = userResult[index];
    item.payment = orderPaymentResult[index];
  });

  const count = await serviceOrder.count({
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

router.get('/:id', async (ctx) => {
  const result = await serviceOrder.findOne({
    where: {
      id: ctx.params.id,
    }
  });

  if (!result) {
    ctx.throw(400, 'found but no record');
  }

  const deviceInfos = await serviceDeviceJournal.decode(result.device_code);

  const channel = await serviceChannel.findOne({
    where: {
      id: result.channel_id,
    },
  });

  const user = await serviceUser.findOne({
    where: {
      id: result.user_id,
    }
  });

  result.deviceInfos = deviceInfos;
  result.channel = channel;
  result.user = user;

  ctx.body = {
    code: 0,
    data: result,
  };
});

router.post('/', async (ctx) => {
  const TYPE = constv.ORDER_TYPE;
  const schema = Joi.object({
    device_journal_id: Joi.number().required(),
    type: Joi.string().required(),
    commission_plan_id: Joi.number().when('type', { is: TYPE.OFFLINE, then: Joi.required() }),
    trial_begin: Joi.string().when('type', { is: TYPE.TRIAL, then: Joi.required() }),
    trial_end: Joi.string().when('type', { is: TYPE.TRIAL, then: Joi.required() }),
    trial_reason: Joi.string().max(100),
    remark: Joi.string().max(100),
    payment_method: Joi.string().when('type', { is: TYPE.OFFLINE, then: Joi.required() }),
    transaction_id: Joi.string().when('type', { is: TYPE.OFFLINE, then: Joi.required() }),
    pay_account: Joi.string(),
    pay_at: Joi.string().when('type', { is: TYPE.OFFLINE, then: Joi.required() }),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  const body = ctx.request.body;

  const data = {
    status: body.status,
    type: body.type,
  };

  //generate order code
  const now = moment().format('YYYYMMDDHHmm');
	const random_str = Math.random().toString().slice(2, 5);
	const code = `${now}${random_str}`;

  data.code = code;

  const deviceJournal = await serviceDeviceJournal.findOne({
    where: {
      id: body.device_journal_id,
    },
  });

  if (!deviceJournal) {
    ctx.throw(400, 'found but no that device journal');
  }

  data.device_journal_id = deviceJournal.id;

  //find device record
  const device = await serviceDeviceCode.findOne({
    where: {
      id: deviceJournal.device_id,
    },
  });

  if(!device) {
    ctx.throw(400, 'found but no that device');
  }

  data.device_id = device.id;
  data.device_code = device.code;

  //find user record
  const user = await serviceUser.findOne({
    where: {
      id: deviceJournal.user_id,
    },
  });

  if(!user) {
    ctx.throw(400, 'found but no that user');
  }

  data.user_id = user.id;
  data.channel_id = user.channel_id;
  
  //find commission plan
  if (body.commission_plan_id && body.type == TYPE.OFFLINE) {
    const commissionPlan = await serviceCommissionPlan.findOne({
      where: {
        id: body.commission_plan_id,
      },
    });
  
    if(!commissionPlan) {
      ctx.throw(400, 'found but no that commission plan');
    }
  
    data.commission_plan_name = commissionPlan.name;
    data.commission_plan_type = commissionPlan.type;
    data.commission_plan_renxin_amount = commissionPlan.renxin_amount;
    data.commission_plan_agent_amount = commissionPlan.agent_amount;
  
    data.months = commissionType2monthNumber(commissionPlan.type);

    data.price = commissionPlan.renxin_amount + commissionPlan.agent_amount;
  
    //total_amount = price * months;
    data.total_amount = data.price * data.months;
  } else {
    data.price = 0;
    data.total_amount = 0;
  }

  //operator information
  data.operator = ctx.session.admin.name;
  data.operator_id = ctx.session.admin.id;
  data.operator_type = ctx.session.admin.type;

  data.from = constv.ORDER_FROM_TYPE.ADMIN;

  data.status = constv.ORDER_PAY_STATUS.PENDING;

  if (body.type == constv.ORDER_TYPE.TRIAL || body.type == constv.ORDER_TYPE.OFFLINE) {
    data.status = constv.ORDER_PAY_STATUS.PAID;
    data.payment_status = constv.PAYMENT_STATUS.PAID;
  }

  data.trial_begin = body.trial_begin;
  data.trial_end = body.trial_end;
  data.trial_reason = body.trial_reason;
  data.remark = body.remark;
  data.payment_method = body.payment_method;
  data.pay_at = body.pay_at;

  if (body.type == TYPE.TRIAL) {
    data.payment_method = constv.PAYMENT_METHOD.TRIAL;
  }

  const trx = await db.transaction();

  try {
    const order = await serviceOrder.create(data, {
      transaction: trx,
    });    

    if (body.type == constv.ORDER_TYPE.OFFLINE) {
      const toCreateData4OrderPayment = {
        user_id: order.user_id,
        order_id: order.id,
        order_no: order.code,
        transaction_id: body.transaction_id,
        pay_type: body.payment_method,
        order_amount: data.total_amount,
        pay_amount: data.total_amount,
        pay_at: body.pay_at,
        pay_account: body.pay_account,
      };
  
      await serviceOrder.createOrderPayment(toCreateData4OrderPayment, trx);

      if (deviceJournal.service_end) {
        const data2Update = {};

        const serviceEnd = Math.max(new Date(), new Date(deviceJournal.service_end));
        data2Update.service_end = moment(serviceEnd).add(data.months, 'months');

        const resultUpdateJournal = await serviceDeviceJournal.update(data2Update, {
          where: {
            id: deviceJournal.id,
            rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
          },
          transaction: trx,
        });

        if (resultUpdateJournal[0] > 0) {
          await serviceOrder.update({
            is_calculated: constv.ORDER_IS_CALCULATED.YES,
          }, {
            where: {
              id: order.id,
              is_calculated: constv.ORDER_IS_CALCULATED.NO,
            },
            transaction: trx,
          });
        }
      }
    }

    if (body.type == constv.ORDER_TYPE.TRIAL) {
      const data2Update = {};

      data2Update.service_begin = Math.min(new Date(data.trial_begin), deviceJournal.service_begin ? new Date(deviceJournal.service_begin) : new Date());
      if (new Date(deviceJournal.service_end) < new Date()) {
        data2Update.service_begin = new Date();
      }
      data2Update.service_end = Math.max(new Date(data.trial_end), deviceJournal.service_end ? new Date(deviceJournal.service_end) : new Date());

      const resultUpdate = await serviceDeviceJournal.update(data2Update, {
        where: {
          id: deviceJournal.id,
          rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
        },
        fields: ['service_begin', 'service_end'],
        transaction: trx,
      });

      if (resultUpdate[0] > 0) {
        await serviceOrder.update({
          is_calculated: constv.ORDER_IS_CALCULATED.YES,
        }, {
          where: {
            id: order.id,
            is_calculated: constv.ORDER_IS_CALCULATED.NO,
          },
          transaction: trx,
        });
      }
    }
    
    await trx.commit();
  } catch (err) {
    await trx.rollback();
    logger.error('##### err: ', JSON.stringify(err));
    throw err;
  }

  ctx.body = {
    code: 0,
		message: '新建成功'
  };

});

module.exports = router;
