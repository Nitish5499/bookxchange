const Joi = require('joi');

const { objectId } = require('$/validations/customValidation');

const addBook = {
	body: Joi.object().keys({
		name: Joi.string().required(),
		author: Joi.string().required(),
		link: Joi.string().uri().required(),
	}),
};

const getBook = {
	params: Joi.object().keys({
		id: Joi.string().custom(objectId),
	}),
};

const updateBook = {
	params: Joi.object().keys({
		id: Joi.string().custom(objectId),
	}),
	body: Joi.object().keys({
		name: Joi.string().required(),
		author: Joi.string().required(),
		link: Joi.string().uri().required(),
	}),
};

const deleteBook = {
	params: Joi.object().keys({
		id: Joi.string().custom(objectId),
	}),
};

const findBooks = {
	query: Joi.object().keys({
		distance: Joi.number().integer().min(1).max(10),
	}),
};

module.exports = {
	addBook,
	getBook,
	updateBook,
	deleteBook,
	findBooks,
};
