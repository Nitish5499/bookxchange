const mongoose = require('mongoose');
const mocks = require('node-mocks-http');
const chai = require('chai');
const { promisify } = require('util');

const bookController = require('$/controllers/bookController');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');
const constants = require('$/config/constants');

const { expect } = chai;
const sleep = promisify(setTimeout);

describe('Unit - Test Book Controller', () => {
	let dbUser = null;
	let tempUser = null;
	let user = null;
	let jwt = null;
	let book = null;
	const name = 'jett';
	const email = 'jett@rp.com';
	const location = 'test_location';
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
				location,
				otp: '',
				active: true,
				booksOwned: [mongoose.Types.ObjectId()],
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
				tempUser = await User.create({
					name,
					email: 'temp@gmail.com',
					location,
					otp: '',
					active: true,
					booksOwned: [mongoose.Types.ObjectId()],
				});

				// Creating a Book for the test
				const bookinfo = {
					_id: tempUser.booksOwned[0],
					name: 'The Guest List',
					author: 'Lucy Foley',
					link: 'https://www.goodreads.com/book/show/54911607-the-guest-list?from_choice=true',
					owner: tempUser._id,
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
			await User.findByIdAndUpdate(dbUser._id, { $set: { booksLiked: [] } }, { multi: true });
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

			const resUser1 = await User.findById(tempUser._id);
			const resUser2 = await User.findById(dbUser._id);
			const resBook = await Book.findById(book._id);

			expect(resUser1.notifications[0].text).equal('jett liked your book, The Guest List');
			expect(resUser2.booksLiked[0].toString()).equal(book._id.toString());
			expect(resBook.likedBy[0].toString()).equal(dbUser._id.toString());
			expect(message).equal(constants.RESPONSE_BOOK_LIKE_SUCCESS);
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
			expect(message).equal(constants.RESPONSE_BOOK_LIKE_FAIL);
		});
	});

	describe('likeBook() function Match Scenario', () => {
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating books in database');

			try {
				tempUser = await User.create({
					name,
					email: 'temp1@gmail.com',
					location,
					otp: '',
					active: true,
					booksOwned: [mongoose.Types.ObjectId()],
					booksLiked: [dbUser.booksOwned[0]],
				});

				// Creating a Book for the test
				const bookinfo = {
					_id: tempUser.booksOwned[0],
					name: 'The Guest List',
					author: 'Lucy Foley',
					link: 'https://www.goodreads.com/book/show/54911607-the-guest-list?from_choice=true',
					owner: tempUser._id,
				};

				const bookinfo2 = {
					_id: dbUser.booksOwned[0],
					name: 'Home Before Dark',
					author: 'Riley Sager',
					link: 'https://www.goodreads.com/book/show/50833559-home-before-dark',
					owner: dbUser._id,
					likedBy: [tempUser._id],
				};

				book = await Book.create(bookinfo);
				await Book.create(bookinfo2);
			} catch (err) {
				console.log(err);
				process.exit(1);
			}
			console.log('\n---------------------------------------\n');
		});

		after(async () => {
			// Clearing collections
			await Book.deleteMany({});
			await User.findByIdAndUpdate(dbUser._id, { $set: { booksLiked: [] } }, { multi: true });
			console.log('\n---------------------------------------\n');
		});

		it('successful book match - return 200', async () => {
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

			// Waiting for `unlikeBook()` function to update database completely
			await sleep(3000);

			const resUser1 = await User.findById(tempUser._id);
			const resUser2 = await User.findById(dbUser._id);
			const resBook = await Book.findById(book._id);

			expect(resUser1.notifications[0].text).equal('jett liked your book, The Guest List');
			expect(resUser1.notifications[1].text).equal('It is a match! jett(jett@rp.com) and you can now exchange book(s)');
			expect(resUser2.notifications[0].text).equal(
				'It is a match! jett(temp1@gmail.com) and you can now exchange book(s)',
			);
			expect(resUser2.booksLiked[0].toString()).equal(book._id.toString());
			expect(resBook.likedBy[0].toString()).equal(dbUser._id.toString());
			expect(message).equal(constants.RESPONSE_BOOK_LIKE_MATCH);
		});
	});

	describe('unlikeBook() function', () => {
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating books in database');

			try {
				tempUser = await User.create({
					name,
					email: 'temp2@gmail.com',
					location,
					otp: '',
					active: true,
					booksOwned: [mongoose.Types.ObjectId()],
				});

				// Creating a Book for the test
				const bookinfo = {
					_id: tempUser.booksOwned[0],
					name: 'The Guest List',
					author: 'Lucy Foley',
					link: 'https://www.goodreads.com/book/show/54911607-the-guest-list?from_choice=true',
					owner: tempUser._id,
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

			// Waiting for `unlikeBook()` function to update database completely
			await sleep(3000);

			const resUser1 = await User.findById(tempUser._id);
			const resUser2 = await User.findById(dbUser._id);
			const resBook = await Book.findById(book._id);

			expect(resUser1.notifications[0].text).equal('jett un-liked your book, The Guest List');
			expect(resUser2.booksLiked[0]).equal(undefined);
			expect(resBook.likedBy[0]).equal(undefined);
			expect(message).equal(constants.RESPONSE_BOOK_UNLIKE_SUCCESS);
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
			expect(message).equal(constants.RESPONSE_BOOK_UNLIKE_FAIL);
		});
	});
});
