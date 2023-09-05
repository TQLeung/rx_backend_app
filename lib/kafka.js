const { Kafka } = require('kafkajs');
const config = require('../config');

const env = config.env;

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: env.KAFKA_BROKERS?.split(','),
});

module.exports = kafka;