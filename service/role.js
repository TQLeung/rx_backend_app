
const model = require('../model');
const util = require('../util');

class Role {
  constructor() {

  }

  static instance(...args) {
    return new Role(...args);
  }

  async create(data) {
    const record = await model.role.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.role.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.role.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.role.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.role.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.role.count(option);
    return result;
  }
}

module.exports = Role;
