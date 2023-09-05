
const config = require('../config');
const constv = require('../config/constv');
const crypto = require('node:crypto');
const { createRandomString } = require('../util');
const x509 = require('@peculiar/x509');

class WechatPayV3 {
  constructor(appId, appSecret, mchId, mchSecret, private_key, serial_no, apiv3_private_key, notify_url) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.mchId = mchId;
    this.mchSecret = mchSecret;
    this.private_key = private_key;
    this.serial_no = serial_no;
    this.apiv3_private_key = apiv3_private_key;
    this.notify_url = notify_url;
  }

  static instance() {
    
  }

  createSign(content, hash='RSA-SHA256') {
    const sign = crypto.createSign(hash);
    sign.update(content);
  
    return sign.sign(this.private_key, 'base64');
  }
  
  async getOrderPrepay(order, openid) {
    const URL = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';
  
    const options = {
      appid: this.appId,
      mchid: this.mchId,
      description: `饪芯炒菜机器人: ${order.device_code}`,
      out_trade_no: order.code,
      notify_url: this.notify_url,
      amount: {
        total: order.total_amount,
      },
      payer: {
        openid,
      },
    };
  
    const nonce_str = createRandomString(8);
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const sign_url = '/v3/pay/transactions/jsapi';
    const method = 'POST';
  
    const signStr = `${method}\n${sign_url}\n${timestamp}\n${nonce_str}\n${JSON.stringify(options)}\n`;
  
    const signature = this.createSign(signStr);
  
    const auth = `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonce_str}",timestamp="${timestamp}",signature="${signature}",serial_no="${this.serial_no}"`
    
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
        'Accept-Language': 'zh-CN',
      },
      body: JSON.stringify(options),
    });
  
    const responseJson = await response.json();
    if (responseJson.code) {
      throw new Error(JSON.stringify(responseJson));
    } else {
      return responseJson;
    }
  
  }

  async getOrderPayment(prepay_id) {
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const nonce_str = createRandomString(8);
    const pack_age = `prepay_id=${prepay_id}`;
    const sign_type = 'RSA';
  
    const sign_str = `${this.appId}\n${timestamp}\n${nonce_str}\n${pack_age}\n`;
    const signature = this.createSign(sign_str);
  
    const result = {
      timestamp: timestamp,
      nonce_str: nonce_str,
      package: pack_age,
      sign_type: sign_type,
      pay_sign: signature,
    };
  
    return result;
  }

  decodeResource(data) {
    const AUTH_KEY_LENGTH = 16;
  
    const { ciphertext, associated_data, nonce } = data;
  
    const key_bytes = Buffer.from(this.apiv3_private_key, 'utf8');
  
    const nonce_bytes = Buffer.from(nonce, 'utf8');
  
    const associated_data_bytes = Buffer.from(associated_data, 'utf8');
  
    const ciphertext_bytes = Buffer.from(ciphertext, 'base64');
  
    const cipherdata_length = ciphertext_bytes.length - AUTH_KEY_LENGTH;
  
    const cipherdata_bytes = ciphertext_bytes.slice(0, cipherdata_length);
  
    const auth_tag_bytes = ciphertext_bytes.slice(cipherdata_length, ciphertext_bytes.length);
  
    const decipher = crypto.createDecipheriv('aes-256-gcm', key_bytes, nonce_bytes);
  
    decipher.setAuthTag(auth_tag_bytes);
    decipher.setAAD(Buffer.from(associated_data_bytes));
  
    const output = Buffer.concat([
      decipher.update(cipherdata_bytes),
      decipher.final(),
    ]);
  
    return output;
  
  }

  async getCertificates() {
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const nonce_str = createRandomString(8);
    const sign_url = '/v3/certificates';
    const method = 'GET';

    const signStr = `${method}\n${sign_url}\n${timestamp}\n${nonce_str}\n\n`;

    const signature = this.createSign(signStr);

    const auth = `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonce_str}",timestamp="${timestamp}",signature="${signature}",serial_no="${this.serial_no}"`
    
    const URL = 'https://api.mch.weixin.qq.com/v3/certificates';
    const response = await fetch(URL, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json',
        'Accept-Language': 'zh-CN',
      },
    });
  
    const responseJson = await response.json();
    if (responseJson.code) {
      throw new Error(JSON.stringify(responseJson));
    } else {
      return responseJson;
    }
  }

  async decodeCertificates() {
    const response = await this.getCertificates();

    if (!response) {
      throw new Error('get certificates fail');
    }

    const certificates = typeof response.data == 'string' ? JSON.parse(response.data) : response.data;

    for (let cert of certificates) {
      const output = this.decodeResource(cert.encrypt_certificate);
      cert.decrypt_certificate = output.toString();
      const beginIndex = cert.decrypt_certificate.indexOf('-\n');
      const endIndex = cert.decrypt_certificate.indexOf('\n-');
      const str = cert.decrypt_certificate.substring(beginIndex + 2, endIndex);
      const x509Certificate = new x509.X509Certificate(Buffer.from(str, 'base64'));
      const public_key = Buffer.from(x509Certificate.publicKey.rawData).toString('base64')
      cert.public_key = `-----BEGIN PUBLIC KEY-----\n` + public_key + `\n-----END PUBLIC KEY-----`
    }

    //TODO: save into redis or file?
    return certificates;
  }

  async verifySign({ timestamp, nonce, serial, body, signature }, repeatVerify = true) {
    const data = `${timestamp}\n${nonce}\n${typeof body == 'string' ? body : JSON.stringify(body)}\n`;
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(Buffer.from(data));

    let verifySerialNoPass = false;
    const certificates = await this.decodeCertificates();
    for(let cert of certificates) {
      if (cert.serial_no == serial) {
        verifySerialNoPass = true;
        return verify.verify(cert.public_key, signature, 'base64');
      }
    }

    if(!verifySerialNoPass && repeatVerify) {
      await this.decodeCertificates();
      return await this.verifySign({ timestamp, nonce, serial, body, signature }, false);
    } else {
      throw new Error('平台证书序列号不相符');
    }

  }

  async getOrderPaymentFromWechat(order_no) {
    const URL_ORDER_FROM_WECHAT = `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${order_no}`;
    const url = new URL(URL_ORDER_FROM_WECHAT);
    url.searchParams.set('mchid', encodeURIComponent(this.mchId));

    const timestamp = Math.floor(new Date().getTime() / 1000);
    const nonce_str = createRandomString(8);
    const sign_url = `${url.pathname}${url.search}`;
    const method = 'GET';

    const signStr = `${method}\n${sign_url}\n${timestamp}\n${nonce_str}\n\n`;

    const signature = this.createSign(signStr);

    const auth = `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonce_str}",timestamp="${timestamp}",signature="${signature}",serial_no="${this.serial_no}"`
    
    const response = await fetch(url.href, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json',
        'Accept-Language': 'zh-CN',
      },
    });

    const responseJson = await response.json();
    if (responseJson.code) {
      throw new Error(JSON.stringify(responseJson));
    } else {
      return responseJson;
    }
  }

  async closeOrder(order_no) {
    const URL_CLOSE_ORDER = `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${order_no}/close`;
    const url = new URL(URL_CLOSE_ORDER);

    const options = {
      mchid: this.mchId,
    };

    const timestamp = Math.floor(new Date().getTime() / 1000);
    const nonce_str = createRandomString(8);
    const sign_url = `${url.pathname}`;
    const method = 'POST';

    const signStr = `${method}\n${sign_url}\n${timestamp}\n${nonce_str}\n${JSON.stringify(options)}\n`;

    const signature = this.createSign(signStr);

    const auth = `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonce_str}",timestamp="${timestamp}",signature="${signature}",serial_no="${this.serial_no}"`;
    
    const response = await fetch(url.href, {
      method,
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept-Language': 'zh-CN',
        'Accept': 'application/json',
      },
      body: JSON.stringify(options),
    });

    return response.status == 204;
  }
}

module.exports = WechatPayV3;
