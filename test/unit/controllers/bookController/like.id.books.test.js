const mongoose = require('mongoose');
const mocks = require('node-mocks-http');
const chai = require('chai');

const bookController = require('$/controllers/bookController');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');

const { expect } = chai;

describe('Unit - Test Book Controller', () => {
	let dbUser = null;
	let user = null;
	let jwt = null;
	let book = null;
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

	describe('likeBook() function', () => {
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating books in database');

			try {
				// Creating a Book for the test
				const bookinfo = {
					name: 'The Guest List',
					author: 'Lucy Foley',
					link: 'https://www.goodreads.com/book/show/54911607-the-guest-list?from_choice=true',
					owner: mongoose.Types.ObjectId(),
				};

				book = await Book.create(bookinfo);
			} catch (err) {
				console.log(err);
				process.exit(1);
			}
			console.log('\n---------------------------------------\n');
		});

		after(async () => {
			// Clearing collections
			await Book.deleteMany({});
			console.log('\n---------------------------------------\n');
		});

		it('successful book like - return 200', async () => {
			const req = mocks.createRequest({
				user,
				method: 'PUT',
				params: {
					id: book._id,
				},
			});

			const res = mocks.createResponse();

			await bookController.likeBook(req, res, (err) => {
				expect(err).equal(false);
			});

			const { message } = res._getJSONData();
			expect(message).equal('Book liked successfully');
		});

		it('book already liked - return 200', async () => {
			await User.findByIdAndUpdate(dbUser._id, { $push: { booksLiked: book._id } });
			await Book.findByIdAndUpdate(book._id, { $push: { likedBy: dbUser._id } });

			const req = mocks.createRequest({
				user,
				method: 'PUT',
				params: {
					id: book._id,
				},
			});

			const res = mocks.createResponse();

			await bookController.likeBook(req, res, (err) => {
				expect(err).equal(false);
			});

			const { message } = res._getJSONData();
			expect(message).equal('Book already liked');
		});
	});

	describe('unlikeBook() function', () => {
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating books in database');

			try {
				// Creating a Book for the test
				const bookinfo = {
					name: 'The Guest List',
					author: 'Lucy Foley',
					link: 'https://www.goodreads.com/book/show/54911607-the-guest-list?from_choice=true',
					owner: mongoose.Types.ObjectId(),
				};

				book = await Book.create(bookinfo);

				await User.findByIdAndUpdate(dbUser._id, { $push: { booksLiked: book._id } });
				await Book.findByIdAndUpdate(book._id, { $push: { likedBy: dbUser._id } });
			} catch (err) {
				console.log(err);
				process.exit(1);
			}
			console.log('\n---------------------------------------\n');
		});

		after(async () => {
			// Clearing collections
			await Book.deleteMany({});
			console.log('\n---------------------------------------\n');
		});

		it('successful book unlike - return 200', async () => {
			const req = mocks.createRequest({
				user,
				method: 'DELETE',
				params: {
					id: book._id,
				},
			});

			const res = mocks.createResponse();

			await bookController.unlikeBook(req, res, (err) => {
				expect(err).equal(false);
			});

			const { message } = res._getJSONData();
			expect(message).equal('Book unliked successfully');
		});

		it('book already liked - return 200', async () => {
			await User.findByIdAndUpdate(dbUser._id, { $pull: { booksLiked: book._id } });
			await Book.findByIdAndUpdate(book._id, { $pull: { likedBy: dbUser._id } });

			const req = mocks.createRequest({
				user,
				method: 'DELETE',
				params: {
					id: book._id,
				},
			});

			const res = mocks.createResponse();

			await bookController.unlikeBook(req, res, (err) => {
				expect(err).equal(false);
			});

			const { message } = res._getJSONData();
			expect(message).equal('Book not liked yet');
		});
	});
});
