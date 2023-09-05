
const CronJob = require('cron').CronJob;
const logger = require('../lib/logger').label('task:token');
const constv = require('../config/constv');
const redis = require('../lib/ioredis');
const miniProgramApi = require('../lib/mini-program-api');

function start() {
  const job = new CronJob({
    cronTime: '00 30 */1 * * *',
    onTick: () => {
      logger.info('start refresh access token');
      (async () => {
        // await task2Run();
      })()
        .catch((err) => {
          logger.error(err);
        });
    },
    timeZone: 'Asia/Shanghai',
    runOnInit: true,
  });

  job.start();
}

module.exports = {
  start,
};

async function task2Run() {
  const token = await miniProgramApi.getAccessTokenFromWechat();
  const EXPIRE_TIME = 60 * 60 * 2;
  await miniProgramApi.storeToCache(token.access_token, EXPIRE_TIME);
}
