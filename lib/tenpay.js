const tenpay = require('tenpay');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const options = {
  appid: config.mini_program.appId,
  mchid: config.mini_program.mchId,
  partnerKey: config.mini_program.mchSecret,
  pfx: fs.readFileSync(`${path.join(__dirname, '../config')}/apiclient_key.pem`),
  notify_url: `${config.api_domain}/pay/notification`,
};

module.exports = new tenpay(options, true);