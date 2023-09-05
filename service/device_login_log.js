

const model = require('../model');
const util = require('../util');

class DeviceLoginLog {
  constructor() {

  }

  static instance(...args) {
    return new DeviceLoginLog(...args);
  }

  async create(data) {
    const record = await model.device_login_log.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.device_login_log.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.device_login_log.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.device_login_log.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.device_login_log.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.device_login_log.count(option);
    return result;
  }

}

module.exports = DeviceLoginLog;
