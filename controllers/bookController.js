const mongoose = require('mongoose');
const httpResponse = require('http-status');
const zipcodes = require('zipcodes-nearby');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');

const { ErrorHandler } = require('$/utils/errorHandler');
const bookUtil = require('$/utils/bookUtil');
const logger = require('$/config/logger');
const constants = require('$/config/constants');

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
			owner: mongoose.Types.ObjectId(user),
		};

		const book = await Book.create(data);

		logger.info(`Book: ${book}`);

		if (!book) {
			return next(
				new ErrorHandler(httpResponse.INTERNAL_SERVER_ERROR, constants.RESPONSE_BOOK_CREATE_FAIL),
				req,
				res,
				next,
			);
		}

		await User.findByIdAndUpdate(user, { $push: { booksOwned: book._id } });

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: {
				books: {
					_id: book._id,
					author: book.author,
					link: book.link,
					owner: book.owner,
				},
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

		const userInfo = await User.findById(user).populate('booksOwned', '_id name author link');
		const allBooks = userInfo.booksOwned;

		logger.info(`Books: ${allBooks}`);

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: {
				books: allBooks,
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

		const book = await Book.findById(id).select('_id name author link');

		logger.info(`Book:${book}`);

		if (!book) {
			return next(new ErrorHandler(httpResponse.NOT_FOUND, httpResponse[httpResponse.NOT_FOUND]), req, res, next);
		}

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: {
				books: book,
			},
		});
	} catch (err) {
		next(err);
	}
};

exports.updateBook = async (req, res, next) => {
	logger.info('inside updateBook function');
	try {
		const { user } = req;
		const { id } = req.params;

		logger.info(`BookId:${id}`);

		const { name, author, link } = req.body;

		logger.info(`Name:${name}, Author:${author}, link:${link}`);

		const dbBook = await Book.findOneAndUpdate({ _id: id, owner: user }, { name, author, link }, { new: true }).select(
			'_id name author link',
		);

		logger.info(dbBook);

		if (!dbBook) {
			return next(new ErrorHandler(httpResponse.NOT_FOUND, httpResponse[httpResponse.NOT_FOUND]), req, res, next);
		}

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: {
				books: dbBook,
			},
		});
	} catch (err) {
		next(err);
	}
};

