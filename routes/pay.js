const router = require('koa-router')();
const constv = require('../config/constv');
const config = require('../config');
const logger = require('../lib/logger').label('route:pay');
const moment = require('moment');
const crypto = require('node:crypto');
const { md5, paging, commissionType2monthNumber } = require('../util');
const wechatpay_api = require('../lib/wechatpay-v3-api');
const middleware = require('../middleware');
const db = require('../lib/db');
const serviceDeviceCode = require('../service/device_code').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();
const serviceChannel = require('../service/channel').instance();
const serviceUser = require('../service/user').instance();
const serviceOrder = require('../service/order').instance();
const serviceCommissionPlan = require('../service/commission_plan').instance();
const serviceOrderPayment = require('../service/order_payment').instance();

router.prefix('/pay');

router.post('/notification', middleware.verifySign4WechatPay, async (ctx) => {
  
  logger.info('##### pay notification');

  // decode
  const decodeData = wechatpay_api.decodeResource(ctx.request.body.resource);

  const decodeDataJson = JSON.parse(decodeData.toString('utf8'));
  logger.info('##### decode data: ', decodeDataJson);

  const order = await serviceOrder.findOne({
    where: {
      code: decodeDataJson.out_trade_no,
    },
  });

  if (!order) {
    ctx.throw(400, 'found but no that order');
  }

  const PAYMENT_SUCCESS = 'SUCCESS';
  if (decodeDataJson.trade_state == PAYMENT_SUCCESS 
        && order.status !== constv.ORDER_PAY_STATUS.PAID) {
    await serviceOrder.processPaymentNotification(decodeDataJson, order);
  }

  ctx.status = 200;

  ctx.body = {};
  
});

module.exports = router;
