const fs = require('fs');
const logger = require('../lib/logger').label('tasks');
const sequelize = require('sequelize');

/**
 * 所有任务需要遵循如下规则：
 * export一个start函数：exports.start = function(){}
 * 此index文件会自动require并调用start方法
 * 如果不想被启动，也必须有一个空的start方法
 */
function start() {
  const fileList = fs.readdirSync(__dirname);
  fileList.forEach((fileName) => {
    if (fileName === 'index.js') {
      return;
    }
    logger.debug(`task:${fileName}`);
    require(`${__dirname}/${fileName}`).start();
  });
}

/**
 * 定时任务不需要在www中requier启动
 * 已经自动在pm2中另开进程启动
 */
(async () => {
  start();
})().catch((err) => {
  if (err instanceof sequelize.DatabaseError) {
    logger.error({
      original: err.original,
      parent: err.parent,
      sql: err.sql,
    });
  } else {
    logger.error(err.message);
    logger.error(err);
  }
});