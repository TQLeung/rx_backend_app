
const logger = require('../lib/logger').label('task:kafka:device-login');
const constv = require('../config/constv');
const moment = require('moment');
const config = require('../config');
const kafka = require('../lib/kafka');
const db = require('../lib/db');
const {
  md5,
  localeTimeFormat,
  orderType2Number, 
  adminUserType2Number,
  employeeType2Number,
  commissionType2Chinese,
} = require('../util');
const kincoApi = require('../lib/kinco-api');
const serviceIotLog = require('../service/iot_log').instance();
const serviceStoreEmployee = require('../service/store_employee').instance();
const serviceUserAdmin = require('../service/user_admin').instance();
const serviceAdmin = require('../service/admin').instance();
const serviceOrder = require('../service/order').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();
const serviceUserStore = require('../service/user_store').instance();
const serviceDevieLoginLog = require('../service/device_login_log').instance();

const consumer = kafka.consumer({
  groupId: constv.KAFKA_CONSUMER_GROUP_ID.DEVICE_LOGIN,
});

function start() {
  (async () => {
    await task2Run();
  })();
}

module.exports = {
  start,
};

async function task2Run() {
  await consumer.connect();

  await consumer.subscribe({
    topic: constv.MQ_TOPIC.DEVICE_LOGIN,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      await task(JSON.parse(message.value.toString()));
    },
  });
}

async function task(messageData) {
  logger.info('### message data: ', messageData);
  const body = messageData;

  // body structure
  /**
  {
    ts: 'ts',
    mach_no: 'device_code',
    mach_app: {
      topic: 'login',
      name: 'login name',
      password: 'login password',
    },
  }
  */

  const mach_app = body.mach_app;

  const password = md5(`${mach_app.password}:${config.passwordSalt}`);

  let result = null;
  let type = null;

  const user = await serviceUserAdmin.findOne({
    where: {
      phone: mach_app.name,
      password,
    },
  });

  const deviceJournal = await serviceDeviceJournal.findOne({
    where: {
      device_code: body.mach_no,
      rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
    },
  });

  if (user) {
    result = {
      id: user.id,
      name: user.name,
      phone: user.phone,
    };
    type = constv.ADMIN_USER_TYPE.USER;
  }

  const employee = await serviceStoreEmployee.findOne({
    where: {
      name: mach_app.name,
      password,
    },
  });

  if (employee) {
    result = {
      id: employee.id,
      name: employee.name,
      role: employee.role,
    };
    type = constv.ADMIN_USER_TYPE.EMPLOYEE;
  }

  const admin = await serviceAdmin.findOne({
    where: {
      name: mach_app.name,
      password,
    },
  });

  if (admin) {
    result = {
      id: admin.id,
      name: admin.name,
    };
    type = constv.ADMIN_USER_TYPE.ADMIN;
  }

  const CODE = {
    FAIL: 0,
    SUCCESS: 1,
    SUCCESS_BUT_NO_MATCH: 2,
    SUCCESS_BUT_NO_ORDER: 3,
  };

  if (!result) {
    logger.warn('username or password is not correct');
    //set mach app to device through iot 
    await kincoApi.setMachineApp({
      mach_no: body.mach_no,
      mach_app: {
        topic: 'login',
        code: CODE.FAIL,
        message: '用户名或密码不正确',
      },
      ts: new Date().getTime(),
    });

    return;
  }

  Object.assign(result, {
    sn: body.mach_no,
    type,
  });

  let need_to_first_active = 0;
  let first_active_flag = 0;

  if (!deviceJournal.activated_at && user) {
    need_to_first_active = 1;
  }

  if ((user && user.user_id != deviceJournal.user_id)
    || (employee && employee.store_id != deviceJournal.store_id)
    ) {
      logger.warn('the user do not bind that device');
      //set mach app to device through iot 
      await kincoApi.setMachineApp({
        mach_no: body.mach_no,
        mach_app: {
          topic: 'login',
          code: CODE.SUCCESS_BUT_NO_MATCH,
          message: '您的帐号暂未绑定该设备',
        },
        ts: new Date().getTime(),
      });

      return;
  }

  // save to device login log
  await serviceDevieLoginLog.create({
    device_code: body.mach_no,
    user_id: result.id,
    user_name: result.name,
    user_type: type,
    device_journal_id: deviceJournal.id,
  });

  const order = await serviceOrder.findAllByOption({
    where: {
      device_journal_id: deviceJournal.id,
      status: constv.ORDER_PAY_STATUS.PAID,
      is_calculated: constv.ORDER_IS_CALCULATED.NO,
    },
  });
  
  // check order
  if (type != constv.ADMIN_USER_TYPE.ADMIN && !deviceJournal.service_begin && !order.length) {
    logger.warn('the device do not have paid order');

    await kincoApi.setMachineApp({
      mach_no: body.mach_no,
      mach_app: {
        topic: 'login',
        code: CODE.SUCCESS_BUT_NO_ORDER,
        message: '未付费',
      },
      ts: new Date().getTime(),
    });

    return;
  }

  // set device order service begin time
  if (need_to_first_active) {
    // find the current device journal
    const deviceJournal = await serviceDeviceJournal.findOne({
      where: {
        device_code: body.mach_no,
        rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
        user_id: user.user_id,
      },
    });

    if (!deviceJournal) {
      logger.warn('the user do not bind that device');
      //set mach app to device through iot 
      await kincoApi.setMachineApp({
        mach_no: body.mach_no,
        mach_app: {
          topic: 'login',
          code: CODE.SUCCESS_BUT_NO_MATCH,
          message: '您的帐号暂未绑定该设备',
        },
        ts: new Date().getTime(),
      });

      return;
    }

    const now = moment();
    logger.debug('order: ', JSON.stringify(order));
    const months = order.map(item => item.months).reduce((accumulator, current_item) => accumulator + current_item, 0);

    logger.info('months: ', months);

    const data2Update = {
      status: constv.DEVICE_STATUS.OPERATING,
      activated_at: new Date(),
    };
    
    data2Update.service_begin = new Date(Math.min(new Date(), deviceJournal.service_begin ? new Date(deviceJournal.service_begin) : new Date()));
    
    if (deviceJournal.service_end) {
      data2Update.service_end = new Date(moment(deviceJournal.service_end).add(months, 'months'));
    } else {
      data2Update.service_end = new Date(moment(now).add(months, 'months'));
    }

    const trx = await db.transaction();

    try {
      const updateResult = await serviceDeviceJournal.update(data2Update, {
        where: {
          id: deviceJournal.id,
          service_begin: null,
          status: constv.DEVICE_STATUS.INACTIVE,
          activated_at: null,
        },
        fields: ['status', 'service_begin', 'service_end', 'activated_at'],
        transaction: trx,
      });

      if (updateResult[0] > 0) {
        await serviceOrder.update({
          is_calculated: constv.ORDER_IS_CALCULATED.YES,
        }, {
          where: {
            device_journal_id: deviceJournal.id,
            status: constv.ORDER_PAY_STATUS.PAID,
            is_calculated: constv.ORDER_IS_CALCULATED.NO,
          },
          fields: ['is_calculated'],
          transaction: trx,
        });

        first_active_flag = 1;
      }

      await trx.commit();
    } catch(err) {
      await trx.rollback();

      logger.error('##### err: ', JSON.stringify(err));
      throw err;
    }

  }

  // set mach app to device through iot

  const deviceRentInfo = await getDeviceRentInfo(body.mach_no);

  const data = Object.assign({}, result, deviceRentInfo, {
    first_active_flag,
  });

  delete data.sn;

  // if login user is admin, don't lock
  if (data.type == constv.ADMIN_USER_TYPE.ADMIN) {
    data.lock = 0;
  }

  // string to number for device
  data.type = adminUserType2Number(data.type);
  data.role = employeeType2Number(data.role);

  // for device
  if (data.lock) {
    delete data.type;
    delete data.role;
  }

  await kincoApi.setMachineApp({
    mach_no: body.mach_no,
    mach_app: {
      topic: 'login',
      code: CODE.SUCCESS,
      ...data,
    },
    ts: new Date().getTime(),
  });

}

