const logger = require('./logger').label('libs:load');
const path = require('path');
const fs = require('fs');

const join = path.resolve;
const readdir = fs.readdirSync;

module.exports = (app, root) => {
  readdir(root).forEach((file) => {
    const dir = join(root, file);
    // logger.info(dir);
    const stats = fs.lstatSync(dir);
    if (stats.isFile()) {
      const router = require(dir);
      if (typeof router.routes === 'function') {
        app.use(router.routes());
        logger.info(`load routes: ${file}`);
      }

      if (typeof router.allowedMethods === 'function') {
        app.use(router.allowedMethods());
      }
    }
  });
  logger.info('Finish loading routes.');
};
