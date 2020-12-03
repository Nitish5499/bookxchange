const jwt = require('jsonwebtoken');

exports.getOTP = () => {
	return Math.floor(100000 + Math.random() * 900000);
};

exports.createToken = (id) => {
	return jwt.sign(
		{
			id,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_EXPIRES_IN,
		},
	);
};
