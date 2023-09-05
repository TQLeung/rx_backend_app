const logger = require('../lib/logger');
const model = require('../model');
const util = require('../util');

class User {
  constructor() {

  }

  static instance(...args) {
    return new User(...args);
  }

  async create(data) {
    // start a transaction
    const trx = await model.db.transaction();

    try {
      // save to table user
      const user = await model.user.create(data, {
        transaction: trx,
      });

      await model.user_admin.create({
        user_id: user.id,
        name: data.name,
        phone: data.phone,
        password: data.password,
      }, {
        transaction: trx,
      });

      await trx.commit();
      return user;
    } catch (err) {
      await trx.rollback();
      logger.error(err);
      throw err;
    }
  }

  async findAllByOption(option) {
    const records = await model.user.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.user.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.user.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.user.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.user.count(option);
    return result;
  }

  async max(field, option) {
    const result = await model.user.max(field, option);
    return result;
  }
}

module.exports = User;
