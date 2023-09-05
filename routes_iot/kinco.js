const router = require('koa-router')();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const sequelize = require('sequelize');
const moment = require('moment');
const models = require('../model');
const db = require('../lib/db');
const logger = require('../lib/logger').label('route:kinco');
const miniProgramApi = require('../lib/mini-program-api');
const constv = require('../config/constv');
const config = require('../config');
const { md5, localeTimeFormat, orderType2Number, 
  adminUserType2Number, employeeType2Number,
  commissionType2Chinese,
  preZeroFill,
 } = require('../util');
const middleware = require('../middleware');
const kincoApi = require('../lib/kinco-api');
const kafka = require('../lib/kafka');
const serviceIotLog = require('../service/iot_log').instance();
const serviceStoreEmployee = require('../service/store_employee').instance();
const serviceUserAdmin = require('../service/user_admin').instance();
const serviceAdmin = require('../service/admin').instance();
const serviceOrder = require('../service/order').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();
const serviceUserStore = require('../service/user_store').instance();
const serviceDeviceRecipe = require('../service/device_recipe').instance();
const serviceDeviceRecipeFile = require('../service/device_recipe_file').instance();

const TOKEN_OF_KINCO_WEBHOOK = 'rx-robot';
const WEBHOOK_TYPE = {
  EVT: 'mach_evt',
  IXS: 'mach_ixs',
  ERR: 'mach_err',
  APP: 'mach_app',
};

const MACH_APP_TYPE = {
  MENU: 'menu',
};


router.post('/kinco/iot', async (ctx) => {

  const token = ctx.query.token;

  if (token != TOKEN_OF_KINCO_WEBHOOK) {
    ctx.throw(400, 'not from kinco');
  }

  const body = ctx.request.body;

  if (ctx.query.evt == WEBHOOK_TYPE.APP && body.mach_app?.menu_data) {
    const producer = kafka.producer();

    await producer.connect();
    
    await producer.send({
      topic: constv.MQ_TOPIC.DEVICE_RECIPE,
      messages: [{
        value: JSON.stringify(body),
      }],
    });
    
    await producer.disconnect();
  }

  if (ctx.query.evt == WEBHOOK_TYPE.APP && body.mach_app) {
    Object.keys(body.mach_app).forEach(key => {
      if (typeof body.mach_app[key] == 'string') {
        body.mach_app[key] = body.mach_app[key].trim();
      }
    })  
  }
  
  // mq way
  if (ctx.query.evt == WEBHOOK_TYPE.APP && body.mach_app?.topic == 'login') {
    const producer = kafka.producer();

    await producer.connect();
    
    await producer.send({
      topic: constv.MQ_TOPIC.DEVICE_LOGIN,
      messages: [{
        value: JSON.stringify(body),
      }],
    });
    
    await producer.disconnect();
  }

  ctx.body = {
    code: 'OK',
  };

});

module.exports = router;