exports.deleteBook = async (req, res, next) => {
	logger.info('inside deleteBook function');
	try {
		const { user } = req;
		const { id } = req.params;

		logger.info(`BookId:${id}`);

		const book = await Book.findOneAndDelete({ _id: id, owner: user });

		if (!book) {
			return next(new ErrorHandler(httpResponse.NOT_FOUND, httpResponse[httpResponse.NOT_FOUND]), req, res, next);
		}

		logger.info('Book successfully deleted from the database');

		// TODO: Might need to remove the awaits to optimize the delete functionality in the future.

		await User.findByIdAndUpdate(book.owner, { $pull: { booksOwned: book._id } }, { new: true });

		logger.info('Book removed from user record');

		await User.updateMany({ _id: { $in: book.likedBy } }, { $pull: { booksLiked: book._id } }, { new: true });

		logger.info('users updated to remove book from liked field');

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			message: constants.RESPONSE_BOOK_DELETE_SUCCESS,
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

		const dbBook = await Book.findOneAndUpdate({ _id: id, owner: { $ne: user } }, { $addToSet: { likedBy: user } });

		if (!dbBook) {
			return next(new ErrorHandler(httpResponse.NOT_FOUND, httpResponse[httpResponse.NOT_FOUND]), req, res, next);
		}

		logger.info('"UserId" added to "likedBy" of the book');

		const dbUser = await User.findOneAndUpdate({ _id: user, booksLiked: { $ne: id } }, { $push: { booksLiked: id } });

		// User has already liked the book if
		// `dbUser` is `null`
		if (!dbUser) {
			res.status(httpResponse.OK).json({
				status: constants.STATUS_SUCCESS,
				message: constants.RESPONSE_BOOK_LIKE_FAIL,
			});
			return;
		}

		logger.info('"BookId" added to "booksLiked" of the user');

		let notification = bookUtil.createNotification(
			bookUtil.notificationMessage(dbUser.name, dbBook.name, null, 'like'),
			user,
		);
		const dbUserMatched = await User.findByIdAndUpdate(dbBook.owner, {
			$push: {
				notifications: notification,
			},
		});

		logger.info(`Added "like notification" to the book owner: ${dbBook.owner}`);

		const isMatch = dbUserMatched.booksLiked.some((item) => dbUser.booksOwned.includes(item));

		let responseMessage = constants.RESPONSE_BOOK_LIKE_SUCCESS;

		if (isMatch) {
			notification = bookUtil.createNotification(
				bookUtil.notificationMessage(dbUser.name, null, dbUser.email, 'match'),
				user,
			);
			User.findByIdAndUpdate(dbBook.owner, {
				$push: {
					notifications: notification,
				},
			}).exec();

			notification = bookUtil.createNotification(
				bookUtil.notificationMessage(dbUserMatched.name, null, dbUserMatched.email, 'match'),
				dbBook.owner,
			);
			User.findByIdAndUpdate(user, {
				$push: {
					notifications: notification,
				},
			}).exec();

			responseMessage = constants.RESPONSE_BOOK_LIKE_MATCH;

			logger.info(`Added "match notifications" to the users: ${dbBook.owner}, ${user}`);
		}

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
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

		const book = await Book.findByIdAndUpdate(id, { $pull: { likedBy: user } });

		if (!book) {
			return next(new ErrorHandler(httpResponse.NOT_FOUND, httpResponse[httpResponse.NOT_FOUND]), req, res, next);
		}

		logger.info('User Id removed from likedBy of the book');

		const notLiked = await User.findOneAndUpdate({ _id: user, booksLiked: id }, { $pull: { booksLiked: id } });

		if (!notLiked) {
			res.status(httpResponse.OK).json({
				status: constants.STATUS_SUCCESS,
				message: constants.RESPONSE_BOOK_UNLIKE_FAIL,
			});
			return;
		}

		logger.info('Book Id removed from booksLiked of the user');

		const notification = bookUtil.createNotification(
			bookUtil.notificationMessage(notLiked.name, book.name, null, 'unlike'),
			user,
		);
		User.findByIdAndUpdate(book.owner, {
			$push: {
				notifications: notification,
			},
		}).exec();

		logger.info(`Added the notification to the book owner: ${book.owner}`);

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			message: constants.RESPONSE_BOOK_UNLIKE_SUCCESS,
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

		const userInfo = await User.findById(user).populate('booksLiked', '_id name author link owner');
		const allLikedBooks = userInfo.booksLiked;

		logger.info(`Books: ${allLikedBooks}`);

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: {
				books: allLikedBooks,
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

		const dbBooks = await Book.find({ owner: user, likedBy: { $gt: [] } })
			.populate('likedBy', 'name')
			.select('likedBy name author link');

		logger.info(`Books: ${dbBooks}`);

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
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
		const distance = req.query.distance * 1000 || constants.BOOKS_FIND_DISTANCE;

		logger.info(`request user: ${user}`);

		user = await User.findById(mongoose.Types.ObjectId(user));

		logger.info(`User: ${user}`);

		const zipcode = user.location;
		let result;

		logger.info(`User zipcode: ${zipcode}`);

		await zipcodes.near(zipcode, distance, { datafile: 'config/zipcodesData/zipcodes.csv' }).then((response) => {
			result = response;
		});

		logger.info(`Nearby zipcodes: ${result}`);

		const books = await User.aggregate([
			{
				$match: {
					location: { $in: result },
					_id: { $ne: user._id },
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
				$match: {
					'booksNearby._id': { $nin: user.booksLiked },
				},
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

		if (!books[0]) {
			res.status(httpResponse.OK).json({
				status: constants.STATUS_SUCCESS,
				data: {
					nearbyBooks: [],
				},
			});
			return;
		}

		res.status(httpResponse.OK).json({
			status: constants.STATUS_SUCCESS,
			data: {
				nearbyBooks: books[0].nearbyBooks,
			},
		});
	} catch (error) {
		next(error);
	}
};
