const Joi = require('joi');

const signup = {
	body: Joi.object().keys({
		email: Joi.string().email().required(),
		name: Joi.string().min(2).max(20).required(),
	}),
};

const signupVerify = {
	body: Joi.object().keys({
		email: Joi.string().email().required(),
		otp: Joi.string().length(6).required(),
	}),
};

const login = {
	body: Joi.object().keys({
		email: Joi.string().email().required(),
	}),
};

const loginVerify = {
	body: Joi.object().keys({
		email: Joi.string().email().required(),
		otp: Joi.string().length(6).required(),
	}),
};

const updateUser = {
	body: Joi.object().keys({
		name: Joi.string().min(2).max(20).required(),
		address: Joi.string().min(6).max(20).required(),
	}),
};

module.exports = {
	signup,
	signupVerify,
	login,
	loginVerify,
	updateUser,
};
