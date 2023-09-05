
const model = require('../model');
const util = require('../util');

class CommissionPlan {
  constructor() {

  }

  static instance(...args) {
    return new CommissionPlan(...args);
  }

  async create(data) {
    const record = await model.commission_plan.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.commission_plan.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.commission_plan.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.commission_plan.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.commission_plan.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.commission_plan.count(option);
    return result;
  }
}

module.exports = CommissionPlan;
