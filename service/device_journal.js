/*
 * @Author: Ethan 
 * @Date: 2023-04-11 14:33:59 
 * @Last Modified by: Ethan
 * @Last Modified time: 2023-07-13 09:32:02
 */

const model = require('../model');
const util = require('../util');

class DeviceJournal {
  constructor() {

  }

  static instance(...args) {
    return new DeviceJournal(...args);
  }

  async create(data, options = {}) {
    const record = await model.device_journal.create(data, options);
    return record;
  }

  async findAllByOption(option) {
    const records = await model.device_journal.findAll(option);
    return records;
  }

  async findOne(option) {
    const record = await model.device_journal.findOne(option);
    return record;
  }

  async update(data, option) {
    const result = await model.device_journal.update(data, option);
    return result;
  }

  async destroy(option) {
    const result = await model.device_journal.destroy(option);
    return result;
  }

  async count(option) {
    const result = await model.device_journal.count(option);
    return result;
  }

  async decode(deviceCode) {
    // deviceCode 设备编码共19位
    // AB-00-00-A-M-Z-23-02-683499
    // 品类-类型-版本-工厂-生产-年份-月份-流水号
    const categoryCode = deviceCode.slice(0, 2);
    const typeCode = deviceCode.slice(2, 4);
    const versionCode = deviceCode.slice(4, 6);
    const factoryCode = deviceCode.slice(6, 7);

    const year = deviceCode.slice(9, 11);
    const month = deviceCode.slice(11, 13);

    // find information from db
    const deviceInfoRecord = await model.device_info.findOne({
      where: {
        category_code: categoryCode,
        type_code: typeCode,
        version_code: versionCode,
      },
    });

    const codeData = {
      category_code: categoryCode,
      type_code: typeCode,
      version_code: versionCode,
      factory_code: factoryCode,
    };

    if (!deviceInfoRecord) {
      return codeData;
    }

    const factoryRecord = await model.device_factory.findOne({
      where: {
        code: factoryCode,
      },
    });

    if (!factoryRecord) {
      codeData.factory_code = factoryCode;
      return codeData;
    }

    deviceInfoRecord.birth_date = `20${year}年${month}月`;
    deviceInfoRecord.factory_code = factoryCode,
    deviceInfoRecord.factory = factoryRecord.name;

    return deviceInfoRecord;
  }

}

module.exports = DeviceJournal;
