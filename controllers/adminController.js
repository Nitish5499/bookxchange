/* eslint no-restricted-syntax: 0 */
/* eslint guard-for-in: 0 */

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const userData = require('$/config/testData/userData.json');
const bookData = require('$/config/testData/bookData.json');

exports.populate = async (req, res, next) => {
	try {
		/*
		 * Populate Users
		 */
		let { users } = userData;
		/* for (const user in users) {
			user._id = mongoose.Types.ObjectId(user._id);

			for (let bookOwned in user.booksOwned) {
				bookOwned = mongoose.Types.ObjectId(bookOwned);
			}

			for (let bookLiked in user.booksLiked) {
				bookLiked = mongoose.Types.ObjectId(bookLiked);
			}

			for (let notification in user.notifications) {
				notification.userId = mongoose.Types.ObjectId(notification.userId);
				notification.time = new Date(notification.time).toISOString();
			}
		} */

		users = await User.insertMany(users);

		/*
		 * Populate Books
		 */
		let { books } = bookData;
		/* for (const book in books) {
			book._id = mongoose.Types.ObjectId(book._id);
			book.owner = mongoose.Types.ObjectId(book.owner);

			for (let likedBy in book.likedBy) {
				likedBy = mongoose.Types.ObjectId(likedBy);
			}
		} */

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
