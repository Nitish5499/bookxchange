const Joi = require('joi');
const httpStatus = require('http-status');

const Book = require('$/models/bookModel');

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

	if (id && req.baseUrl === '/api/v1/books') {
		const book = await Book.findById(id);
		if (!book) {
			return next(new ErrorHandler(httpStatus.NOT_FOUND, 'Book not Found!'));
		}
	}

	return next();
};

module.exports = validate;
