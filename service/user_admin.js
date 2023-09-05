
const model = require('../model');
const util = require('../util');

class UserAdmin {
  constructor() {

  }

  static instance(...args) {
    return new UserAdmin(...args);
  }

  async create(data) {
    const record = await model.user_admin.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.user_admin.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.user_admin.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.user_admin.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.user_admin.destroy(option);
    return result;
  }
}

module.exports = UserAdmin;
