const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');

const { ErrorHandler } = require('$/utils/errorHandler');

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

		res.status(200).json({
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
	try {
		const book = await Book.find();

		res.status(200).json({
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
	try {
		const { id } = req.params;

		if (!ObjectId.isValid(id)) {
			return next(new ErrorHandler(400, 'Invalid BookID!'), req, res, next);
		}

		const book = await Book.findById(id);

		if (!book) {
			return next(new ErrorHandler(404, 'Book not Found!'), req, res, next);
		}

		res.status(200).json({
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
	try {
		const { id } = req.params;
		const { name, author, link } = req.body;

		if (!ObjectId.isValid(id)) {
			return next(new ErrorHandler(400, 'Invalid BookID!'), req, res, next);
		}

		if (!name || !author || !link) {
			return next(new ErrorHandler(400, 'Missing required name,author and link parameters'), req, res, next);
		}

		const dbBook = await Book.findByIdAndUpdate(id, { name, author, link }, { new: true });

		if (!dbBook) {
			return next(new ErrorHandler(404, 'Book not Found!'), req, res, next);
		}

		res.status(200).json({
			status: 'success',
			data: dbBook,
		});
	} catch (err) {
		next(err);
	}
};

exports.deleteBook = async (req, res, next) => {
	try {
		const { id } = req.params;

		if (!ObjectId.isValid(id)) {
			return next(new ErrorHandler(400, 'Invalid BookID!'), req, res, next);
		}

		const book = await Book.findByIdAndRemove(id);

		if (!book) {
			return next(new ErrorHandler(404, 'Book not Found!'), req, res, next);
		}

		// TODO: Might need to remove the awaits to optimize the delete functionality in the future.

		await User.findByIdAndUpdate(book.owner, { $pull: { booksOwned: book._id } }, { new: true });

		await User.updateMany({ _id: { $in: book.likedBy } }, { $pull: { booksLiked: book._id } }, { new: true });

		res.status(200).json({
			status: 'success',
			data: {
				book,
			},
		});
	} catch (err) {
		next(err);
	}
};
