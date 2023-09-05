const env = require('./env');

module.exports = {
  env,
  log: {
    level: env.LOG_LEVEL || 'debug',
  },
  sessionKey: 'renxin',
  passwordSalt: 'robot',
  database: {
    minConnections: 0,
    maxConnections: 100,
    maxIdleTime: 30000,
  },
  api_domain: 'https://api.renxin-robot.com',
  paging: {
    limit: 20,
  },
  /**
   * 验证码
   */
  captcha: {
    length: 5, // 验证码长度
    expireSeconds: 60 * 10, // 过期时间
  },

  wechat: {
    appId: 'wxf0e8e894dec26ff6',
    appSecret: '0a1173c884f574ecfe0fe0375b58ac14',
    token: 'renxin-robot',
  },

  mini_program: {
    appId: 'wx5ca3b65a860f5286',
    appSecret: 'cde3ba8169bba9fe774898494aaf8c26',
    token: 'renxin-robot',
    mchId: '1643735568',
    mchSecret: 'Renxinrobot2023Renxinrobot2023rx',
    serial_no: '2F16991F4D460C8E085B82DD07F277820895F8EF',
    apiv3_private_key: 'Renxinrobot2023Renxinrobot2023rx',
  },

  cos: {
    appId: 'wx5ca3b65a860f5286',
    SecretId: 'cde3ba8169bba9fe774898494aaf8c26',
    SecretKey: 'renxin-robot',
  },

  kinco_apikey: 'e934902d-6e3e-44c7-8133-9fff0be8e2c9',

  kafka: {
    clientId: 'renxin-api',
  },
  
};

