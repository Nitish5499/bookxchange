const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const base = require('$/controllers/baseController');
const auth = require('$/controllers/authController');

const User = require('$/models/userModel');

const { ErrorHandler } = require('$/utils/errorHandler');
const userUtil = require('$/utils/userUtil');

exports.signup = async (req, res, next) => {
	try {
		const { name, email } = req.body;
		if (!name || !email) {
			throw new ErrorHandler(400, 'Missing required name and email parameters');
		}

		const otp = userUtil.getOTP();

		const dbResult = await User.create({
			name,
			email,
			otp,
			active: false,
		});

		let data;

		if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
			data = otp;
		} else {
			data = await userUtil.sendEmail(dbResult.email, dbResult.name, otp);
			data = 'Email has been sent';
		}

		res.status(200).json({
			status: 'success',
			data,
		});
	} catch (error) {
		next(error);
	}
};

exports.verify = async (req, res, next) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) {
			throw new ErrorHandler(400, 'Missing required email and otp parameters');
		}

		let dbUser = await User.findOne({
			email,
		});

		if (dbUser.active) {
			return next(new ErrorHandler(403, 'User email has already been verified'), req, res, next);
		}

		if (!dbUser || otp !== dbUser.otp) {
			return next(new ErrorHandler(401, 'Email or otp is wrong'), req, res, next);
		}

		dbUser = await User.findByIdAndUpdate(dbUser._id, {
			otp: '',
			active: true,
		});

		res.status(200).json({
			status: 'success',
			data: 'Email verified',
		});
	} catch (error) {
		next(error);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { email } = req.body;
		if (!email) {
			return next(new ErrorHandler(400, 'Missing required email parameter'), req, res, next);
		}
		let dbUser = await User.findOne({ email });
		if (!dbUser) {
			return next(new ErrorHandler(401, 'Email not registered'), req, res, next);
		}
		if (!dbUser.active) {
			return next(new ErrorHandler(401, 'Email not verified'), req, res, next);
		}
		const OTP = userUtil.getOTP();

		dbUser = await User.findByIdAndUpdate(dbUser._id, {
			otp: OTP,
		});

		if (process.env.NODE_ENV !== 'production') {
			res.status(200).json({
				status: 'success',
				data: OTP,
			});
		} else {
			userUtil.sendEmail(dbUser.email, dbUser.name, OTP);
			res.status(200).json({
				status: 'success',
				data: 'check mail',
			});
		}
	} catch (error) {
		next(error);
	}
};

exports.verifyOTP = async (req, res, next) => {
	try {
		const { email, otp } = req.body;
		if (!otp || !email) {
			return next(new ErrorHandler(400, 'Missing required email or OTP parameters'), req, res, next);
		}
		let user = await User.findOne({ email });

		if (!user) {
			return next(new ErrorHandler(401, 'Email not registered'), req, res, next);
		}
		if (!user.active) {
			return next(new ErrorHandler(401, 'Email not verified'), req, res, next);
		}
		if (user.otp !== otp) {
			return next(new ErrorHandler(401, 'Invalid OTP or email'), req, res, next);
		}

		user = await User.findByIdAndUpdate(user._id, {
			otp: '',
		});

		const resJWT = auth.createToken(user.email);
		res.cookie('jwt_token', resJWT);

		res.status(200).json({
			status: 'success',
			data: 'login successful',
		});
	} catch (err) {
		next(err);
	}
};

// verification middleware
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

exports.deleteMe = async (req, res, next) => {
	try {
		await User.findByIdAndUpdate(req.user.id, {
			active: false,
		});

		res.status(204).json({
			status: 'success',
			data: null,
		});
	} catch (error) {
		next(error);
	}
};

// exports.getAllUsers = base.getAll(User);
exports.getUser = base.getOne(User);

// Don't update password on this
exports.updateUser = base.updateOne(User);
exports.deleteUser = base.deleteOne(User);
