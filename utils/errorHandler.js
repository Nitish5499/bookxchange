const httpResponse = require('http-status');

const logger = require('$/config/logger');
const constants = require('$/config/constants');

class ErrorHandler extends Error {
	constructor(statusCode, message) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
	}
}

const handleError = (err, res) => {
	let { statusCode, message } = err;
	const { name } = err;

	/*
	 * Handle MongoError and unexpected errors.
	 *
	 * In unexpected errors, the `statusCode`
	 * will be `undefined`.
	 */
	/* istanbul ignore if */
	if (name === constants.MONGO_ERROR || !statusCode) {
		logger.error(`Unhandled error: ${err}`);
		statusCode = httpResponse.INTERNAL_SERVER_ERROR;
		message = httpResponse[httpResponse.INTERNAL_SERVER_ERROR];
	}

	logger.error(`Error response: statusCode: ${statusCode}, name: ${name}, message: ${message}`);

	res.status(statusCode).json({
		status: constants.STATUS_ERROR,
		message,
	});
};

module.exports = {
	ErrorHandler,
	handleError,
};
