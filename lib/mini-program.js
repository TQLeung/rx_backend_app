
const rp = require('request-promise');
const config = require('../config');
const constv = require('../config/constv');
const redis = require('../lib/ioredis');
const { URL } = require('url');

class MiniProgram {
  constructor(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
  }

  static instance() {
    
  }

  async code2Session(code) {
    const URL_CODE2SESSION = 'https://api.weixin.qq.com/sns/jscode2session';

    const GRANT_TYPE = 'authorization_code';
    const response = await rp({
      uri: URL_CODE2SESSION,
      qs: {
        appid: this.appId,
        secret: this.appSecret,
        js_code: code,
        grant_type: GRANT_TYPE,
      },
      json: true,
    });

    return response;
  }

  async getAccessTokenFromWechat() {
    const URL_ACCESS_TOKEN = 'https://api.weixin.qq.com/cgi-bin/token';
    const GRANT_TYPE = 'client_credential';
    const response = await rp({
      uri: URL_ACCESS_TOKEN,
      qs: {
        grant_type: GRANT_TYPE,
        appid: this.appId,
        secret: this.appSecret,
      },
      json: true,
    });

    if (response.errcode) {
      throw JSON.stringify(response);
    }

    return response;
  }

  async storeToCache(token, expireTime) {
    await redis.set(constv.REDIS_KEY.ACCESS_TOKEN, token, 'EX', expireTime);
  }

  async getAccessTokenFromCache() {
    const token = await redis.get(constv.REDIS_KEY.ACCESS_TOKEN);
    return token;
  }

  async createTicket(data) {
    const URL_CREATE_TICKET = 'https://api.weixin.qq.com/cgi-bin/qrcode/create';
    const accessToken = await this.getAccessTokenFromCache();
    const response = await rp({
      uri: URL_CREATE_TICKET,
      method: 'POST',
      qs: {
        access_token: accessToken,
      },
      body: data,
      json: true,
    });

    if (response.errcode) {
      throw JSON.stringify(response);
    }

    return response;
  }

  async showQrcode(ticket) {
    const URL_SHOW_QRCODE = 'https://mp.weixin.qq.com/cgi-bin/showqrcode';
    const url = new URL(URL_SHOW_QRCODE);

    url.searchParams.append('ticket', encodeURIComponent(ticket));

    return url.href;
  }

  async getOauthTokenByCode(code) {
    const URL_ACCESS_TOKEN = 'https://api.weixin.qq.com/sns/oauth2/access_token';
    const GRANT_TYPE = 'authorization_code';
    const response = await rp({
      uri: URL_ACCESS_TOKEN,
      qs: {
        grant_type: GRANT_TYPE,
        appid: this.appId,
        secret: this.appSecret,
        code,
      },
      json: true,
    });

    if (response.errcode) {
      throw JSON.stringify(response);
    }

    return response;
  }
}

module.exports = MiniProgram;
