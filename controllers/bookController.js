const mongoose = require('mongoose');
const httpResponse = require('http-status');
const zipcodes = require('zipcodes-nearby');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');

const { ErrorHandler } = require('$/utils/errorHandler');
const bookUtil = require('$/utils/bookUtil');
const logger = require('$/config/logger');

exports.addBook = async (req, res, next) => {
	logger.info('inside addBook function');
	try {
		const { name, author, link } = req.body;
		const { user } = req;

		logger.info(`request user: ${user}`);

		const data = {
			name,
			author,
			link,
			owner: mongoose.Types.ObjectId(user.userId),
		};

		const book = await Book.create(data);

		logger.info(`Book: ${book}`);

		if (!book) {
			return next(new ErrorHandler(httpResponse.INTERNAL_SERVER_ERROR, 'Book creation Failed!'), req, res, next);
		}

		await User.findByIdAndUpdate(user.userId, { $push: { booksOwned: book._id } });

		res.status(httpResponse.OK).json({
			status: 'success',
			data: {
				book,
			},
		});
	} catch (err) {
		next(err);
	}
};

exports.getAllBooks = async (req, res, next) => {
	logger.info('inside getAllBooks function');
	try {
		const { user } = req;

		logger.info(`request user: ${user}`);

		const userinfo = await User.findById(user.userId).populate('booksOwned');
		const allBooks = userinfo.booksOwned;

		logger.info(`Books: ${allBooks}`);

		res.status(httpResponse.OK).json({
			status: 'success',
			data: {
				book: allBooks,
			},
		});
	} catch (err) {
		next(err);
	}
};

exports.getBook = async (req, res, next) => {
	logger.info('inside getBook function');
	try {
		const { id } = req.params;

		logger.info(`BookId:${id}`);

		const book = await Book.findById(id);

		logger.info(`Book:${book}`);

		if (!book) {
			return next(new ErrorHandler(404, 'Not found'), req, res, next);
		}

		res.status(httpResponse.OK).json({
			status: 'success',
			data: {
				book,
			},
		});
	} catch (err) {
		next(err);
	}
};

exports.updateBook = async (req, res, next) => {
	logger.info('inside updateBook function');
	try {
		const { id } = req.params;

		logger.info(`BookId:${id}`);

		const { name, author, link } = req.body;

		logger.info(`Name:${name}, Author:${author}, link:${link}`);

		const dbBook = await Book.findByIdAndUpdate(id, { name, author, link }, { new: true });

		logger.info(dbBook);

		if (!dbBook) {
			return next(new ErrorHandler(404, 'Not found'), req, res, next);
		}

		res.status(httpResponse.OK).json({
			status: 'success',
			data: dbBook,
		});
	} catch (err) {
		next(err);
	}
};

exports.deleteBook = async (req, res, next) => {
	logger.info('inside deleteBook function');
	try {
		const { id } = req.params;

		logger.info(`BookId:${id}`);

		const book = await Book.findByIdAndRemove(id);

		if (!book) {
			return next(new ErrorHandler(404, 'Not found'), req, res, next);
		}

		logger.info('Book successfully deleted from the database');

		// TODO: Might need to remove the awaits to optimize the delete functionality in the future.

		await User.findByIdAndUpdate(book.owner, { $pull: { booksOwned: book._id } }, { new: true });

		logger.info('Book removed from user record');

		await User.updateMany({ _id: { $in: book.likedBy } }, { $pull: { booksLiked: book._id } }, { new: true });

		logger.info('users updated to remove book from liked field');

		res.status(httpResponse.OK).json({
			status: 'success',
			data: {
				book,
			},
		});
	} catch (err) {
		next(err);
	}
};

exports.likeBook = async (req, res, next) => {
	logger.info('inside likeBooks function');
	try {
		const { user } = req;

		logger.info(`request user: ${user}`);

		const { id } = req.params;

		logger.info(`BookId:${id}`);

		const dbUser = await User.findOneAndUpdate(
			{ _id: user.userId, booksLiked: { $ne: id } },
			{ $push: { booksLiked: id } },
		);

		// User has already liked the book if
		// `dbUser` is `null`
		if (!dbUser) {
			res.status(httpResponse.OK).json({
				status: 'success',
				message: 'Book already liked',
			});
			return;
		}

		logger.info('"BookId" added to "booksLiked" of the user');

		const dbBook = await Book.findByIdAndUpdate(id, { $push: { likedBy: user.userId } }, { new: true });

		logger.info('"UserId" added to "likedBy" of the book');

		let notification = bookUtil.createNotification(
			bookUtil.notificationMessage(dbUser.name, dbBook.name, null, 'like'),
			user.userId,
		);
		await User.findByIdAndUpdate(dbBook.owner, {
			$push: {
				notifications: notification,
			},
		});

		logger.info(`Added "like notification" to the book owner: ${dbBook.owner}`);

		const dbUserMatched = await User.findOne({ _id: dbBook.owner, booksLiked: { $in: dbUser.booksOwned } });

		let responseMessage = 'Book liked successfully';

		if (dbUserMatched) {
			notification = bookUtil.createNotification(
				bookUtil.notificationMessage(dbUser.name, null, dbUser.email, 'match'),
				user.userId,
			);
			await User.findByIdAndUpdate(dbBook.owner, {
				$push: {
					notifications: notification,
				},
			});

			notification = bookUtil.createNotification(
				bookUtil.notificationMessage(dbUserMatched.name, null, dbUserMatched.email, 'match'),
				dbBook.owner,
			);
			await User.findByIdAndUpdate(user.userId, {
				$push: {
					notifications: notification,
				},
			});

			responseMessage = 'It is a match!';

			logger.info(`Added "match notifications" to the users: ${dbBook.owner}, ${user.userId}`);
		}

		res.status(httpResponse.OK).json({
			status: 'success',
			message: responseMessage,
		});
	} catch (err) {
		next(err);
	}
};

