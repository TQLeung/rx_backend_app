const path = require('path');
const fs = require('fs');
const logger = require('../lib/logger').label('service:index');

const services = {};

const serviceDir = __dirname;
const fileList = fs.readdirSync(serviceDir);
logger.info(fileList);
fileList.forEach((fileName) => {
  // logger.info(fileName);
  if (fileName !== 'index.js' && fileName.indexOf('.js') !== -1) {
    const serviceName = fileName.split('.js')[0];
    const Service = require(`./${fileName}`);
    services[serviceName] = new Service();
    logger.info(services[serviceName]);
    logger.info('import service', serviceName);
  }
});

module.exports = services;
