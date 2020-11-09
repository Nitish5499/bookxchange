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
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
