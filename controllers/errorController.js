const { ErrorHandler } = require('$/utils/errorHandler');

exports.methods = (methods = ['GET']) => (req, res, next) => {
	if (methods.includes(req.method)) return next();
	return next(new ErrorHandler(405, 'Method not allowed'));
};
