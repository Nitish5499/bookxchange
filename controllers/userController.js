const httpResponse = require('http-status');

const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const { ErrorHandler } = require('$/utils/errorHandler');
const authUtil = require('$/utils/authUtil');
const externalUtil = require('$/utils/externalUtil');
const redisUtil = require('$/utils/redisUtil');

const logger = require('$/config/logger');
const constants = require('$/config/constants');

exports.signup = async (req, res, next) => {
	logger.info('Inside signup function');
	try {
		const { name, email, location } = req.body;

		const reply = await redisUtil.get(location);

		if (reply !== '1') {
			logger.info(`User with non-operating location: "name":${name}, "email":${email}, "location":${location}`);
			res.status(httpResponse.OK).json({
				status: constants.STATUS_SUCCESS,
				data: constants.RESPONSE_USER_SIGNUP_INVALID_LOCATION,
			});
			return;
		}

		const otp = authUtil.getOTP();

		logger.info(`data: "name":${name}, "email":${email}, "location":${location}, "otp":${otp}`);

		const dbResult = await User.create({
			name,
			email,
			location,
			otp,
			active: false,
		});

		logger.info(`database user created: ${dbResult}`);

		let data;

		/* istanbul ignore else */
		if (process.env.NODE_ENV !== 'production') {
			data = otp;
		} else {
			data = await externalUtil.sendEmail(dbResult.email, dbResult.name, otp);
			data = constants.RESPONSE_USER_SIGNUP_SUCCESS;
		}

		logger.info('Email successfully sent');

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data,
		});
	} catch (error) {
		next(error);
	}
};

exports.signupVerify = async (req, res, next) => {
	logger.info('Inside signup verify function');
	try {
		const { email, otp } = req.body;

		const otpNum = parseInt(otp, 10);

		logger.info(`data: "email":${email}, "otp":${otp}`);

		let dbUser = await User.findOne({
			email,
		});

		if (!dbUser) {
			return next(new ErrorHandler(httpResponse.FORBIDDEN, constants.RESPONSE_USER_SIGNUP_VERIFY_FAIL), req, res, next);
		}

		if (dbUser.active) {
			return next(new ErrorHandler(httpResponse.FORBIDDEN, constants.RESPONSE_USER_SIGNUP_VERIFY_FAIL), req, res, next);
		}

		if (!dbUser || otpNum !== dbUser.otp) {
			return next(new ErrorHandler(httpResponse.UNAUTHORIZED, constants.RESPONSE_USER_AUTH_FAIL), req, res, next);
		}

		logger.info(`database user : ${dbUser}`);

		dbUser = await User.findByIdAndUpdate(dbUser._id, {
			otp: '',
			active: true,
		});

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: constants.RESPONSE_USER_SIGNUP_VERIFY_SUCCESS,
		});
	} catch (error) {
		next(error);
	}
};

exports.login = async (req, res, next) => {
	logger.info('Inside login function');
	try {
		const { email } = req.body;

		logger.info(`data: "email":${email}`);

		let dbUser = await User.findOne({ email });

		if (!dbUser) {
			return next(new ErrorHandler(httpResponse.FORBIDDEN, constants.RESPONSE_USER_AUTH_NO_EMAIL_FAIL), req, res, next);
		}

		if (!dbUser.active) {
			return next(
				new ErrorHandler(httpResponse.FORBIDDEN, constants.RESPONSE_USER_AUTH_NO_VERIFY_FAIL),
				req,
				res,
				next,
			);
		}

		logger.info(`database user: ${dbUser}`);

		const otp = authUtil.getOTP();

		dbUser = await User.findByIdAndUpdate(dbUser._id, {
			otp,
		});

		logger.info(`database user after update: ${dbUser}`);

		/* istanbul ignore else */
		if (process.env.NODE_ENV !== 'production') {
			res.status(httpResponse.OK).json({
				status: constants.STATUS_SUCCESS,
				data: otp,
			});
		} else {
			externalUtil.sendEmail(dbUser.email, dbUser.name, otp);
			logger.info('email sent successfully');
			res.status(httpResponse.OK).json({
				status: constants.STATUS_SUCCESS,
				data: constants.RESPONSE_USER_LOGIN_SUCCESS,
			});
		}
	} catch (error) {
		next(error);
	}
};

exports.loginVerify = async (req, res, next) => {
	logger.info('Inside loginVerify function');
	try {
		const { email, otp } = req.body;

		logger.info(`data: "email":${email}, "otp":${otp}`);

		const otpNum = parseInt(otp, 10);

		let user = await User.findOne({ email });

		if (!user) {
			return next(
				new ErrorHandler(httpResponse.FORBIDDEN, constants.RESPONSE_USER_AUTH_NO_VERIFY_FAIL),
				req,
				res,
				next,
			);
		}

		if (!user.active) {
			return next(
				new ErrorHandler(httpResponse.FORBIDDEN, constants.RESPONSE_USER_AUTH_NO_VERIFY_FAIL),
				req,
				res,
				next,
			);
		}

		if (user.otp !== otpNum) {
			return next(new ErrorHandler(httpResponse.UNAUTHORIZED, constants.RESPONSE_USER_AUTH_FAIL), req, res, next);
		}

		logger.info(`database user : ${user}`);

		user = await User.findByIdAndUpdate(user._id, {
			otp: '',
		});

		logger.info(`database user after update: ${user}`);

		const jwtToken = authUtil.createToken(user._id);

		redisUtil.set(user._id.toString(), jwtToken);

		await Session.create({
			userId: user._id,
			sessionToken: jwtToken,
		});

		res.cookie('jwt_token', jwtToken, { httpOnly: true, maxAge: process.env.JWT_SESSION_DB_TTL * 1000 });

		logger.info('JWT token created and added');

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: constants.RESPONSE_USER_LOGIN_VERIFY_SUCCESS,
		});
	} catch (err) {
		next(err);
	}
};

