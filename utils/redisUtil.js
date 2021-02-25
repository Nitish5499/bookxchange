const asyncRedis = require('async-redis');
const httpResponse = require('http-status');

const { ErrorHandler } = require('$/utils/errorHandler');
const logger = require('$/config/logger');
const constants = require('../config/constants');

// Connect to Redis
const client = asyncRedis.createClient();

client.on('connect', () => {
	logger.info(constants.REDIS_CONNECTION_SUCCESS);
});

client.on('error', () => {
	throw new ErrorHandler(httpResponse.INTERNAL_SERVER_ERROR, constants.REDIS_CLIENT_ERROR);
});

exports.get = async (key) => {
	return client.get(key);
};

exports.set = async (key, value) => {
	await client.set(key, value);
};

exports.del = async (key) => {
	await client.del(key);
};
