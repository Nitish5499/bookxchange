const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('$/models/userModel');

const { ErrorHandler } = require('$/utils/errorHandler');

// Verification middleware
exports.verifyJWT = async (req, res, next) => {
	try {
		const token = req.cookies.jwt_token;
		if (!token) {
			return next(new ErrorHandler(401, 'You are not logged in! Please login in to continue'), req, res, next);
		}

		const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
		const { email } = decode;

		const user = await User.findOne({ email });
		if (!user) {
			return next(new ErrorHandler(401, 'This user does not exist'), req, res, next);
		}

		req.user = user;
		next();
	} catch (err) {
		if (err.message === 'invalid signature') {
			next(new ErrorHandler(401, 'You are not logged in! Please login in to continue'));
		}
		next(err);
	}
};
