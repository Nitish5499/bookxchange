const Joi = require('joi');
const httpStatus = require('http-status');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');

const pickUtil = require('$/utils/pickUtil');
const { ErrorHandler } = require('$/utils/errorHandler');

const validate = (schema) => async (req, res, next) => {
	const validSchema = pickUtil(schema, ['params', 'query', 'body']);
	const object = pickUtil(req, Object.keys(validSchema));
	const { value, error } = Joi.compile(validSchema)
		.prefs({ errors: { label: 'key', wrap: { label: false } } })
		.validate(object);

	if (error) {
		const errorMessage = error.details.map((details) => details.message).join(', ');
		return next(new ErrorHandler(httpStatus.BAD_REQUEST, errorMessage));
	}
	Object.assign(req, value);

	const { id } = req.params;

	if (id) {
		let isPresent;
		if (req.baseUrl === '/api/v1/users') {
			isPresent = await User.findById(id);
		} else {
			isPresent = await Book.findById(id);
		}

		if (!isPresent) {
			return next(new ErrorHandler(httpStatus.NOT_FOUND, 'Not found'));
		}
	}

	return next();
};

module.exports = validate;
