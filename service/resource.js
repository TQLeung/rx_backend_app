
const model = require('../model');
const util = require('../util');

class Resource {
  constructor() {

  }

  static instance(...args) {
    return new Resource(...args);
  }

  async create(data) {
    const record = await model.resource.create(data);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.resource.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.resource.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.resource.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.resource.destroy(option);
    return result;
  }

  async bulkCreate(data) {
    const result = await model.resource.bulkCreate(data);
    return result;
  }

  async findOrCreate(options) {
    const result = await model.resource.findOrCreate(options);
    return result;
  }

  async findCreateFind(options) {
    const result = await model.resource.findCreateFind(options);
    return result;
  }

  async init(resourceJson) {
    const keys_level_first = Object.keys(resourceJson);

    const DEFAULT_PARENT_ID = 0;

    // insert record to database
    for (const key of keys_level_first) {
      const result = await this.findCreateFind({
        where: {
          name: key,
          parent_id: DEFAULT_PARENT_ID,
        },
        defaults: {
          name: key,
        },
      });
      const keys_level_second = Object.keys(resourceJson[key]);

      await Promise.all(keys_level_second.map(item => this.findCreateFind({
        where: {
          name: item,
          parent_id: result[0].id,
        },
        defaults: {
          name: item,
          parent_id: result[0].id,
        }
      })));

      // await this.bulkCreate(keys_level_second.map(item => {
      //   return {
      //     name: item,
      //     parent_id: result.id,
      //   };
      // }));
    }

  }
}

module.exports = Resource;
