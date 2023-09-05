
const CronJob = require('cron').CronJob;
const logger = require('../lib/logger').label('task:payment');
const constv = require('../config/constv');
const serviceOrder = require('../service/order').instance();
const wechatpay_api = require('../lib/wechatpay-v3-api');
const moment = require('moment');
const { Op } = require('sequelize');
const EXPIRE_TIME = 10; 

function start() {
  const job = new CronJob({
    cronTime: '0 */10 * * * *',
    onTick: () => {
      logger.info('start expired order');
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
      created_at: {
        [Op.lt]: moment().subtract(EXPIRE_TIME, 'minutes').toString(),
      },
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
        const result = await serviceOrder.update({
          status: constv.ORDER_PAY_STATUS.EXPIRED,
        }, {
          where: {
            id: order.id,
            status: constv.ORDER_PAY_STATUS.PENDING,
            created_at: {
              [Op.lt]: moment().subtract(EXPIRE_TIME, 'minutes').toString(),
            },
          },
          fields: ['status'],
        });

        if (result[0] > 0) {
          await wechatpay_api.closeOrder(order.code);
        }

      } catch(err) {
        logger.error(`order_no: ${order.code}`);
        logger.error(err);
      }
    }
  }
}
