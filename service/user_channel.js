
const model = require('../model');
const util = require('../util');

class UserChannel {
  constructor() {

  }

  static instance(...args) {
    return new UserChannel(...args);
  }

  async create(data) {
    const record = await model.user_channel.create(data);
    return record;
  }

  async bulkCreate(data) {
    const result = await model.user_channel.bulkCreate(data);
    return result;
  }

  async findAllByOption(option) {
    const records = await model.user_channel.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.user_channel.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.user_channel.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.user_channel.destroy(option);
    return result;
  }
}

module.exports = UserChannel;
