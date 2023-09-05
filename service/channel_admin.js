
const model = require('../model');
const util = require('../util');

class ChannelAdmin {
  constructor() {

  }

  static instance(...args) {
    return new ChannelAdmin(...args);
  }

  async create(data) {
    const record = await model.channel_admin.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.channel_admin.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.channel_admin.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.channel_admin.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.channel_admin.destroy(option);
    return result;
  }
}

module.exports = ChannelAdmin;
