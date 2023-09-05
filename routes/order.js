const router = require('koa-router')();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const models = require('../model');
const redis = require('../lib/ioredis');
const logger = require('../lib/logger').label('route:order');
const miniProgramApi = require('../lib/mini-program-api');
const constv = require('../config/constv');
const config = require('../config');
const path = require('path');
const moment = require('moment');
const fetch = require('node-fetch');
const fsPromise = require('node:fs/promises');
const { setTimeout } = require('node:timers/promises');
const crypto = require('node:crypto');
const { md5, paging, commissionType2monthNumber, isPaymentTest } = require('../util');
const middleware = require('../middleware');
const serviceDeviceCode = require('../service/device_code').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();
const serviceChannel = require('../service/channel').instance();
const serviceUser = require('../service/user').instance();
const serviceOrder = require('../service/order').instance();
const serviceOrderPayment = require('../service/order_payment').instance();
const serviceCommissionPlan = require('../service/commission_plan').instance();
const wechatpay_api = require('../lib/wechatpay-v3-api');

router.prefix('/api/v1/user/order');
router.use(middleware.miniProgramTokenRequired);

router.post('/', middleware.userRequiredOnMiniProgram, async (ctx) => {
  const schema = Joi.object({
    device_journal_id: Joi.number().required(),
    commission_plan_id: Joi.number().required(),
    remark: Joi.string().max(100),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  const body = ctx.request.body;

  const data = {
    status: body.status,
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

  data.status = constv.ORDER_PAY_STATUS.PENDING;

  data.from = constv.ORDER_FROM_TYPE.MINI_PROGRAM;

  const result = await serviceOrder.create(data);

  ctx.body = {
    code: 0,
    data: result,
  };

  // expired order after timer
  const EXPIRE_TIME = 1000 * 60 * 5; // 10 min
  setTimeout(EXPIRE_TIME).then(res => {
    return serviceOrder.update({
      status: constv.ORDER_PAY_STATUS.EXPIRED,
    }, {
      where: {
        id: result.id,
        status: constv.ORDER_PAY_STATUS.PENDING,
      },
      fields: ['status'],
    });
  }).then(res => {
      logger.info('##### setTimeout update result: ', res);
      if(res[0] > 0) {
        return wechatpay_api.closeOrder(result.code);
      }
  });
});

router.get('/', async (ctx) => {
  const pagination = paging(ctx.query);

  const condition = {};

  if (ctx.query.code) {
    condition.code = ctx.query.code;
  }

  if (ctx.query.status) {
    condition.status = ctx.query.status;
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

  result.forEach((item, index) => {
    item.device_info = deviceInfos[index];
    item.channel = channelResult[index];
    item.user = userResult[index];
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
  const condition = {
    id: ctx.params.id,
  };

  if (ctx.user && ctx.user.type == constv.ADMIN_USER_TYPE.USER) {
    condition.user_id = ctx.user.id;
  }

  if (ctx.user && ctx.user.type == constv.ADMIN_USER_TYPE.CHANNEL) {
    condition.channel_id = ctx.user.id;
  }
  const result = await serviceOrder.findOne({
    where: condition,
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

  const payment = await serviceOrderPayment.findOne({
    where: {
      order_id: result.id,
    },
  });

  result.deviceInfos = deviceInfos;
  result.channel = channel;
  result.user = user;
  result.payment = payment;

  ctx.body = {
    code: 0,
    data: result,
  };
});

router.get('/:id/prepay', async (ctx) => {
  const order = await serviceOrder.findOne({
    where: {
      id: ctx.params.id,
    },
  });

  if (!ctx.query.openid) {
    ctx.throw(400, 'openid is required');
  }

  const prepay = await getOrderPrepayV3(order, ctx.query.openid);

  ctx.body = {
    code: 0,
    data: prepay,
  };
});

router.get('/:id/payment', async (ctx) => {
  const order = await serviceOrder.findOne({
    where: {
      id: ctx.params.id,
    },
  });

  if (order.status != constv.ORDER_PAY_STATUS.PENDING) {
    ctx.throw(400, '订单已过期或已支付');
  }

  if (!ctx.query.openid) {
    ctx.throw(400, 'openid is required');
  }

  let total_amount = order.total_amount;
  if(isPaymentTest()) {
    total_amount = 1;
    order.total_amount = total_amount;
  }

  const prepay = await wechatpay_api.getOrderPrepay(order, ctx.query.openid);
  const payment = await wechatpay_api.getOrderPayment(prepay.prepay_id);

  ctx.body = {
    code: 0,
    data: payment,
  };
});

async function createSign(content, hash='RSA-SHA256') {
  const cert = await fsPromise.readFile(`${path.join(__dirname, '../config')}/apiclient_key.pem`, 'utf-8');

  const sign = crypto.createSign(hash);
  sign.update(content);

  return sign.sign(cert, 'base64');
}

function createRandomString(len) {
  const data = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < len; i++) {
    str += data.charAt(Math.floor(Math.random() * data.length));
  }

  return str;
}

async function getOrderPrepayV3(order, openid) {
  const URL = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';

  const NOTIFICATION_URL = 'https://api.renxin-robot.com/pay/notification';

  const options = {
    appid: config.mini_program.appId,
    mchid: config.mini_program.mchId,
    description: `饪芯炒菜机器人: ${order.device_code}`,
    out_trade_no: order.code,
    notify_url: NOTIFICATION_URL,
    amount: {
      total: order.total_amount,
    },
    payer: {
      openid,
    },
  };

  const nonce_str = createRandomString(8);
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const sign_url = '/v3/pay/transactions/jsapi';
  const method = 'POST';

  const signStr = `${method}\n${sign_url}\n${timestamp}\n${nonce_str}\n${JSON.stringify(options)}\n`;

  const signature = await createSign(signStr);

  const auth = `WECHATPAY2-SHA256-RSA2048 mchid="${options.mchid}",nonce_str="${nonce_str}",timestamp="${timestamp}",signature="${signature}",serial_no="${config.mini_program.serial_no}"`
  
  let response = null;

  try {
    response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
      body: JSON.stringify(options),
    });
  } catch (error) {
    logger.error(error);
  }
  

  return response.json();

}

async function getOrderPaymentV3(prepay_id) {
  const options = {
    appId: config.mini_program.appId,
  };

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const nonce_str = createRandomString(8);
  const package = `prepay_id=${prepay_id}`;
  const sign_type = 'RSA';

  const sign_str = `${options.appId}\n${timestamp}\n${nonce_str}\n${package}\n`;
  const signature = await createSign(sign_str);

  const result = {
    timestamp: timestamp,
    nonce_str: nonce_str,
    package,
    sign_type: sign_type,
    pay_sign: signature,
  };

  return result;
}

module.exports = router;
