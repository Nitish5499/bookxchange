const mongoose = require('mongoose');
const validator = require('validator');
const httpResponse = require('http-status');

const constants = require('$/config/constants');
const { ErrorHandler } = require('$/utils/errorHandler');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please fill your name'],
	},
	email: {
		type: String,
		required: [true, 'Please fill your email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email'],
	},
	otp: {
		type: Number,
	},
	active: {
		type: Boolean,
		required: [true, 'Active missing'],
	},
	location: {
		type: String,
		default: '',
	},
	booksOwned: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Book',
		},
	],
	booksLiked: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Book',
		},
	],
	notifications: [
		{
			text: {
				type: String,
			},
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
			isRead: {
				type: Boolean,
				default: false,
				required: [true, 'isRead missing'],
			},
			timestamp: {
				type: Date,
			},
		},
	],
});

// Mongoose -> Document Middleware
userSchema.post('save', (error, doc, next) => {
	if (error.name === constants.MONGO_ERROR && error.code === 11000) {
		next(new ErrorHandler(httpResponse.CONFLICT, constants.RESPONSE_EMAIL_EXISTS));
	} else {
		next(error);
	}
});

const User = mongoose.model('User', userSchema);
module.exports = User;