async function getDeviceRentInfo(device_code) {
  // find the current device journal
  const deviceJournal = await serviceDeviceJournal.findOne({
    where: {
      device_code: device_code,
      rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
    },
  });

  // find the store
  const store = deviceJournal && await serviceUserStore.findOne({
    where: {
      id: deviceJournal.store_id,
    },
  });

  // find the order
  const order = deviceJournal && await serviceOrder.findOne({
    where: {
      device_journal_id: deviceJournal.id,
      status: constv.ORDER_PAY_STATUS.PAID,
    },
    order: [
      ['created_at', 'DESC']
    ],
  });

  const now = new Date();

  const result = {
    store_name: store?.name,
    sn: device_code,
    order_type: order?.type,
    commission_plan_type: order?.commission_plan_type,
    months: order?.months,
    service_begin: null,
    service_end: null,
    now,
    lock: 0,
    within_seven: 0,
  };

  if (deviceJournal?.service_begin) {
    result.service_begin = deviceJournal.service_begin;
    result.service_end = deviceJournal.service_end;
  }

  if (result.service_end < result.now) {
    result.lock = 1;
  } else {
    if (moment(result.service_end).diff(result.now, 'days') <= 7) {
      result.within_seven = 1;
    }
  }

  // data format
  result.now = Math.floor(new Date(result.now).getTime() / 1000);
  
  if (result.service_begin) {
    result.service_begin_str = localeTimeFormat(result.service_begin, 'YYYY.MM.DD');
    result.service_begin = Math.floor(new Date(result.service_begin).getTime() / 1000);;
  } else {
    result.service_begin_str = null;
  }

  if (result.service_end) {
    result.service_end_str = localeTimeFormat(result.service_end, 'YYYY.MM.DD');
    result.service_end = Math.floor(new Date(result.service_end).getTime() / 1000);
  } else {
    result.service_end_str = null;
  }

  result.order_type = orderType2Number(result.order_type);
  result.commission_plan_type = commissionType2Chinese(result.commission_plan_type);

  return result;
}