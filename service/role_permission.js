
const model = require('../model');
const util = require('../util');

class RolePermission {
  constructor() {

  }

  static instance(...args) {
    return new RolePermission(...args);
  }

  async create(data) {
    const record = await model.role_permission.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.role_permission.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.role_permission.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.role_permission.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.role_permission.destroy(option);
    return result;
  }

  async upsert(data, option) {
    const result = await model.role_permission.upsert(data, option);
    return result;
  }

}

module.exports = RolePermission;
