const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const httpResponse = require('http-status');

const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const { ErrorHandler } = require('$/utils/errorHandler');
const authUtil = require('$/utils/authUtil');
const externalUtil = require('$/utils/externalUtil');
const logger = require('$/config/logger');

exports.signup = async (req, res, next) => {
	logger.info('Inside signup function');
	try {
		const { name, email } = req.body;

		const otp = authUtil.getOTP();

		logger.info(`data: "name":${name}, "email":${email}, "otp":${otp}`);

		const dbResult = await User.create({
			name,
			email,
			otp,
			active: false,
		});

		logger.info(`database user created: ${dbResult}`);

		let data;

		if (process.env.NODE_ENV !== 'production') {
			data = otp;
		} else {
			data = await externalUtil.sendEmail(dbResult.email, dbResult.name, otp);
			data = 'Email has been sent';
		}

		logger.info('Email successfully sent');

		res.status(httpResponse.OK).json({
			status: 'success',
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

		if (dbUser.active) {
			return next(new ErrorHandler(httpResponse.FORBIDDEN, 'User email has already been verified'), req, res, next);
		}

		if (!dbUser || otpNum !== dbUser.otp) {
			return next(new ErrorHandler(httpResponse.UNAUTHORIZED, 'Email or otp is wrong'), req, res, next);
		}

		logger.info(`database user : ${dbUser}`);

		dbUser = await User.findByIdAndUpdate(dbUser._id, {
			otp: '',
			active: true,
		});

		res.status(httpResponse.OK).json({
			status: 'success',
			data: 'Email verified',
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
			return next(new ErrorHandler(httpResponse.UNAUTHORIZED, 'Email not registered'), req, res, next);
		}

		if (!dbUser.active) {
			return next(new ErrorHandler(httpResponse.FORBIDDEN, 'Email not verified'), req, res, next);
		}

		logger.info(`database user: ${dbUser}`);

		const otp = authUtil.getOTP();

		dbUser = await User.findByIdAndUpdate(dbUser._id, {
			otp,
		});

		logger.info(`database user after update: ${dbUser}`);

		if (process.env.NODE_ENV !== 'production') {
			res.status(httpResponse.OK).json({
				status: 'success',
				data: otp,
			});
		} else {
			externalUtil.sendEmail(dbUser.email, dbUser.name, otp);
			logger.info('email sent successfully');
			res.status(httpResponse.OK).json({
				status: 'success',
				data: 'check mail',
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
			return next(new ErrorHandler(httpResponse.UNAUTHORIZED, 'Email not registered'), req, res, next);
		}

		if (!user.active) {
			return next(new ErrorHandler(httpResponse.FORBIDDEN, 'Email not verified'), req, res, next);
		}

		if (user.otp !== otpNum) {
			return next(new ErrorHandler(httpResponse.UNAUTHORIZED, 'Invalid OTP or email'), req, res, next);
		}

		logger.info(`database user : ${user}`);

		user = await User.findByIdAndUpdate(user._id, {
			otp: '',
		});

		logger.info(`database user after update: ${user}`);

		const jwtToken = authUtil.createToken(user._id);

		await Session.create({
			userId: user._id,
			sessionToken: jwtToken,
		});

		res.cookie('jwt_token', jwtToken, { httpOnly: true, maxAge: process.env.JWT_SESSION_DB_TTL * 1000 });

		logger.info('JWT token created and added');

		res.status(httpResponse.OK).json({
			status: 'success',
			data: 'login successful',
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
			{ $match: { _id: user.userId } },
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
					address: 1,
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
						address: '$address',
					},
					notifications: { $push: '$notifications' },
				},
			},
			{
				$project: {
					_id: false,
					name: '$_id.name',
					email: '$_id.email',
					address: '$_id.address',
					timestamp: { $first: '$notifications.timestamp' },
					'notifications.text': 1,
					'notifications.userId': 1,
				},
			},
		]);

		logger.info(
			`user data: "name":${dbUser[0].name}, "email":${dbUser[0].email}, "address":${dbUser[0].address}, "timestamp":${dbUser[0].timestamp}`,
		);

		res.status(httpResponse.OK).json({
			status: 'success',
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

		logger.info(`User session: ${user}`);
		logger.info(`Request for userId: ${id}`);

		const dbUser = await User.findById(id).populate('booksOwned', 'name author link').select('name booksOwned');

		logger.info(`Fetched userId: ${dbUser._id}`);

		res.status(httpResponse.OK).json({
			status: 'success',
			data: { user: dbUser },
		});
	} catch (error) {
		next(error);
	}
};

exports.updateUser = async (req, res, next) => {
	logger.info('Inside updateUser function');
	try {
		const { name, address } = req.body;
		let { user } = req;

		logger.info(`request user: ${user}`);

		user = await User.findByIdAndUpdate(user.userId, {
			name,
			address,
		});

		logger.info(`user after update: ${user}`);

		res.status(httpResponse.OK).json({
			status: 'success',
			data: 'update successful',
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
				_id: user.userId,
			},
			{ $set: { 'notifications.$[notification].isRead': true } },
			{
				arrayFilters: [{ 'notification.timestamp': { $lte: resTimestamp }, 'notification.isRead': false }],
				multi: true,
			},
		);

		logger.info('Updated "isRead" to "true" for existing notifications');

		const dbUser = await User.aggregate([
			{ $match: { _id: user.userId } },
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
					address: 1,
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
			status: 'success',
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
		const token = req.cookies.jwt_token;
		if (!token) {
			return next(new ErrorHandler(httpResponse.UNAUTHORIZED, 'You are not logged in'), req, res, next);
		}

		res.clearCookie('jwt_token');

		logger.info('user cookie cleared');

		const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
		const { id } = decode;

		await Session.deleteOne({
			userId: id,
			sessionToken: token,
		});

		logger.info('user session removed from db');

		res.status(httpResponse.OK).json({
			status: 'success',
			data: 'successfully logged out',
		});
	} catch (error) {
		// Do not care about malformed JWT tokens
		if (error.name === 'JsonWebTokenError' || error.name === 'SyntaxError') {
			res.status(httpResponse.OK).json({
				status: 'success',
				data: 'successfully logged out',
			});
		} else {
			next(error);
		}
	}
};