exports.unlikeBook = async (req, res, next) => {
	logger.info('inside unlikeBook function');
	try {
		const { user } = req;

		logger.info(`request user: ${user}`);

		const { id } = req.params;

		logger.info(`BookId:${id}`);

		const notLiked = await User.findOneAndUpdate({ _id: user.userId, booksLiked: id }, { $pull: { booksLiked: id } });

		if (!notLiked) {
			res.status(httpResponse.OK).json({
				status: 'success',
				message: 'Book not liked yet',
			});
			return;
		}

		logger.info('Book Id removed from booksLiked of the user');

		const book = await Book.findByIdAndUpdate(id, { $pull: { likedBy: user.userId } });

		logger.info('User Id removed from likedBy of the book');

		const notification = bookUtil.createNotification(
			bookUtil.notificationMessage(notLiked.name, book.name, null, 'unlike'),
			user.userId,
		);
		await User.findByIdAndUpdate(book.owner, {
			$push: {
				notifications: notification,
			},
		});

		logger.info(`Added the notification to the book owner: ${book.owner}`);

		res.status(httpResponse.OK).json({
			status: 'success',
			message: 'Book unliked successfully',
		});
	} catch (err) {
		next(err);
	}
};

exports.getLikedBooks = async (req, res, next) => {
	logger.info('inside getLikedBooks function');
	try {
		const { user } = req;

		logger.info(`request user: ${user}`);

		const userInfo = await User.findById(user.userId).populate('booksLiked');
		const allLikedBooks = userInfo.booksLiked;

		logger.info(`Books: ${allLikedBooks}`);

		res.status(httpResponse.OK).json({
			status: 'success',
			data: {
				book: allLikedBooks,
			},
		});
	} catch (err) {
		next(err);
	}
};

exports.getOthersLikedBooks = async (req, res, next) => {
	logger.info('inside getOthersLikedBooks function');
	try {
		const { user } = req;

		logger.info(`request user: ${user}`);

		const dbBooks = await Book.find({ owner: user.userId, likedBy: { $gt: [] } })
			.populate('likedBy', 'name')
			.select('likedBy name author link');

		logger.info(`Books: ${dbBooks}`);

		res.status(httpResponse.OK).json({
			status: 'success',
			data: {
				books: dbBooks,
			},
		});
	} catch (err) {
		next(err);
	}
};

exports.findBooks = async (req, res, next) => {
	logger.info('inside findBooks function');
	try {
		let { user } = req;

		logger.info(`request user: ${user}`);

		user = await User.findById(mongoose.Types.ObjectId(user.userId));

		logger.info(`User: ${user}`);

		const zipcode = user.address;
		let result;

		logger.info(`User zipcode: ${zipcode}`);

		await zipcodes.near(zipcode, 3000, { datafile: 'config/data/zipcodes.csv' }).then((response) => {
			result = response;
		});

		logger.info(`Nearby zipcodes: ${result}`);

		const books = await User.aggregate([
			{
				$match: {
					address: { $in: result },
				},
			},
			{
				$lookup: {
					from: 'books',
					localField: 'booksOwned',
					foreignField: '_id',
					as: 'booksNearby',
				},
			},
			{
				$unwind: '$booksNearby',
			},
			{
				$addFields: {
					bookName: '$booksNearby.name',
					bookId: '$booksNearby._id',
					bookAuthor: '$booksNearby.author',
					bookLink: '$booksNearby.link',
				},
			},
			{
				$group: {
					_id: '',
					nearbyBooks: {
						$push: { id: '$bookId', name: '$bookName', author: '$bookAuthor', link: '$bookLink', userName: '$name' },
					},
				},
			},
		]);

		res.status(httpResponse.OK).json({
			status: 'success',
			data: {
				nearbyBooks: books[0].nearbyBooks,
			},
		});
	} catch (error) {
		next(error);
	}
};
