const Wechat = require('./wechat');
const config = require('../config');

module.exports = new Wechat(config.wechat.appId, config.wechat.appSecret);