const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const httpResponse = require('http-status');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');
const app = require('$/app');

const authUtil = require('$/utils/authUtil');
const constants = require('$/config/constants');

chai.use(chaiHttp);

describe('Integration - Test book fetch endpoints', () => {
	let book = null;
	const name = 'testBook';
	const author = 'testAuthor';
	const link = 'testLink';
	const owner = mongoose.Types.ObjectId();
	const likedBy = new Array(mongoose.Types.ObjectId());
	let dbUser = null;
	let tempUser = null;
	let jwt = null;
	let tempJwt = null;
	const userName = 'jett';
	const userEmail = 'jett@rp.com';
	const userLocation = 'test_location';

	// Before all tests begin
	// 1. Load environment
	// 2. Connect to test database
	// 3. Insert a dummy record
	// 3. Delete all documents from Books collection
	before(async () => {
		try {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Deleting all documents from Books collection\n');
			await Book.deleteMany({});
			await User.deleteMany({});
			await Session.deleteMany({});
			console.log('\n2. Inserting a dummy record into Books collection');

			book = await Book.create({
				name,
				author,
				link,
				owner,
				likedBy,
			});

			dbUser = await User.create({
				_id: owner,
				name: userName,
				email: userEmail,
				location: userLocation,
				otp: '',
				active: true,
				booksOwned: [book._id],
			});

			tempUser = await User.create({
				name: 'tempUser',
				email: 'temp@gmail.com',
				location: userLocation,
				otp: '',
				active: true,
				booksOwned: [mongoose.Types.ObjectId()],
			});

			jwt = authUtil.createToken(dbUser._id);
			await Session.create({
				userId: dbUser._id,
				sessionToken: jwt,
			});

			tempJwt = authUtil.createToken(tempUser._id);
			await Session.create({
				userId: tempUser._id,
				sessionToken: tempJwt,
			});

			console.log('\n---------------------------------------\n');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
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
	// 3. invalid book id
	describe('GET /api/v1/books/:id', () => {
		it('successful book retrival - return 200', (done) => {
			chai
				.request(app)
				.get(`/api/v1/books/${book._id}`)
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					const { data } = res.body;
					const resBook = {
						_id: book._id,
						name: book.name,
						author: book.author,
						link: book.link,
					};
					expect(JSON.stringify(data.books)).equal(JSON.stringify(resBook));
					done();
				});
		});

		it('user not logged in - return 401', (done) => {
			chai
				.request(app)
				.get(`/api/v1/books/${book._id}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal(constants.RESPONSE_NOT_LOGGED_IN);
					done();
				});
		});

		it('Book not found - return 404', (done) => {
			chai
				.request(app)
				.get(`/api/v1/books/${mongoose.Types.ObjectId()}`)
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.NOT_FOUND);
					expect(res.body.message).equal(httpResponse[httpResponse.NOT_FOUND]);
					done();
				});
		});

		it('Invalid Book ID - return 400', (done) => {
			chai
				.request(app)
				.get('/api/v1/books/1234')
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.BAD_REQUEST);
					expect(res.body.message).equal(httpResponse[httpResponse.BAD_REQUEST]);
					done();
				});
		});
	});

	// Test PATCH /book/:id API
	// 1. book update success
	// 2. missing parameter
	// 3. invalid book id
	// 4. book not found
	describe('PATCH /api/v1/books/:id', () => {
		it('successful book update - return 200', (done) => {
			chai
				.request(app)
				.patch(`/api/v1/books/${book._id}`)
				.send({ name: 'changedName', author: 'changedAuthor', link: 'https://foo.com' })
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					const { data } = res.body;

					Book.findById(book._id, { _id: 1, name: 1, author: 1, link: 1 }, (err1, newBook) => {
						if (err1) console.log(err1);
						const updatedBook = newBook;
						expect(JSON.stringify(data.books)).equal(JSON.stringify(updatedBook));
						done();
					});
				});
		});

		it("one user trying to modify other user's book - return 404", (done) => {
			chai
				.request(app)
				.patch(`/api/v1/books/${book._id}`)
				.send({ name: 'changedName', author: 'changedAuthor', link: 'https://foo.com' })
				.set('Cookie', `jwt_token=${tempJwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.NOT_FOUND);
					expect(res.body.message).equal(httpResponse[httpResponse.NOT_FOUND]);
					done();
				});
		});

		it('user not logged in - return 401', (done) => {
			chai
				.request(app)
				.patch(`/api/v1/books/${book._id}`)
				.send({ name: 'changedName', author: 'changedAuthor', link: 'https://foo.com' })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal(constants.RESPONSE_NOT_LOGGED_IN);
					done();
				});
		});

		it('Missing parameters - return 400', (done) => {
			chai
				.request(app)
				.patch(`/api/v1/books/${book._id}`)
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.BAD_REQUEST);
					expect(res.body.message).equal(constants.RESPONSE_MISSING_PARAMETERS);
					done();
				});
		});

		it('Invalid Book ID - return 400', (done) => {
			chai
				.request(app)
				.patch('/api/v1/books/1234')
				.send({ name: 'changedName', author: 'changedAuthor', link: 'changedLink' })
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.BAD_REQUEST);
					expect(res.body.message).equal(httpResponse[httpResponse.BAD_REQUEST]);
					done();
				});
		});

		it('Book not found - return 404', (done) => {
			chai
				.request(app)
				.patch(`/api/v1/books/${mongoose.Types.ObjectId()}`)
				.send({ name: 'changedName', author: 'changedAuthor', link: 'https://foo.com' })
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.NOT_FOUND);
					expect(res.body.message).equal(httpResponse[httpResponse.NOT_FOUND]);
					done();
				});
		});
	});

	// Test DELETE /book/:id API
	// 1. invalid book id
	// 2. book not found
	// 3. book delete success
	describe('DELETE /api/v1/books/:id', () => {
		it('Invalid Book ID - return 400', (done) => {
			chai
				.request(app)
				.delete('/api/v1/books/1234')
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.BAD_REQUEST);
					expect(res.body.message).equal(httpResponse[httpResponse.BAD_REQUEST]);
					done();
				});
		});

		it("one user trying to delete other user's book - return 404", (done) => {
			chai
				.request(app)
				.delete(`/api/v1/books/${book._id}`)
				.set('Cookie', `jwt_token=${tempJwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.NOT_FOUND);
					expect(res.body.message).equal(httpResponse[httpResponse.NOT_FOUND]);
					done();
				});
		});

		it('user not logged in - return 401', (done) => {
			chai
				.request(app)
				.delete(`/api/v1/books/${book._id}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal(constants.RESPONSE_NOT_LOGGED_IN);
					done();
				});
		});

		it('Book not found - return 404', (done) => {
			chai
				.request(app)
				.delete(`/api/v1/books/${mongoose.Types.ObjectId()}`)
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.NOT_FOUND);
					expect(res.body.message).equal(httpResponse[httpResponse.NOT_FOUND]);
					done();
				});
		});

		it('successful book delete - return 200', (done) => {
			chai
				.request(app)
				.delete(`/api/v1/books/${book._id}`)
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					Book.findById(book._id, (err1, newBook) => {
						if (err1) console.log(err1);

						expect(newBook).equal(null);
					});
					done();
				});
		});
	});
});
