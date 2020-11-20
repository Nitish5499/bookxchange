const jwt = require('jsonwebtoken');

exports.getOTP = () => {
	return Math.floor(100000 + Math.random() * 900000);
};

exports.createToken = (email) => {
	return jwt.sign(
		{
			email,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_EXPIRES_IN,
		},
	);
};
