/*
 * @Author: Ethan 
 * @Date: 2023-05-08 11:20:21 
 * @Last Modified by:   Ethan 
 * @Last Modified time: 2023-05-08 11:20:21 
 */

const model = require('../model');
const util = require('../util');

class DeviceApproval {
  constructor() {

  }

  static instance(...args) {
    return new DeviceApproval(...args);
  }

  async create(data) {
    const record = await model.device_approval.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.device_approval.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.device_approval.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.device_approval.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.device_approval.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.device_approval.count(option);
    return result;
  }

}

module.exports = DeviceApproval;
