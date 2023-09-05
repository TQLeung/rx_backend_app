/*
 * @Author: Ethan 
 * @Date: 2023-05-08 11:20:21 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-05-11 14:20:47
 */

const model = require('../model');
const util = require('../util');

class IOT_Log {
  constructor() {

  }

  static instance(...args) {
    return new IOT_Log(...args);
  }

  async create(data) {
    const record = await model.iot_log.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.iot_log.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.iot_log.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.iot_log.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.iot_log.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.iot_log.count(option);
    return result;
  }

}

module.exports = IOT_Log;
