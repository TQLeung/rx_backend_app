/*
 * @Author: Ethan 
 * @Date: 2023-04-17 17:33:10 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-04-17 17:37:52
 */

const model = require('../model');
const util = require('../util');

class UserStore {
  constructor() {

  }

  static instance(...args) {
    return new UserStore(...args);
  }

  async create(data) {
    const record = await model.user_store.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.user_store.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.user_store.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.user_store.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.user_store.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.user_store.count(option);
    return result;
  }

  async max(field, options) {
    const result = await model.user_store.max(field, options);
    return result;
  }

}

module.exports = UserStore;
