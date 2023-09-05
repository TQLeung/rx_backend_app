const Kinco = require('kinco');
const config = require('../config');

module.exports = new Kinco(config.kinco_apikey);