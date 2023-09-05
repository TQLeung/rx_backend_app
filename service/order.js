/*
 * @Author: Ethan 
 * @Date: 2023-05-11 11:16:17 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-07-22 11:42:02
 */

const model = require('../model');
const util = require('../util');
const constv = require('../config/constv');
const db = require('../lib/db');
const logger = require('../lib/logger').label('service:order');
const moment = require('moment');

class Order {
  constructor() {

  }

  static instance(...args) {
    return new Order(...args);
  }

  async create(data, option) {
    const record = await model.order.create(data, option);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.order.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.order.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.order.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.order.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.order.count(option);
    return result;
  }

  async createOrderPayment(data, trx) {
    const result = await model.order_payment.findOrCreate({
      where: {
        order_id: data.order_id,
      },
      defaults: data,
      transaction: trx,
    });

    return result;
  }

  async processPaymentNotification(paymentData, order) {
    const trx = await db.transaction();
  
    try {
      await this.update({
        status: constv.ORDER_PAY_STATUS.PAID,
        payment_status: constv.PAYMENT_STATUS.PAID,
        pay_at: paymentData.success_time,
        payment_method: constv.PAYMENT_METHOD.WPPAY,
      }, {
        where: {
          id: order.id,
        },
        transaction: trx,
      });
  
      const toCreateData4OrderPayment = {
        user_id: order.user_id,
        order_id: order.id,
        order_no: order.code,
        transaction_id: paymentData.transaction_id,
        pay_type: paymentData.trade_type,
        order_amount: paymentData.amount.total,
        pay_amount: paymentData.amount.payer_total,
        pay_at: paymentData.success_time,
        openid: paymentData.payer.openid,
      };
  
      await this.createOrderPayment(toCreateData4OrderPayment, trx);

      const deviceJournal = await model.device_journal.findOne({
        where: {
          id: order.device_journal_id,
        },
      });
  
      if (deviceJournal?.service_end) {
        const data2Update = {};
  
        const serviceEnd = Math.max(new Date(), new Date(deviceJournal.service_end));
        data2Update.service_end = moment(serviceEnd).add(order.months, 'months');
  
        const resultUpdateJournal = await model.device_journal.update(data2Update, {
          where: {
            id: deviceJournal.id,
            rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
          },
          transaction: trx,
        });
  
        if (resultUpdateJournal[0] > 0) {
          await this.update({
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
  }
}

module.exports = Order;
