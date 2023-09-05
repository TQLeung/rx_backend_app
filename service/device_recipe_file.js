

const model = require('../model');
const util = require('../util');

class DeviceRecipeFile {
  constructor() {

  }

  static instance(...args) {
    return new DeviceRecipeFile(...args);
  }

  async create(data, option = {}) {
    const record = await model.device_recipe_file.create(data, option);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.device_recipe_file.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.device_recipe_file.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.device_recipe_file.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.device_recipe_file.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.device_recipe_file.count(option);
    return result;
  }

  async max(field, option = {}) {
    const result = await model.device_recipe_file.max(field, option);
    return result;
  }  

}

module.exports = DeviceRecipeFile;
