
const model = require('../model');
const util = require('../util');

class DeviceCode {
  constructor() {

  }

  static instance(...args) {
    return new DeviceCode(...args);
  }

  async create(data) {
    const record = await model.device_code.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.device_code.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.device_code.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.device_code.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.device_code.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.device_code.count(option);
    return result;
  }

}

module.exports = DeviceCode;
