const mongoose = require('mongoose');
const dotenv = require('dotenv');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');

const Book = require('$/models/bookModel');

chai.use(chaiHttp);

describe('Integration - Test book fetch endpoints', () => {
	let server;
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

		console.log('\n2. Starting server');
		// eslint-disable-next-line global-require
		server = require('$/server');

		try {
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
	});

	// After all tests complete
	// 1. Delete all documents from Books collection
	// 2. Close database connection
	// 3. Exit process

	afterEach(() => {
		console.log('\n---------- AFTER EACH TEST -----------');
		console.log('\n1. Deleting server cache');

		delete require.cache[require.resolve('$/server')];

		console.log('\n---------------------------------------\n');
	});

	after(async () => {
		console.log('\n------------- AFTER TESTS -------------');
		try {
			console.log('\n1. Deleting all documents from Users collection');
			await Book.deleteMany({});

			console.log('\n2. Exiting test');
			console.log('\n---------------------------------------');
			console.log('\n\n\n');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	describe('GET /api/v1/books/:id', () => {
		it('successful book retrival - return 200', (done) => {
			chai
				.request(server)
				.get(`/api/v1/books/${book._id}`)
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					const { data } = res.body;
					expect(JSON.stringify(data.book)).equal(JSON.stringify(book));
					done();
				});
		});

		it('Book not found - return 404', (done) => {
			chai
				.request(server)
				.get(`/api/v1/books/${mongoose.Types.ObjectId()}`)
				.end((err, res) => {
					expect(res.statusCode).equal(404);
					expect(res.body.message).equal('Book not Found!');
					done();
				});
		});

		it('Invalid Book ID - return 400', (done) => {
			chai
				.request(server)
				.get('/api/v1/books/1234')
				.end((err, res) => {
					expect(res.statusCode).equal(400);
					expect(res.body.message).equal('Invalid BookID!');
					done();
				});
		});
	});

	describe('PATCH /api/v1/books/:id', () => {
		it('successful book update - return 200', (done) => {
			chai
				.request(server)
				.patch(`/api/v1/books/${book._id}`)
				.send({ name: 'changedName', author: 'changedAuthor', link: 'changedLink' })
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					const { data } = res.body;

					Book.findById(book._id, (err1, newBook) => {
						if (err1) console.log(err1);
						const updatedBook = newBook;
						expect(JSON.stringify(data)).equal(JSON.stringify(updatedBook));
						done();
					});
				});
		});

		it('Missing parameters - return 400', (done) => {
			chai
				.request(server)
				.patch(`/api/v1/books/${book._id}`)
				.end((err, res) => {
					expect(res.statusCode).equal(400);
					expect(res.body.message).equal('Missing required name,author and link parameters');
					done();
				});
		});

		it('Invalid Book ID - return 400', (done) => {
			chai
				.request(server)
				.patch('/api/v1/books/1234')
				.send({ name: 'changedName', author: 'changedAuthor', link: 'changedLink' })
				.end((err, res) => {
					expect(res.statusCode).equal(400);
					expect(res.body.message).equal('Invalid BookID!');
					done();
				});
		});

		it('Book not found - return 404', (done) => {
			chai
				.request(server)
				.patch(`/api/v1/books/${mongoose.Types.ObjectId()}`)
				.send({ name: 'changedName', author: 'changedAuthor', link: 'changedLink' })
				.end((err, res) => {
					expect(res.statusCode).equal(404);
					expect(res.body.message).equal('Book not Found!');
					done();
				});
		});
	});

	describe('DELETE /api/v1/books/:id', () => {
		it('Invalid Book ID - return 400', (done) => {
			chai
				.request(server)
				.delete('/api/v1/books/1234')
				.end((err, res) => {
					expect(res.statusCode).equal(400);
					expect(res.body.message).equal('Invalid BookID!');
					done();
				});
		});

		it('Book not found - return 404', (done) => {
			chai
				.request(server)
				.delete(`/api/v1/books/${mongoose.Types.ObjectId()}`)
				.end((err, res) => {
					expect(res.statusCode).equal(404);
					expect(res.body.message).equal('Book not Found!');
					done();
				});
		});

		it('successful book delete - return 200', (done) => {
			chai
				.request(server)
				.delete(`/api/v1/books/${book._id}`)
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					Book.findById(book._id, (err1, newBook) => {
						if (err1) console.log(err1);

						expect(newBook).equal(null);
					});
					done();
				});
		});
	});
});
