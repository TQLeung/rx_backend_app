

const model = require('../model');
const util = require('../util');

class DeviceRecipe {
  constructor() {

  }

  static instance(...args) {
    return new DeviceRecipe(...args);
  }

  async create(data, option = {}) {
    const record = await model.device_recipe.create(data, option);
    return record;
  }

  async findOrCreate(option) {
    const record = await model.device_recipe.findOrCreate(option);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.device_recipe.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.device_recipe.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.device_recipe.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.device_recipe.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.device_recipe.count(option);
    return result;
  }

}

module.exports = DeviceRecipe;
