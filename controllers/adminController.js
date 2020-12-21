const mongoose = require('mongoose');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const userData = require('$/config/test_data/userData.json');
const bookData = require('$/config/test_data/bookData.json');

const authUtil = require('$/utils/authUtil');

exports.populate = async (req, res, next) => {
	try {
		const { users } = userData;
		const { books } = bookData;

		let book = await Book.create(books);

		// Adding book ids to user's booksOwned array
		// User 2 Owns Book 1 & 2
		users[1].booksOwned.push(mongoose.Types.ObjectId(book[0]._id), mongoose.Types.ObjectId(book[1]._id));
		// User 3 Owns Book 3 & 4
		users[2].booksOwned.push(mongoose.Types.ObjectId(book[2]._id), mongoose.Types.ObjectId(book[3]._id));

		// User 1 likes Book 3
		users[1].booksLiked.push(mongoose.Types.ObjectId(book[2]._id));
		// User 3 like Book 1&2
		users[2].booksLiked.push(mongoose.Types.ObjectId(book[0]._id), mongoose.Types.ObjectId(book[1]._id));

		const user = await User.create(users);

		// Updating owner id in Books table
		await Book.updateMany(
			{ _id: { $in: [book[0]._id, book[1]._id] } },
			{ owner: mongoose.Types.ObjectId(user[1]._id) },
		);
		await Book.updateMany(
			{ _id: { $in: [book[2]._id, book[3]._id] } },
			{ owner: mongoose.Types.ObjectId(user[2]._id) },
		);

		// Updating likedBy of book 3
		await Book.findByIdAndUpdate(book[2]._id, { $push: { likedBy: user[1]._id } });
		// Updating likedBy of book 1 & 2
		await Book.updateMany({ _id: { $in: [book[0]._id, book[1]._id] } }, { $push: { likedBy: user[2]._id } });

		// Setting session token for User 2 & 3
		const jwtToken1 = authUtil.createToken(user[1]._id);
		const jwtToken2 = authUtil.createToken(user[2]._id);

		await Session.create(
			{
				userId: user[1]._id,
				sessionToken: jwtToken1,
			},
			{
				userId: user[2]._id,
				sessionToken: jwtToken2,
			},
		);

		book = await Book.find();
		const session = await Session.find();

		res.status(200).json({
			status: 'success',
			userData: {
				user,
			},
			bookData: {
				book,
			},
			sessionData: {
				session,
			},
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
