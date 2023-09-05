const Sequelize = require('sequelize');
const logger = require('./logger').label('libs:db');
const config = require('../config');

const env = config.env;

console.log(`DB_URL:||${env.DB_URL}`);
module.exports = new Sequelize(env.DB_URL, {
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  },
  pool: {
    minConnections: config.database.minConnections,
    maxConnections: config.database.maxConnections,
    maxIdleTime: config.database.maxIdleTime,
  },
  query: {
    raw: true,
  },
  // timezone: '+08:00',
  benchmark: true,
  logging: (msg, ms) => {
    logger.debug(`${msg}   (${ms}ms)`);
    if (ms > 50) logger.warn(`${msg} (${ms}ms)`);
  },
  logQueryParameters: true,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
});
