const db = require('../lib/db');
const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
const logger = require('../lib/logger').label('models:index');

const models = {
  sequelize: db, // db instance
  db, // alias to sequelize
};

const modelDir = __dirname;
const fileList = fs.readdirSync(modelDir);
// logger.info(fileList);
fileList.forEach((fileName) => {
  // logger.info(fileName);
  if (fileName !== 'index.js' && fileName.indexOf('.js') !== -1) {
    const modelName = fileName.split('.js')[0];
    // models[modelName] = db.import(path.join(modelDir, fileName)); // v4 -> v6
    models[modelName] = require(path.join(modelDir, fileName))(db, Sequelize.DataTypes);
    // console.log(models[modelName]);
    logger.info('import model', modelName);
  }
});

models.user.belongsTo(models.channel, {
  foreignKey: { name: 'channel_id' }
});

models.channel.hasMany(models.channel_area, {
  foreignKey: { name: 'channel_id' }
});

models.role.belongsToMany(models.resource, { through: models.role_permission });
models.resource.belongsToMany(models.role, { through: models.role_permission });

module.exports = models;
