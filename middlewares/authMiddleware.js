const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const mongoose = require('mongoose');
const httpResponse = require('http-status');

const Session = require('$/models/sessionModel');

const redisUtil = require('$/utils/redisUtil');

const { ErrorHandler } = require('$/utils/errorHandler');
const logger = require('$/config/logger');
const constants = require('$/config/constants');

// Verification middleware
exports.verifyJWT = async (req, res, next) => {
	logger.info('verifying user JWT token');
	try {
		const token = req.cookies.jwt_token;
		if (!token) {
			return next(new ErrorHandler(httpResponse.UNAUTHORIZED, constants.RESPONSE_NOT_LOGGED_IN), req, res, next);
		}

		const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
		const { id } = decode;

		let user = await redisUtil.get(id);

		if (!user) {
			user = await Session.findOne({ userId: id, sessionToken: token });
			if (!user) {
				return next(new ErrorHandler(httpResponse.UNAUTHORIZED, constants.RESPONSE_NOT_LOGGED_IN), req, res, next);
			}
			logger.info(`Valid token found in MongoDB for user: ${id}`);
		} else {
			logger.info(`Valid token found in Redis for user: ${id}`);
		}

		req.user = mongoose.Types.ObjectId(id);
		next();
	} catch (err) {
		if (err.name === 'JsonWebTokenError' || err.name === 'SyntaxError') {
			next(new ErrorHandler(httpResponse.UNAUTHORIZED, constants.RESPONSE_NOT_LOGGED_IN));
		}
		next(err);
	}
};
