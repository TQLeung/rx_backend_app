
const router = require('koa-router')();
const Joi = require('joi');
const redis = require('../lib/ioredis');
const constv = require('../config/constv');
const config = require('../config');
const captcha = require('trek-captcha');
const logger = require('../lib/logger').label('util');
const utils = require('../util');

router.prefix('/api/v1/util');

// 获取验证码
router.get('/captcha', async (ctx) => {
  const { token, buffer } = await captcha({ size: config.captcha.length });
  logger.debug('captcha:', token);
  const captchaId = utils.uuidv4();
  const ok = await redis.set(`${constv.REDIS_KEY.CAPTCHA}${captchaId}`, token, 'EX', config.captcha.expireSeconds);
  if (!ok) {
    logger.error('获取验证码：redis存入验证码失');
    ctx.throw(500, '服务器出了点小问题，获取验证码失败，请稍后重试');
  }

  ctx.body = {
    data: {
      id: captchaId,
      captcha: buffer.toString('base64'),
    },
  };
});

/**
 * 验证验证码
 */
router.post('/captcha', async (ctx) => {
  const { error, value: reqBody } = Joi.validate(ctx.request.body, {
    id: Joi.string(),
    captcha: Joi.string().trim(),
  });
  error && ctx.throw(400, error.details[0].message);

  const captchaKey = `captcha:${reqBody.id}`;

  const redisCaptcha = await redis.get(captchaKey);
  // 获取后删除，需要用户重新获取验证码，防止暴力破解
  redis.del(captchaKey);
  if (!redisCaptcha) {
    ctx.throw(400, '验证码已过期');
  }

  ctx.body = {
    data: redisCaptcha === reqBody.captcha,
  };
});

module.exports = router;
