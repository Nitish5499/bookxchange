const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please enter the name of the book'],
	},
	author: {
		type: String,
		required: [true, 'Please enter the name of the author'],
	},
	link: {
		type: String,
	},
	address: {
		type: String,
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	likedBy: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
