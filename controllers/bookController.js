const mongoose = require('mongoose');
const httpResponse = require('http-status');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');

const { ErrorHandler } = require('$/utils/errorHandler');
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
			return next(new ErrorHandler(404, 'Book not Found!'), req, res, next);
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
			return next(new ErrorHandler(404, 'Book not Found!'), req, res, next);
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
			return next(new ErrorHandler(404, 'Book not Found!'), req, res, next);
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

		const alreadyLiked = await User.findOneAndUpdate(
			{ _id: user.userId, booksLiked: { $ne: id } },
			{ $push: { booksLiked: id } },
		);

		if (!alreadyLiked) {
			res.status(httpResponse.OK).json({
				status: 'success',
				message: 'Book already liked',
			});
			return;
		}

		logger.info('Book Id added to booksLiked of the user');

		await Book.findByIdAndUpdate(id, { $push: { likedBy: user.userId } });

		logger.info('User Id added to likedBy of the book');

		res.status(httpResponse.OK).json({
			status: 'success',
			message: 'Book liked successfully',
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

		await Book.findByIdAndUpdate(id, { $pull: { likedBy: user.userId } });

		logger.info('User Id removed from likedBy of the book');

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

		const userinfo = await User.findById(user.userId).populate('booksLiked');
		const allLikedBooks = userinfo.booksLiked;

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
