const WechatPayV3 = require('./wechatpay-v3');
const config = require('../config');
const fs = require('node:fs');
const path = require('node:path');

const cert = fs.readFileSync(`${path.join(__dirname, '../config')}/apiclient_key.pem`, 'utf8');
const NOTIFICATION_URL = 'https://api.renxin-robot.com/pay/notification';

module.exports = new WechatPayV3(config.mini_program.appId, config.mini_program.appSecret,
                          config.mini_program.mchId, config.mini_program.mchSecret,
                          cert, config.mini_program.serial_no, config.mini_program.apiv3_private_key,
                          NOTIFICATION_URL);    