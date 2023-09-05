const router = require('koa-router')();
const Joi = require('joi');
const db = require('../lib/db');
const { Op } = require('sequelize');
const models = require('../model');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const logger = require('../lib/logger').label('route:device_approval');
const { md5, paging, preZeroFill } = require('../util');
const moment = require('moment');
const middleware = require('../middleware');
const serviceDeviceCode = require('../service/device_code').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();
const serviceChannel = require('../service/channel').instance();
const serviceUser = require('../service/user').instance();
const serviceUserStore = require('../service/user_store').instance();
const serviceDeviceApproval = require('../service/device_approval').instance();

router.prefix('/admin/device/approval');
router.use(middleware.adminTokenRequired);

router.get('/', async (ctx) => {
  const pagination = paging(ctx.query);

  const condition = {};

  if (ctx.query.device_code) {
    condition.device_code = ctx.query.device_code;
  }

  if (ctx.query.type) {
    condition.type = ctx.query.type;
  }

  if (ctx.query.status) {
    condition.status = ctx.query.status;
  }

  const result = await serviceDeviceApproval.findAllByOption({
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

  // find the store record
  const storeResult = await Promise.all(result.map(item => serviceUserStore.findOne({
    where: {
      id: item.store_id,
    },
  })));

  result.forEach((item, index) => {
    item.device_info = deviceInfos[index];
    item.channel = channelResult[index];
    item.user = userResult[index];
    item.store = storeResult[index];
  });

  const count = await serviceDeviceApproval.count({
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
  const result = await serviceDeviceApproval.findOne({
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

  const store = await serviceUserStore.findOne({
    where: {
      id: result.store_id,
    },
  });

  result.deviceInfos = deviceInfos;
  result.channel = channel;
  result.user = user;
  result.store = store;

  ctx.body = {
    code: 0,
    data: result,
  };
});

router.put('/:id', async (ctx) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid(constv.DEVICE_APPROVAL_STATUS.ACCEPTED, constv.DEVICE_APPROVAL_STATUS.REJECTED)
      .required(),
    operator_remark: Joi.string(),
  });

  const validation = schema.validate(ctx.request.body);

  if (validation.error) {
    ctx.throw(400, validation.error);
  }

  const body = ctx.request.body;

  const data = {
    status: body.status,
    operator_remark: body.operator_remark,
  };

  // operator information
  data.operator = ctx.session.admin.name;
  data.operator_id = ctx.session.admin.id;
  data.operator_type = ctx.session.admin.type;
  data.operate_at = new Date();

  const trx = await db.transaction();

  try {
    const result = await serviceDeviceApproval.update(data, {
      where: {
        id: ctx.params.id,
        status: constv.DEVICE_APPROVAL_STATUS.PENDING,
      },
      fields: ['status', 'operator_remark', 'operator', 'operator_id', 'operator_type', 'operate_at'],
      transaction: trx,
    });

    const approval = await serviceDeviceApproval.findOne({
      where: {
        id: ctx.params.id,
      },
      transaction: trx,
    });

    if (!approval) {
      throw new Error('found but no that approval');
    }
  
    if (result[0] && body.status == constv.DEVICE_APPROVAL_STATUS.ACCEPTED) {
  
      if (approval.type == constv.DEVICE_APPROVAL_TYPE.WITHDRAWAL) {
        await serviceDeviceJournal.update({
          rent_status: constv.DEVICE_RENT_STATUS.HISTORY,
        }, {
          where: {
            device_id: approval.device_id,
            device_code: approval.device_code,
            rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
          },
          transaction: trx,
        });

        await serviceDeviceJournal.create({
          device_id: approval.device_id,
          device_code: approval.device_code,
          status: constv.DEVICE_STATUS.IN_STOREHOUSE,
        }, {
          transaction: trx,
        });

      } else if (approval.type == constv.DEVICE_APPROVAL_TYPE.DEPLOYMENT){

        await serviceDeviceJournal.update({
          channel_id: approval.channel_id,
          user_id: approval.user_id,
          store_id: approval.store_id,
          status: constv.DEVICE_STATUS.INACTIVE,
        }, {
          where: {
            device_id: approval.device_id,
            device_code: approval.device_code,
            rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
          },
          transaction: trx,
        });

      } else if (approval.type == constv.DEVICE_APPROVAL_TYPE.CHANGE) {
        await serviceDeviceJournal.update({
          rent_status: constv.DEVICE_RENT_STATUS.HISTORY,
        }, {
          where: {
            device_id: approval.device_id,
            device_code: approval.device_code,
            rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
          },
          transaction: trx,
        });

        await serviceDeviceJournal.create({
          device_id: approval.device_id,
          device_code: approval.device_code,
          status: constv.DEVICE_STATUS.INACTIVE,
          channel_id: approval.channel_id,
          user_id: approval.user_id,
          store_id: approval.store_id,
        }, {
          transaction: trx,
        });
      }
      
    } else if (result[0] && body.status == constv.DEVICE_APPROVAL_STATUS.REJECTED) {

      await serviceDeviceJournal.update({
        status: approval.journal_status,
      }, {
        where: {
          device_id: approval.device_id,
          device_code: approval.device_code,
          rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
        },
        transaction: trx,
      });

    }

    await trx.commit();
  } catch(err) {
    await trx.rollback();
    logger.error('##### err: ', JSON.stringify(err));
    throw err;
  } 

  ctx.body = {
    code: 1,
    message: '更新成功'
  };
});

module.exports = router;
