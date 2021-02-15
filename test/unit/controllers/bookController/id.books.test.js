const mocks = require('node-mocks-http');
const chai = require('chai');
const mongoose = require('mongoose');
const httpResponse = require('http-status');

const bookController = require('$/controllers/bookController');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');

const { expect } = chai;

describe('Unit - Test Book Controller', () => {
	let book = null;
	const name = 'testBook';
	const author = 'testAuthor';
	const link = 'testLink';
	const owner = mongoose.Types.ObjectId();
	const likedBy = new Array(mongoose.Types.ObjectId());
	let dbUser = null;
	let jwt = null;
	let user = null;
	const userName = 'jett';
	const userEmail = 'jett@rp.com';
	const userAddress = 'test_address';

	// Before all tests begin
	// 1. Load environment
	// 2. Connect to test database
	// 3. Insert a dummy record
	// 3. Delete all documents from Books collection
	before(async () => {
		try {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Deleting all documents from Books collection');
			await Book.deleteMany({});
			await User.deleteMany({});
			await Session.deleteMany({});

			book = await Book.create({
				name,
				author,
				link,
				owner,
				likedBy,
			});

			dbUser = await User.create({
				name: userName,
				email: userEmail,
				address: userAddress,
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
			console.log('\n1. Deleting all documents from Books collection');
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

	// Test GET /book/:id API
	// 1. book retrival success
	// 2. book not found
	describe('getBook() function', () => {
		it('successful book retrival - return 200', async () => {
			const req = mocks.createRequest({
				user,
				method: 'GET',
				params: {
					id: book._id,
				},
			});

			const res = mocks.createResponse();

			await bookController.getBook(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(JSON.stringify(data.book)).equal(JSON.stringify(book));
		});

		it('Book not found - return 404', async () => {
			const req = mocks.createRequest({
				user,
				method: 'GET',
				params: {
					id: mongoose.Types.ObjectId(),
				},
			});

			const res = mocks.createResponse();

			await bookController.getBook(req, res, (err) => {
				expect(err.statusCode).equal(httpResponse.NOT_FOUND);
				expect(err.message).equal(httpResponse[httpResponse.NOT_FOUND]);
			});
		});
	});

	// Test PATCH /book/:id API
	// 1. book update success
	// 2. book not found
	describe('updateBook() function', () => {
		it('successful book update - return 200', async () => {
			const req = mocks.createRequest({
				user,
				method: 'PATCH',
				params: {
					id: book._id,
				},
				body: {
					name: 'changedName',
					author: 'changedAuthor',
					link: 'changedLink',
				},
			});

			const res = mocks.createResponse();

			await bookController.updateBook(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();

			const updatedBook = await Book.findById(book._id);
			expect(JSON.stringify(data)).equal(JSON.stringify(updatedBook));
		});

		it('Book not found - return 404', async () => {
			const req = mocks.createRequest({
				user,
				method: 'POST',
				params: {
					id: mongoose.Types.ObjectId(),
				},
				body: {
					name: 'changedName',
					author: 'changedAuthor',
					link: 'changedLink',
				},
			});

			const res = mocks.createResponse();

			await bookController.updateBook(req, res, (err) => {
				expect(err.statusCode).equal(httpResponse.NOT_FOUND);
				expect(err.message).equal(httpResponse[httpResponse.NOT_FOUND]);
			});
		});
	});

	// Test DELETE /book/:id API
	// 1. invalid book id
	// 2. book not found
	// 3. book delete success
	describe('deleteBook() function', () => {
		it('Book not found - return 404', async () => {
			const req = mocks.createRequest({
				user,
				method: 'DELETE',
				params: {
					id: mongoose.Types.ObjectId(),
				},
			});

			const res = mocks.createResponse();

			await bookController.deleteBook(req, res, (err) => {
				expect(err.statusCode).equal(httpResponse.NOT_FOUND);
				expect(err.message).equal(httpResponse[httpResponse.NOT_FOUND]);
			});
		});

		it('successful book delete - return 200', async () => {
			const req = mocks.createRequest({
				user,
				method: 'DELETE',
				params: {
					id: book._id,
				},
			});

			const res = mocks.createResponse();

			await bookController.deleteBook(req, res, (err) => {
				expect(err).equal(false);
			});

			const bookDeleted = await Book.findById(req.params.id);
			expect(bookDeleted).equals(null);
		});
	});
});
