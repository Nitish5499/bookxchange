/* eslint no-restricted-syntax: 0 */
/* eslint guard-for-in: 0 */

const mongoose = require('mongoose');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

let userData = require('$/config/testData/userData.json');
let bookData = require('$/config/testData/bookData.json');

exports.populate = async (req, res, next) => {
	try {
		/* eslint-disable global-require */
		// Load different data for test environment
		if (process.env.NODE_ENV === 'test') {
			userData = require('$/test/data/userData.json');
			bookData = require('$/test/data/bookData.json');
		}
		/* eslint-enable global-require */

		/*
		 * Populate Users
		 */
		let { users } = userData;
		for (const user in users) {
			user._id = mongoose.Types.ObjectId(user._id);

			for (let bookOwned in user.booksOwned) {
				bookOwned = mongoose.Types.ObjectId(bookOwned);
			}

			for (let bookLiked in user.booksLiked) {
				bookLiked = mongoose.Types.ObjectId(bookLiked);
			}
		}

		users = await User.insertMany(users);

		/*
		 * Populate Books
		 */
		let { books } = bookData;
		for (const book in books) {
			book._id = mongoose.Types.ObjectId(book._id);
			book.owner = mongoose.Types.ObjectId(book.owner);

			for (let likedBy in book.likedBy) {
				likedBy = mongoose.Types.ObjectId(likedBy);
			}
		}

		books = await Book.insertMany(books);

		res.status(200).json({
			status: 'success',
			users,
			books,
		});
	} catch (err) {
		next(err);
	}
};

exports.purge = async (req, res, next) => {
	try {
		await Book.deleteMany({});
		await User.deleteMany({});
		await Session.deleteMany({});

		res.status(200).json({
			status: 'success',
		});
	} catch (err) {
		next(err);
	}
};
