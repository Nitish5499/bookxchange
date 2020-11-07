const User = require('$/models/userModel');
const base = require('$/controllers/baseController');
const auth = require('$/controllers/authController');
const userUtil = require('$/utils/userUtil');
const { ErrorHandler } = require('$/utils/errorHandler');

exports.signup = async (req, res, next) => {
	try {
		const { name, email } = req.body;
		if (!name || !email) {
			throw new ErrorHandler(400, 'Missing required name and email parameters');
		}

		const otp = userUtil.getOTP();

		const dbResult = await User.create({
			name: name,
			email: email,
			otp: otp,
			active: false,
		});

		var data = undefined;

		if (process.env.NODE_ENV == 'development') {
			data = otp;
		} else {
			data = await userUtil.sendEmail(dbResult.email, dbResult.name, otp);
			data = 'Email has been sent';
		}

		res.status(200).json({
			status: 'success',
			data: data,
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

		var dbUser = await User.findOne({
			email: email,
		});

		if (dbUser.active) {
			return next(new ErrorHandler(403, 'User email has already been verified'), req, res, next);
		}

		if (!dbUser || otp != dbUser.otp) {
			return next(new ErrorHandler(401, 'Email or otp is wrong'), req, res, next);
		}

		dbUser = await User.findByIdAndUpdate(dbUser._id, {
			otp: '',
			active: true,
		});

		const jwt = auth.createToken(dbUser.email);
		res.cookie('jwt_token', jwt);

		res.status(200).json({
			status: 'success',
			data: 'Email verified',
		});
	} catch (error) {
		next(error);
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

exports.getAllUsers = base.getAll(User);
exports.getUser = base.getOne(User);

// Don't update password on this
exports.updateUser = base.updateOne(User);
exports.deleteUser = base.deleteOne(User);
