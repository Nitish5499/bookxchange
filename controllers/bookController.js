const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');
const httpResponse = require('http-status');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');

const { ErrorHandler } = require('$/utils/errorHandler');
const logger = require('$/config/logger');

exports.addBook = async (req, res, next) => {
	try {
		const { name, author, link } = req.body;

		let { owner, likedBy } = req.body;

		if (!name || !author || !link || !owner || !likedBy) {
			return next(
				new ErrorHandler(400, 'Missing required name,author,link,owner and likedBy parameters'),
				req,
				res,
				next,
			);
		}

		owner = mongoose.Types.ObjectId(owner);
		likedBy = likedBy.map((s) => mongoose.Types.ObjectId(s));

		const book = await Book.create({
			name,
			author,
			link,
			owner,
			likedBy,
		});

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
		const book = await Book.find();

		logger.info(`Book: ${book}`);

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

		if (!ObjectId.isValid(id)) {
			return next(new ErrorHandler(400, 'Invalid BookID!'), req, res, next);
		}

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
