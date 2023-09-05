
const objectid = require('objectid');
const uuid = require('uuid');
const config = require('../config');
const crypto = require('crypto');
const URL = require('url-parse');
const constv = require('../config/constv');
const moment = require('moment');

module.exports = {
  isProduction: () => process.env.NODE_ENV === 'production',
  isPaymentTest: () => process.env.PAYMENT_ENV === 'development',
  objectid: () => objectid().toString(),
  uuidv4: () => uuid.v4().replace(/-/g, ''),
  paging: (query) => {
    const page = Number.parseInt(query.page || 1, 10);
    const MAX_LIMIT = 50;
    const pageSize = Number.parseInt(query.limit > MAX_LIMIT ? MAX_LIMIT : query.limit || config.paging.limit, 10);
    const offset = (page - 1) * pageSize;
    return {
      page,
      offset,
      pageSize,
      limit: pageSize,
    };
  },
  md5: text => crypto.createHash('md5').update(text, 'utf-8').digest('hex'),
  sha1: text => crypto.createHash('sha1').update(text, 'utf-8').digest('hex'),
  querystringSort: (obj) => {
    const keyArr = Object.keys(obj).filter(key => obj[key] !== undefined && obj[key] !== '' && obj[key] !== null).sort();
    return keyArr.reduce((str, key, index, array) => {
      if (index < array.length - 1) {
        return `${str}${key}=${obj[key]}&`;
      }

      return `${str}${key}=${obj[key]}`;
    }, '');
  },
  aesEncrypt: (key, data) => {
    const cipher = crypto.createCipher('aes-128-cbc', key);
    let crypted = cipher.update(data, 'utf8', 'binary');
    crypted += cipher.final('binary');
    crypted = new Buffer(crypted, 'binary').toString('base64');
    return crypted;
  },
  aesDecrypt: (key, data) => {
    const bufferData = new Buffer(data, 'base64').toString('binary');
    const decipher = crypto.createDecipher('aes-128-cbc', key);
    let decoded = decipher.update(bufferData, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
  },
  rightInteger: (number) => {
    return Math.floor(number + 10e-6);
  },
  /**
   * remove empty attributes
   */
  clean: (obj) => {
    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined) {
        delete obj[key];
      }
    }
  },

  preZeroFill(num, fill) {
    const len = (`${num}`).length;
    return (Array(
      fill > len ? (fill - len) + 1 || 0 : 0,
    ).join(0) + num);
  },
  replaceImageCDN(str, sourceWord, destinationWord) {
    return str.replace(sourceWord, destinationWord);
  },
  judgeDeviceAgent: (userAgent) => {
    const deviceAgent = userAgent.toLowerCase();
    const flag = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    const MOBILE = 'mobile';
    const PC = 'pc';
    if (flag) {
      return MOBILE;
    }

    return PC;
  },
  commissionType2monthNumber: (type) => {
    let numberOfMonths = 0;
    switch(type) {
      case constv.COMMISSION_TYPE.MONTHLY:
        numberOfMonths = 1;
        break;
      case constv.COMMISSION_TYPE.QUARTER:
        numberOfMonths = 3;
        break;
      case constv.COMMISSION_TYPE.SEMIANNUAL:
        numberOfMonths = 6;
        break;
      case constv.COMMISSION_TYPE.ANNUAL:
        numberOfMonths = 12;
        break;
      default:
        numberOfMonths = 0;
    }

    return numberOfMonths;
  },
  createRandomString: (len) => {
    const data = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < len; i++) {
      str += data.charAt(Math.floor(Math.random() * data.length));
    }

    return str;
  },
  localeTimeFormat: (time_str, format_str) => {
    return moment(time_str).utcOffset(8).format(format_str)
  },
  orderType2Number: (type) => {
    let numberOfOrderType = 0;

    switch(type) {
      case constv.ORDER_TYPE.COMMON:
      case constv.ORDER_TYPE.OFFLINE:
        numberOfOrderType = 1;
        break;
      case constv.ORDER_TYPE.TRIAL:
        numberOfOrderType = 2;
        break;
      default:
        numberOfOrderType = 0;
    }

    return numberOfOrderType;
  },
  adminUserType2Number: (type) => {
    let numberOfUserType = 0;

    switch(type) {
      case constv.ADMIN_USER_TYPE.ADMIN:
        numberOfUserType = 1;
        break;
      case constv.ADMIN_USER_TYPE.USER:
        numberOfUserType = 2;
        break;
      case constv.ADMIN_USER_TYPE.EMPLOYEE:
        numberOfUserType = 3;
        break;
      default:
        numberOfUserType = 0;
    }

    return numberOfUserType;
  },
  employeeType2Number: (type) => {
    let numberOfEmployeeType = 0;

    switch(type) {
      case constv.EMPLOYEE_TYPE.STORE_MANAGER:
        numberOfEmployeeType = 1;
        break;
      case constv.EMPLOYEE_TYPE.CHEF:
        numberOfEmployeeType = 2;
        break;
      case constv.EMPLOYEE_TYPE.OPERATOR:
        numberOfEmployeeType = 3;
        break;
      default:
        numberOfEmployeeType = 0;
    }

    return numberOfEmployeeType;
  },
  commissionType2Chinese: (type) => {
    let chineseOfType = '';
    switch(type) {
      case constv.COMMISSION_TYPE.MONTHLY:
        chineseOfType = '月度付';
        break;
      case constv.COMMISSION_TYPE.QUARTER:
        chineseOfType = '季度付';
        break;
      case constv.COMMISSION_TYPE.SEMIANNUAL:
        chineseOfType = '半年付';
        break;
      case constv.COMMISSION_TYPE.ANNUAL:
        chineseOfType = '年度付';
        break;
      default:
        chineseOfType = '';
    }

    return chineseOfType;
  },
};
