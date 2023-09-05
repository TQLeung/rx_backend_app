
const logger = require('../lib/logger').label('task:kafka:device-login');
const constv = require('../config/constv');
const moment = require('moment');
const kafka = require('../lib/kafka');
const db = require('../lib/db');
const {
  md5,
} = require('../util');
const kincoApi = require('../lib/kinco-api');


const consumer = kafka.consumer({
  groupId: constv.KAFKA_CONSUMER_GROUP_ID.KINCO_SET_APP,
});

function start() {
  (async () => {
    await task2Run();
  })();
}

module.exports = {
  start,
};

async function task2Run() {
  await consumer.connect();

  await consumer.subscribe({
    topic: constv.MQ_TOPIC.KINCO_SET_APP,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      await task(JSON.parse(message.value.toString()));
    },
  });
}

async function task(messageData) {
  logger.info('### message data: ', messageData);
 
  // message data structure example

  // {
  //   mach_no: 'device sn'
  //   mach_app: { // json data
  //     topic: 'login',
  //     code: CODE.FAIL,
  //     message: '用户名或密码不正确',
  //   },
  //   ts: new Date().getTime(), // timestamp
  // }

  await kincoApi.setMachineApp(messageData);
}