/*
 * @Author: Ethan 
 * @Date: 2023-04-12 15:09:06 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-04-12 15:09:27
 */

const model = require('../model');
const util = require('../util');

class DeviceFactory {
  constructor() {

  }

  static instance(...args) {
    return new DeviceFactory(...args);
  }

  async create(data) {
    const record = await model.device_factory.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.device_factory.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.device_factory.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.device_factory.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.device_factory.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.device_factory.count(option);
    return result;
  }

}

module.exports = DeviceFactory;
