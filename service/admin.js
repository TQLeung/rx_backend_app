
const model = require('../model');
const util = require('../util');

class Admin {
  constructor() {

  }

  static instance(...args) {
    return new Admin(...args);
  }

  async create(data) {
    const record = await model.admin.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.admin.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.admin.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.admin.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.admin.destroy(option);
    return result;
  }
}

module.exports = Admin;
