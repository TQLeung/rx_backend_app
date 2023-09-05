
const logger = require('../lib/logger').label('task:kafka:device-recipe');
const constv = require('../config/constv');
const moment = require('moment');
const config = require('../config');
const kafka = require('../lib/kafka');
const db = require('../lib/db');
const {
  md5,
  preZeroFill,
} = require('../util');
const kincoApi = require('../lib/kinco-api');
const serviceStoreEmployee = require('../service/store_employee').instance();
const serviceUserAdmin = require('../service/user_admin').instance();
const serviceAdmin = require('../service/admin').instance();
const serviceOrder = require('../service/order').instance();
const serviceDeviceJournal = require('../service/device_journal').instance();
const serviceUserStore = require('../service/user_store').instance();
const serviceDevieLoginLog = require('../service/device_login_log').instance();
const serviceDeviceRecipe = require('../service/device_recipe').instance();
const serviceDeviceRecipeFile = require('../service/device_recipe_file').instance();

const consumer = kafka.consumer({
  groupId: constv.KAFKA_CONSUMER_GROUP_ID.DEVICE_RECIPE,
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
    topic: constv.MQ_TOPIC.DEVICE_RECIPE,
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
  const body = messageData;

  // body structure
  /**
  {
    ts: 'ts',
    mach_no: 'device_code',
    mach_app: {
      menu_name: 'menu name',
      quantity: 1,
      weight: 400,
    },
  }
  */

  const trx = await db.transaction();
    
  try {

    const deviceJournal = await serviceDeviceJournal.findOne({
      where: {
        device_code: body.mach_no,
        rent_status: constv.DEVICE_RENT_STATUS.CURRENT,
      },
      transaction: trx,
    });
    
    //generate recipe no
    const now = moment().format('YYYYMMDDHHmm');
    const random_str = Math.random().toString().slice(2, 5);
    const no = `${now}${random_str}`;

    const recipeData = {
      name: body.mach_app?.menu_name,
      user_id: deviceJournal?.user_id,
      weight: 0,
      quantity: 1,
    };

    body.mach_app?.menu_weight && (recipeData.weight = body.mach_app.menu_weight);
    body.mach_app?.menu_quantity && (recipeData.quantity = body.mach_app.menu_quantity);

    const resultRecipe = await serviceDeviceRecipe.findOrCreate({
      where: recipeData,
      defaults: Object.assign({}, recipeData, {
        no,
      }),
      transaction: trx,
    });

    // save recipe file 
    const recipeFileData = {
      recipe_id: resultRecipe[0].id,
      recipe_no: resultRecipe[0].no,
      content: body.mach_app,
      device_id: deviceJournal?.device_id,
      device_code: body.mach_no,
      device_journal_id: deviceJournal.id,
    };

    // generate recipe file no.
    let max_no = await serviceDeviceRecipeFile.max('no', {
      where: {
        recipe_no: resultRecipe[0].no,
      },
      transaction: trx,
    });

    let number = 0;
    if (max_no) {
      number = parseInt(max_no.slice(-3));
    }

    const no_str = `${resultRecipe[0].no}${preZeroFill(number + 1, 3)}`;

    recipeFileData.no = no_str;

    await serviceDeviceRecipeFile.create(recipeFileData, {
      transaction: trx,
    });

    await trx.commit();
  } catch(err) {

    logger.error(err);
    await trx.rollback();
  }

}