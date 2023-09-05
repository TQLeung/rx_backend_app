

const model = require('../model');
const util = require('../util');

class DeviceInfo {
  constructor() {

  }

  static instance(...args) {
    return new DeviceInfo(...args);
  }

  async create(data) {
    const record = await model.device_info.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.device_info.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.device_info.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.device_info.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.device_info.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.device_info.count(option);
    return result;
  }

}

module.exports = DeviceInfo;
