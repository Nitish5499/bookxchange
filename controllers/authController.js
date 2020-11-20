const { ErrorHandler } = require('$/utils/errorHandler');

// Authorization check if the user have rights to do this action
exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new ErrorHandler(403, 'You are not allowed to do this action'), req, res, next);
		}
		next();
	};
};
