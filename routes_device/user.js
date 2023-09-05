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
const serviceOrder = require('../service/order').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();

router.prefix('/api/v1/device-side');

router.post('/user/login', async (ctx) => {

  const schema = Joi.object({
    name: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
    sn: Joi.string().trim().required(),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  const body = ctx.request.body;
  const password = md5(`${body.password}:${config.passwordSalt}`);

  let result = null;
  let type = null;

  const user = await serviceUserAdmin.findOne({
    where: {
      phone: body.name,
      password,
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
      name: body.name,
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
      name: body.name,
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

  if (!result) {
    ctx.throw(401, '用户名或密码不正确');
  }

  // generate token
  const EXPIRE_TIME = 60 * 60 * 16; // 16 hour
  const token = jwt.sign(Object.assign(result, {
    sn: body.sn,
    type,
  }), constv.DEVICE_TOKEN_SECRET, { expiresIn: EXPIRE_TIME });
  
  delete result.sn;

  // set device order service begin time
  if (user) {
    // find the current device journal
    const deviceJournal = await serviceDeviceJournal.findOne({
      where: {
        device_code: body.sn,
        rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
      },
    });

    if (deviceJournal?.service_begin === null) {
      const order = await serviceOrder.findOne({
        where: {
          device_journal_id: deviceJournal.id,
          status: constv.ORDER_PAY_STATUS.PAID,
        },
      });
      const now = moment();
      order && await serviceDeviceJournal.update({
        service_begin: now,
        service_end: moment(now).add(order.months, 'months')
      }, {
        where: {
          id: deviceJournal.id,
          service_begin: null,
        },
      });
    }
  }

  ctx.body = {
    data: Object.assign(result, {
      token,
    }),
  };

});

router.post('/user/employee/login', async (ctx) => {

  const schema = Joi.object({
    name: Joi.string().trim().required(),
    role: Joi.string().trim().valid(Object.values(constv.EMPLOYEE_TYPE))
      .error(new Error(`role 的取值只能是【${Object.values(constv.EMPLOYEE_TYPE)}】之一`)),
    password: Joi.string().trim().required(),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  const body = ctx.request.body;
  const password = md5(`${body.password}:${config.passwordSalt}`);

  const employee = await serviceStoreEmployee.findOne({
    where: {
      name: body.name,
      password,
      role: body.role,
    },
  });

  if (!employee) {
    ctx.throw(401, '用户名或密码不正确');
  }

  ctx.body = {};

});

module.exports = router;
