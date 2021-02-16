const Joi = require('joi');
const httpStatus = require('http-status');

const pickUtil = require('$/utils/pickUtil');
const { ErrorHandler } = require('$/utils/errorHandler');
const constants = require('$/config/constants');

const validate = (schema) => async (req, res, next) => {
	const validSchema = pickUtil(schema, ['params', 'query', 'body']);
	const object = pickUtil(req, Object.keys(validSchema));
	const { value, error } = Joi.compile(validSchema)
		.prefs({ errors: { label: 'key', wrap: { label: false } } })
		.validate(object);

	/*
	 * Handling validation errors
	 * 1. `object.unknown` represents an extra parameter. This is simply
	 * ignored during validation.
	 * 2. `any.required` represents a missing parameter. A generic response is used
	 * in order to mask the actual parameter name.
	 */
	if (error) {
		let errorMessage;
		if (error.details.map((details) => details.type).join(', ') !== 'object.unknown') {
			if (error.details.map((details) => details.type).join(', ') === 'any.required') {
				errorMessage = constants.RESPONSE_MISSING_PARAMETERS;
			} else {
				errorMessage = error.details.map((details) => details.message).join(', ');
			}
			return next(new ErrorHandler(httpStatus.BAD_REQUEST, errorMessage));
		}
	}
	Object.assign(req, value);
	return next();
};

module.exports = validate;