exports.getUser = async (req, res, next) => {
	logger.info('Inside getUser function');
	try {
		const { user } = req;

		logger.info(`request user: ${user}`);

		const dbUser = await User.aggregate([
			{ $match: { _id: user } },
			{
				$project: {
					notifications: {
						$filter: {
							input: '$notifications',
							as: 'notification',
							cond: { $eq: ['$$notification.isRead', false] },
						},
					},
					name: 1,
					email: 1,
					location: 1,
					_id: 0,
				},
			},
			{
				$unwind: {
					path: '$notifications',
					preserveNullAndEmptyArrays: true,
				},
			},
			{ $sort: { 'notifications.timestamp': -1 } },
			{
				$group: {
					_id: {
						name: '$name',
						email: '$email',
						location: '$location',
					},
					notifications: { $push: '$notifications' },
				},
			},
			{
				$project: {
					_id: false,
					name: '$_id.name',
					email: '$_id.email',
					location: '$_id.location',
					timestamp: { $first: '$notifications.timestamp' },
					'notifications.text': 1,
					'notifications.userId': 1,
				},
			},
		]);

		logger.info(
			`user data: "name":${dbUser[0].name}, "email":${dbUser[0].email}, "location":${dbUser[0].location}, "timestamp":${dbUser[0].timestamp}`,
		);

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: dbUser[0],
		});
	} catch (error) {
		next(error);
	}
};

exports.getOtherUser = async (req, res, next) => {
	logger.info('Inside getOtherUser function');
	try {
		const { user } = req;
		const { id } = req.params;

		logger.info(`Request userId: ${user}`);
		logger.info(`Request for userId: ${id}`);

		const dbUser = await User.findById(id).populate('booksOwned', 'name author link').select('name booksOwned');

		if (!dbUser) {
			return next(new ErrorHandler(httpResponse.NOT_FOUND, httpResponse[httpResponse.NOT_FOUND]), req, res, next);
		}

		logger.info(`Fetched userId: ${dbUser._id}`);

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: { user: dbUser },
		});
	} catch (error) {
		next(error);
	}
};

exports.updateUser = async (req, res, next) => {
	logger.info('Inside updateUser function');
	try {
		const { name, location } = req.body;
		let { user } = req;

		logger.info(`request user: ${user}`);

		const isServiceable = await redisUtil.get(location);

		if (isServiceable !== '1') {
			logger.info(`User with non-operating location update: "name":${name}, "location":${location}`);
			res.status(httpResponse.OK).json({
				status: constants.STATUS_SUCCESS,
				data: constants.RESPONSE_USER_SIGNUP_INVALID_LOCATION,
			});
			return;
		}

		user = await User.findByIdAndUpdate(user, {
			name,
			location,
		});

		logger.info(`user after update: ${user}`);

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: constants.RESPONSE_USER_UPDATE_SUCCESS,
		});
	} catch (err) {
		next(err);
	}
};

exports.readNotifications = async (req, res, next) => {
	logger.info('Inside readNotifications function');
	try {
		const { timestamp } = req.body;
		const { user } = req;

		logger.info(`Request user: ${user}`);

		const resTimestamp = new Date(timestamp).toISOString();

		await User.updateOne(
			{
				_id: user,
			},
			{ $set: { 'notifications.$[notification].isRead': true } },
			{
				arrayFilters: [{ 'notification.timestamp': { $lte: resTimestamp }, 'notification.isRead': false }],
				multi: true,
			},
		);

		logger.info('Updated "isRead" to "true" for existing notifications');

		const dbUser = await User.aggregate([
			{ $match: { _id: user } },
			{
				$project: {
					notifications: {
						$filter: {
							input: '$notifications',
							as: 'notification',
							cond: { $eq: ['$$notification.isRead', false] },
						},
					},
					name: 1,
					email: 1,
					location: 1,
					_id: 0,
				},
			},
			{
				$unwind: {
					path: '$notifications',
					preserveNullAndEmptyArrays: true,
				},
			},
			{ $sort: { 'notifications.timestamp': -1 } },
			{
				$group: {
					_id: null,
					notifications: { $push: '$notifications' },
				},
			},
			{
				$project: {
					_id: false,
					timestamp: { $first: '$notifications.timestamp' },
					'notifications.text': 1,
					'notifications.userId': 1,
				},
			},
		]);

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: {
				newNotifications: dbUser[0],
			},
		});
	} catch (err) {
		next(err);
	}
};

exports.logout = async (req, res, next) => {
	logger.info('Inside Logout function');
	try {
		const { user } = req;

		res.clearCookie('jwt_token');

		logger.info('Response cookie cleared');

		redisUtil.del(user.toString());

		await Session.deleteOne({ _id: user });

		logger.info('User session removed from database');

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: constants.RESPONSE_USER_LOGOUT_SUCCESS,
		});
	} catch (error) {
		next(error);
	}
};
