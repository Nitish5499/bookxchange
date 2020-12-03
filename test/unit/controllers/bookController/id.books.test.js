const mocks = require('node-mocks-http');
const chai = require('chai');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const bookController = require('$/controllers/bookController');

const Book = require('$/models/bookModel');

const { expect } = chai;

describe('Unit - Test Book Controller', () => {
	let book = null;
	const name = 'testBook';
	const author = 'testAuthor';
	const link = 'testLink';
	const address = 'testAddress';
	const owner = mongoose.Types.ObjectId();
	const likedBy = new Array(mongoose.Types.ObjectId());

	// Before all tests begin
	// 1. Load environment
	// 2. Connect to test database
	// 3. Delete all documents from Books collection
	before(async () => {
		console.log('\n------------- BEFORE TESTS -------------');
		console.log('\n1. Loading environment');
		dotenv.config({
			path: './config/test.env',
		});

		const database = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

		console.log('\n2. Connecting to database\n');
		try {
			await mongoose.connect(database, {
				useNewUrlParser: true,
				useCreateIndex: true,
				useFindAndModify: false,
				useUnifiedTopology: true,
			});
			console.log(`Connected to database - ${mongoose.connection.name}\n`);

			console.log('\n3. Deleting all documents from Users collection\n');
			await Book.deleteMany({});

			book = await Book.create({
				name,
				author,
				link,
				address,
				owner,
				likedBy,
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
			console.log('\n1. Deleting all documents from Users collection');
			await Book.deleteMany({});

			console.log('\n2. Closing database connection');
			mongoose.connection.close();

			console.log('\n3. Exiting test');
			console.log('\n---------------------------------------');
			console.log('\n\n\n');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	describe('getBook() function', () => {
		it('successful book retrival - return 200', async () => {
			const req = mocks.createRequest({
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
				method: 'GET',
				params: {
					id: mongoose.Types.ObjectId(),
				},
			});

			const res = mocks.createResponse();

			await bookController.getBook(req, res, (err) => {
				expect(err.statusCode).equal(404);
				expect(err.message).equal('Book not Found!');
			});
		});

		it('Invalid Book ID - return 400', async () => {
			const req = mocks.createRequest({
				method: 'GET',
				params: {
					id: '1234',
				},
			});

			const res = mocks.createResponse();

			await bookController.getBook(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Invalid BookID!');
			});
		});
	});

	describe('updateBook() function', () => {
		it('successful book update - return 200', async () => {
			const req = mocks.createRequest({
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

		it('Missing parameters - return 400', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				params: {
					id: book._id,
				},
			});

			const res = mocks.createResponse();

			await bookController.updateBook(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Missing required name,author and link parameters');
			});
		});

		it('Invalid Book ID - return 400', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				params: {
					id: '1234',
				},
				body: {
					name: 'changedName',
					author: 'changedAuthor',
					link: 'changedLink',
				},
			});

			const res = mocks.createResponse();

			await bookController.updateBook(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Invalid BookID!');
			});
		});

		it('Book not found - return 404', async () => {
			const req = mocks.createRequest({
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
				expect(err.statusCode).equal(404);
				expect(err.message).equal('Book not Found!');
			});
		});
	});

	describe('deleteBook() function', () => {
		it('Invalid Book ID - return 400', async () => {
			const req = mocks.createRequest({
				method: 'DELETE',
				params: {
					id: '1234',
				},
			});

			const res = mocks.createResponse();

			await bookController.deleteBook(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Invalid BookID!');
			});
		});

		it('Book not found - return 404', async () => {
			const req = mocks.createRequest({
				method: 'DELETE',
				params: {
					id: mongoose.Types.ObjectId(),
				},
			});

			const res = mocks.createResponse();

			await bookController.deleteBook(req, res, (err) => {
				expect(err.statusCode).equal(404);
				expect(err.message).equal('Book not Found!');
			});
		});

		it('successful book delete - return 200', async () => {
			const req = mocks.createRequest({
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
