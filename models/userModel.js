const mongoose = require('mongoose');
const validator = require('validator');

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
});

// Mongoose -> Document Middleware
userSchema.post('save', (error, doc, next) => {
	if (error.name === 'MongoError' && error.code === 11000) {
		next(new ErrorHandler(409, 'Email already exists'));
	} else {
		next(error);
	}
});

const User = mongoose.model('User', userSchema);
module.exports = User;
