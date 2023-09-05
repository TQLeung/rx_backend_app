
const model = require('../model');
const util = require('../util');

class UserRole {
  constructor() {

  }

  static instance(...args) {
    return new UserRole(...args);
  }

  async create(data) {
    const record = await model.user_role.create(data);
    return record;
  }

  async bulkCreate(data) {
    const result = await model.user_role.bulkCreate(data);
    return result;
  }

  async findAllByOption(option) {
    const records = await model.user_role.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.user_role.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.user_role.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.user_role.destroy(option);
    return result;
  }

  async upsert(values, options) {
    const result = await model.user_role.upsert(values, options);
    return result;
  }
}

module.exports = UserRole;
