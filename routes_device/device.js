const router = require('koa-router')();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const sequelize = require('sequelize');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const { md5 } = require('../util');
const middleware = require('../middleware');
const moment = require('moment');
const serviceStoreEmployee = require('../service/store_employee').instance();
const serviceUserAdmin = require('../service/user_admin').instance();
const serviceAdmin = require('../service/admin').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();
const serviceUserStore = require('../service/user_store').instance();
const serviceOrder = require('../service/order').instance();

router.prefix('/api/v1/device-side');

router.get('/device/rent-info', middleware.deviceTokenRequired, async (ctx) => {
  const sn = ctx.query.sn;
  
  if (!sn) {
    ctx.throw(400, '缺少 SN 参数');
  }
  // find the current device journal
  const deviceJournal = await serviceDeviceJournal.findOne({
    where: {
      device_code: sn,
      rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
    },
  });

  if (!deviceJournal) {
    ctx.throw(400, 'found but no that device');
  }

  // find the store
  const store = await serviceUserStore.findOne({
    where: {
      id: deviceJournal.store_id,
    },
  });

  // find the order
  const order = await serviceOrder.findOne({
    where: {
      device_journal_id: deviceJournal.id,
      status: constv.ORDER_PAY_STATUS.PAID,
    },
    order: [
      ['created_at', 'DESC']
    ],
  });

  const result = {
    store: {
      name: store?.name,
    },
    sn: ctx.query.sn,
    order: {
      type: order?.type,
      commission_plan_type: order?.commission_plan_type,
      months: order?.months,
    },
    // time format
    // service_begin: deviceJournal.service_begin ? moment(deviceJournal.service_begin).utcOffset(8).format('YYYY.MM.DD HH:mm:ss'),
    service_begin: deviceJournal.service_begin ? moment(deviceJournal.service_begin) : null,
    service_end: deviceJournal.service_end ? moment(deviceJournal.service_end) : null,
    now: moment(),
  };

  ctx.body = {
    data: result,
  };
});

module.exports = router;
