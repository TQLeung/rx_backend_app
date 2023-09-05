
const logger = require('../lib/logger');
const model = require('../model');
const util = require('../util');

class Channel {
  constructor() {

  }

  static instance(...args) {
    return new Channel(...args);
  }

  async create(data) {
    // start a transaction
    const trx = await model.db.transaction();

    try {
      // save to table channel
      const channel = await model.channel.create(data, {
        transaction: trx,
      });

      // save channel area
      const area = await model.channel_area.create({
        channel_id: channel.id,
        province: data.province,
        province_code: data.province_code,
        city: data.city,
        city_code: data.city_code,
        area: data.area,
        area_code: data.area_code,
      }, {
        transaction: trx,
      });

      await model.channel_admin.create({
        channel_id: channel.id,
        name: data.name,
        phone: data.phone,
        password: data.password,
      }, {
        transaction: trx,
      });

      await trx.commit();
      return channel;
    } catch (err) {
      await trx.rollback();
      logger.error(err);
      throw err;
    }
  }

  async findAllByOption(option) {
    const records = await model.channel.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.channel.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.channel.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.channel.destroy(option);
    return result;
  }

  async count(option) {
    const count = await model.channel.count(option);
    return count;
  }

  async max(field, option) {
    const result = await model.channel.max(field, option);
    return result;
  }
}

module.exports = Channel;
