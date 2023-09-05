/*
 * @Author: Ethan 
 * @Date: 2023-04-11 14:33:59 
 * @Last Modified by:   Ethan 
 * @Last Modified time: 2023-04-11 14:33:59 
 */

const model = require('../model');
const util = require('../util');

class DeviceCategory {
  constructor() {

  }

  static instance(...args) {
    return new DeviceCategory(...args);
  }

  async create(data) {
    const record = await model.device_category.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.device_category.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.device_category.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.device_category.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.device_category.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.device_category.count(option);
    return result;
  }

}

module.exports = DeviceCategory;
