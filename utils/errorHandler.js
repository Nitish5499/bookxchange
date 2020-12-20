const httpResponse = require('http-status');

const logger = require('$/config/logger');

class ErrorHandler extends Error {
	constructor(statusCode, message) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
	}
}

const handleError = (err, res) => {
	const { statusCode, message } = err;

	logger.error(`${err}, statuscode:${statusCode}`);

	res.status(statusCode || httpResponse.INTERNAL_SERVER_ERROR).json({
		status: 'error',
		code: statusCode || httpResponse.INTERNAL_SERVER_ERROR,
		message: message || 'Internal Server Error',
	});
};

module.exports = {
	ErrorHandler,
	handleError,
};
