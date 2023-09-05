/*
 * @Author: Ethan 
 * @Date: 2023-05-11 11:16:17 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-05-31 15:04:50
 */

const model = require('../model');
const util = require('../util');

class OrderPayment {
  constructor() {

  }

  static instance(...args) {
    return new OrderPayment(...args);
  }

  async create(data) {
    const record = await model.order_payment.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.order_payment.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.order_payment.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.order_payment.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.order_payment.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.order_payment.count(option);
    return result;
  }

}

module.exports = OrderPayment;
