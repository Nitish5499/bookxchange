const mocks = require('node-mocks-http');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const mongoose = require('mongoose');

const bookController = require('$/controllers/bookController');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');

chai.use(deepEqualInAnyOrder);
const { expect } = chai;

describe('Unit - Test Book Controller', () => {
	let dbUser = null;
	let user = null;
	let jwt = null;
	const name = 'jett';
	const email = 'jett@rp.com';
	const address = 'test_address';
	// Before all tests begin
	// 1. Load environment
	// 2. Connect to test database
	// 3. Insert a dummy record
	// 3. Delete all documents from Books collection
	before(async () => {
		try {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Deleting all documents from Books,User and Session collection');
			await Book.deleteMany({});
			await User.deleteMany({});
			await Session.deleteMany({});

			console.log('\n2. Inserting a dummy record into Users collection');

			dbUser = await User.create({
				name,
				email,
				address,
				otp: '',
				active: true,
			});

			jwt = authUtil.createToken(dbUser._id);
			user = await Session.create({
				userId: dbUser._id,
				sessionToken: jwt,
			});
		} catch (err) {
			console.log(err);
			process.exit(1);
		}

		console.log('\n---------------------------------------\n');
	});

	// After all tests complete
	// 1. Delete all documents from Books collection
	// 2. Close database connection
	// 3. Exit process
	after(async () => {
		console.log('\n------------- AFTER TESTS -------------');
		try {
			console.log('\n1. Deleting all documents from Books,User and Session collection');
			await Book.deleteMany({});
			await User.deleteMany({});
			await Session.deleteMany({});
			console.log('\n2. Exiting test');
			console.log('\n---------------------------------------');
			console.log('\n\n\n');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	describe('getLikedBooks() function', () => {
		// Before all tests begin
		// 1. Create a new user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating user in database');

			try {
				// Creating two Books for the test
				const book1 = {
					name: 'The Guest List',
					author: 'Lucy Foley',
					link: 'https://www.goodreads.com/book/show/54911607-the-guest-list?from_choice=true',
					owner: mongoose.Types.ObjectId(),
				};
				const book2 = {
					name: 'To Sleep in a Sea of Stars',
					author: 'Christopher Paolini',
					link: 'https://www.goodreads.com/book/show/48829708-to-sleep-in-a-sea-of-stars?from_choice=true',
					owner: mongoose.Types.ObjectId(),
				};
				const books = await Book.create(book1, book2);

				await User.findByIdAndUpdate(dbUser._id, { $push: { booksLiked: [books[0]._id, books[1]._id] } });
				await Book.updateMany({ _id: { $in: [books[0]._id, books[1]._id] } }, { $push: { likedBy: dbUser._id } });
			} catch (err) {
				console.log(err);
				process.exit(1);
			}
			console.log('\n---------------------------------------\n');
		});

		// For better log readability
		after(async () => {
			// Clearing collection
			console.log('\n---------------------------------------\n');
		});

		it("successful user's liked books retrival - return 200", async () => {
			const req = mocks.createRequest({
				user,
				method: 'GET',
			});

			const res = mocks.createResponse();

			await bookController.getLikedBooks(req, res, (err) => {
				expect(err).equal(false);
			});
			const { data } = res._getJSONData();

			const books = await Book.find({ likedBy: dbUser._id });
			expect(data.book).deep.equalInAnyOrder(JSON.parse(JSON.stringify(books)));
		});
	});
});
