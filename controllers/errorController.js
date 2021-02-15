const httpResponse = require('http-status');

const { ErrorHandler } = require('$/utils/errorHandler');

exports.methods = (methods = ['GET']) => (req, res, next) => {
	if (methods.includes(req.method)) return next();
	return next(new ErrorHandler(httpResponse.METHOD_NOT_ALLOWED, httpResponse[httpResponse.METHOD_NOT_ALLOWED]));
};
