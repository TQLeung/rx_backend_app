module.exports = {
  DOMAIN: 'https://api.renxin-robot.com',
  // order
  ORDER_PAY_STATUS: { // 订单状态
    PENDING: 'pending', // 待付款
    PAID: 'paid', // 已付款
    EXPIRED: 'expired', // 支付过期
  },
  ORDER_FROM_TYPE: {
    ADMIN: 'admin',
    MINI_PROGRAM: 'mini-program',
  },
  ORDER_TYPE: {
    TRIAL: 'trial', // 试用订单
    COMMON: 'common', // 普通订单
    OFFLINE: 'offline', // 线下订单
  },
  PAYMENT_METHOD: {
    ALIPAY: 'alipay', // 支付宝
    WPPAY: 'wppay', // 微信支付
    CASH: 'cash', // 现金支付
    TRIAL: 'trial', // 试用订单
    TRANSFER: 'transfer', // 转账
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    EXPIRED: 'expired',
  },
  REDIS_KEY: {
    VERIFICATION_CODE: 'verification:code:',
    VERIFICATION_CODE_SIGNUP: 'verification:code:signup:',
    VERIFICATION_CODE_PASSWORD_RESET: 'verification:code:passwordReset:',
    VERIFICATION_CODE_MOBILE_MODIFY: 'verification:code:mobileModify:',
    VERIFICATION_CODE_SET_PAY_PASSWORD: 'verification:code:setPayPassword:',
    VERIFICATION_CODE_MIN_MOBILE: 'verification:code:min:mobile:',
    VERIFICATION_CODE_DAY_MOBILE: 'verification:code:day:mobile:',
    VERIFICATION_CODE_DAY_IP: 'verification:code:day:ip:',
    CAPTCHA: 'captcha:',
    ACCESS_TOKEN: 'accessToken',
    MOBILE_SET: 'mobile_set',
    ID_NUMBER_SET: 'id_number_set',
    HOME_PRODUCT_DATA: 'home:product:data',
    WANT_OFFER_USER: 'want:offer:user:',
    CONFIG: 'config',
    USER_ADMIN_API: 'user:admin:api',
    WANT_STICK: 'want:stick',
    PRODUCT_COMMENT_DIRTY: 'product:comment:dirty',
    LOGIN_ERROR: 'login:error:',

    // channel code
    CHANNEL_CODE: 'channel:code',

    // user code
    USER_CODE: 'user:code',
  },
  VERIFICATION_CODE_SIGNUP_EX: 60 * 10, // 10分钟
  TOKEN_SECRET: 'renxin-cloud',
  TOKEN_KEY: 'x-api-token',
  CAPTCHA_ID_KEY: 'x-captcha-id',
  CAPTCHA_TOKEN_KEY: 'x-captcha-token',
  ADMIN_TOKEN_KEY: 'x-admin-token',
  ADMIN_TOKEN_SECRET: 'renxin-admin',

  MINI_PROGRAM_TOKEN_KEY: 'x-mini-token',
  MINI_PROGRAM_TOKEN_SECRET: 'renxin-mini-program',

  DEVICE_TOKEN_KEY: 'x-device-token',
  DEVICE_TOKEN_SECRET: 'renxin-device',

  //admin user type
  ADMIN_USER_TYPE: {
    ADMIN: 'admin',
    USER: 'user',
    CHANNEL: 'channel',
    EMPLOYEE: 'employee',
  },

  // user type
  USER_TYPE: {
    COMPANY: 'company',
    PERSONAL: 'personal',
  },

  // employee type
  EMPLOYEE_TYPE: {
    OPERATOR: '操作员',
    CHEF: '厨师',
    STORE_MANAGER: '店长',
  },

  OPERATION_MODE: {
    DIRECT: 'direct',
    AGENT: 'agent',
  },

  // commission payment cycle type
  COMMISSION_TYPE: {
    MONTHLY: 'monthly', // 月付
    QUARTER: 'quarter', // 季付
    SEMIANNUAL: 'semiannual', // 半年付
    ANNUAL: 'annual', // 年付
  },

  // device code is_used
  DEVICE_CODE_IS_USED: {
    NO: 0,
    YES: 1,
  },

  // device status
  DEVICE_STATUS: {
    IN_STOREHOUSE: '在库',
    INACTIVE: '未激活',
    OPERATING: '运营中',
    DEPLOYMENT: '布机中',
    CHANGE: '移机中',
    WITHDRAWAL: '撤机中',
    ERROR: '故障',
    END_OF_LIFE: '报废',
    LOCK: '锁机',
  },

  // device approval type
  DEVICE_APPROVAL_TYPE: {
    DEPLOYMENT: 'deployment', //布机
    CHANGE: 'change', //移机
    WITHDRAWAL: 'withdrawal', //撤机
  },

  // device approval status
  DEVICE_APPROVAL_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
  },

  // device rent status
  DEVICE_RENT_STATUS: {
    CURRENT: 'current',
    HISTORY: 'history',
  },

  ORDER_IS_CALCULATED: {
    NO: 0,
    YES: 1,
  },

  MQ_TOPIC: {
    DEVICE_LOGIN: 'device.login',
    KINCO_SET_APP: 'kinco.set.app',
    DEVICE_RECIPE: 'device.recipe',
  },

  KAFKA_CONSUMER_GROUP_ID: {
    DEVICE_LOGIN: 'device-login',
    KINCO_SET_APP: 'kinco-set-app',
    DEVICE_RECIPE: 'device-recipe',
  },

  RECIPE_FILE_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
  },
};
