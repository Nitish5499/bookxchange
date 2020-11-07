class ErrorHandler extends Error {
	constructor(statusCode, message) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
	}
}

const handleError = (err, res) => {
	const { statusCode, message } = err;
	res.status(statusCode || 500).json({
		status: 'error',
		code: statusCode || 500,
		message: message || 'Internal Server Error',
	});
};

module.exports = {
	ErrorHandler,
	handleError,
};
