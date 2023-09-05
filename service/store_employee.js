
const model = require('../model');
const util = require('../util');

class StoreEmployee {
  constructor() {

  }

  static instance(...args) {
    return new StoreEmployee(...args);
  }

  async create(data) {
    const record = await model.store_employee.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.store_employee.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.store_employee.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.store_employee.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.store_employee.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.store_employee.count(option);
    return result;
  }
}

module.exports = StoreEmployee;
