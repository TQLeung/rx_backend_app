
const CronJob = require('cron').CronJob;
const logger = require('../lib/logger').label('task:payment');
const constv = require('../config/constv');
const redis = require('../lib/ioredis');
const serviceOrder = require('../service/order').instance();
const wechatpay_api = require('../lib/wechatpay-v3-api');

function start() {
  const job = new CronJob({
    cronTime: '0 */5 * * * *',
    onTick: () => {
      logger.info('start get payment from wechat');
      (async () => {
        await task2Run();
      })()
        .catch((err) => {
          logger.error(err);
        });
    },
    timeZone: 'Asia/Shanghai',
    runOnInit: true,
  });

  job.start();
}

module.exports = {
  start,
};

async function task2Run() {
  // get pending order

  const orderPending = await serviceOrder.findAllByOption({
    where: {
      status: constv.ORDER_PAY_STATUS.PENDING,
    },
    limit: 10,
    offset: 0,
    order: [
      ['created_at', 'DESC']
    ],
  });

  if (orderPending && orderPending.length > 0) {
    for (const order of orderPending) {
      try {
        // get order payment from wechat
        const payment = await wechatpay_api.getOrderPaymentFromWechat(order.code);
        const SUCCESS = 'SUCCESS';
        if (payment.trade_state == SUCCESS && order.status == constv.ORDER_PAY_STATUS.PENDING) {
          await serviceOrder.processPaymentNotification(payment, order);
        }

      } catch(err) {
        logger.error(`order_no: ${order.code}`);
        logger.error(err);
      }
    }
  }
}
