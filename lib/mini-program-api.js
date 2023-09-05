const MiniProgram = require('./mini-program');
const config = require('../config');

module.exports = new MiniProgram(config.mini_program.appId, config.mini_program.appSecret);