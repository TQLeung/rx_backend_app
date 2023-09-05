const COS = require('cos-nodejs-sdk-v5');
const config = require('../config');

const bluebird = require('bluebird');

const cos = new COS({
  AppId: config.cos.AppId,
  SecretId: config.cos.SecretId,
  SecretKey: config.cos.SecretKey,
});

bluebird.promisifyAll(cos);

module.exports = cos;
