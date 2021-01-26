const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const httpResponse = require('http-status');

const Session = require('$/models/sessionModel');

const { ErrorHandler } = require('$/utils/errorHandler');
const logger = require('$/config/logger');

// Verification middleware
exports.verifyJWT = async (req, res, next) => {
	logger.info('verifying user JWT token');
	try {
		const token = req.cookies.jwt_token;
		if (!token) {
			return next(
				new ErrorHandler(httpResponse.UNAUTHORIZED, 'You are not logged in! Please login in to continue'),
				req,
				res,
				next,
			);
		}

		const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
		const { id } = decode;

		const user = await Session.findOne({ userId: id, sessionToken: token });
		if (!user) {
			return next(
				new ErrorHandler(httpResponse.UNAUTHORIZED, 'You are not logged in! Please login in to continue'),
				req,
				res,
				next,
			);
		}

		req.user = user;
		logger.info(`user: ${user._id} has a valid JWT token in the request`);

		next();
	} catch (err) {
		if (err.message === 'invalid signature') {
			next(new ErrorHandler(httpResponse.UNAUTHORIZED, 'You are not logged in! Please login in to continue'));
		}
		next(err);
	}
};
