const router = require('koa-router')();
const moment = require('moment');

router.get('/', async (ctx) => {
  ctx.body = `Welcome to rx-api service, at ${moment()}, 👏👏👏`;
});

router.get('/ping', async (ctx) => {
  ctx.body = `RX-api is OKay, 👍😄, at ${moment()}`;
});

module.exports = router;
