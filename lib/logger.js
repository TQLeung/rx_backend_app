const config = require('../config');
const winston = require('winston');
const moment = require('moment');

let level = config.log.level;
const env = config.env;

if (env.IS_TEST) {
  level = 'debug';
}

if (env.IS_UNIT_TEST) {
  level = 'error';
}

/**
 *
 * @param label
 * @returns {[*,*]}
 */
function getTransports(label) {
  return [
    new winston.transports.Console({
      json: false,
      colorize: 'all',
      label,
      timestamp: () => moment().utcOffset(8).format(),
      level,
    }),
  ];
}

const logger = new winston.Logger({
  transports: getTransports(''),
});

const existLoggers = {};
logger.label = function (label) {
  if (!existLoggers[label]) {
    winston.loggers.add(label, {
      transports: getTransports(label),
    });
    existLoggers[label] = true;
  }
  return winston.loggers.get(label);
};
module.exports = logger;
