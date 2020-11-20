const base = require('$/controllers/baseController');

const User = require('$/models/userModel');

const { ErrorHandler } = require('$/utils/errorHandler');
const authUtil = require('$/utils/authUtil');
const externalUtil = require('$/utils/externalUtil');

exports.signup = async (req, res, next) => {
	try {
		const { name, email } = req.body;
		if (!name || !email) {
			throw new ErrorHandler(400, 'Missing required name and email parameters');
		}

		const otp = authUtil.getOTP();

		const dbResult = await User.create({
			name,
			email,
			otp,
			active: false,
		});

		let data;

		if (process.env.NODE_ENV !== 'production') {
			data = otp;
		} else {
			data = await externalUtil.sendEmail(dbResult.email, dbResult.name, otp);
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

exports.signupVerify = async (req, res, next) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) {
			throw new ErrorHandler(400, 'Missing required email and otp parameters');
		}

		const otpNum = parseInt(otp, 10);

		let dbUser = await User.findOne({
			email,
		});

		if (dbUser.active) {
			return next(new ErrorHandler(403, 'User email has already been verified'), req, res, next);
		}

		if (!dbUser || otpNum !== dbUser.otp) {
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
			return next(new ErrorHandler(403, 'Email not verified'), req, res, next);
		}

		const otp = authUtil.getOTP();

		dbUser = await User.findByIdAndUpdate(dbUser._id, {
			otp,
		});

		if (process.env.NODE_ENV !== 'production') {
			res.status(200).json({
				status: 'success',
				data: otp,
			});
		} else {
			externalUtil.sendEmail(dbUser.email, dbUser.name, otp);
			res.status(200).json({
				status: 'success',
				data: 'check mail',
			});
		}
	} catch (error) {
		next(error);
	}
};

exports.loginVerify = async (req, res, next) => {
	try {
		const { email, otp } = req.body;
		if (!otp || !email) {
			return next(new ErrorHandler(400, 'Missing required email or OTP parameters'), req, res, next);
		}

		const otpNum = parseInt(otp, 10);

		let user = await User.findOne({ email });

		if (!user) {
			return next(new ErrorHandler(401, 'Email not registered'), req, res, next);
		}

		if (!user.active) {
			return next(new ErrorHandler(403, 'Email not verified'), req, res, next);
		}

		if (user.otp !== otpNum) {
			return next(new ErrorHandler(401, 'Invalid OTP or email'), req, res, next);
		}

		user = await User.findByIdAndUpdate(user._id, {
			otp: '',
		});

		const jwtToken = authUtil.createToken(user.email);
		res.cookie('jwt_token', jwtToken);

		res.status(200).json({
			status: 'success',
			data: 'login successful',
		});
	} catch (err) {
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
