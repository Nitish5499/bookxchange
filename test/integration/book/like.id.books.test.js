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

chai.use(chaiHttp);

describe('Integration - Test book fetch endpoints', () => {
	let dbUser = null;
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
			console.log('\n1. Deleting all documents from Books collection\n');
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
			await Session.create({
				userId: dbUser._id,
				sessionToken: jwt,
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

	// Test PUT /ap1/v1/books/:id/like API
	// 1. book like success
	// 2. book already liked
	// 3. user not logged in
	describe('PUT /api/v1/books/:id/like', () => {
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

		it('successful book like - return 200', (done) => {
			chai
				.request(app)
				.put(`/api/v1/books/${book._id}/like`)
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					expect(res.body.message).equal('Book liked successfully');
					done();
				});
		});

		it('book already liked - return 200', (done) => {
			User.findByIdAndUpdate(dbUser._id, { $push: { booksLiked: book._id } }).then(() => {
				Book.findByIdAndUpdate(book._id, { $push: { likedBy: dbUser._id } }).then(() => {
					chai
						.request(app)
						.put(`/api/v1/books/${book._id}/like`)
						.set('Cookie', `jwt_token=${jwt}`)
						.end((err, res) => {
							expect(res.statusCode).equal(httpResponse.OK);
							expect(res.body.message).equal('Book already liked');
							done();
						});
				});
			});
		});

		it('user not logged in - return 401', (done) => {
			chai
				.request(app)
				.put(`/api/v1/books/${book._id}/like`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal('You are not logged in! Please login in to continue');
					done();
				});
		});

		it('Not existent Book ID - return 404', (done) => {
			chai
				.request(app)
				.put(`/api/v1/books/aaaaaaaaaaaaaaaaaaaab105/like`)
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.NOT_FOUND);
					expect(res.body.message).equal('Book not Found!');
					done();
				});
		});
	});

	// Test DELETE /ap1/v1/books/:id/like API
	// 1. book unlike success
	// 2. book not liked
	// 3. user not logged in
	describe('DELETE /api/v1/books/:id/like', () => {
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

		it('successful book unlike - return 200', (done) => {
			chai
				.request(app)
				.delete(`/api/v1/books/${book._id}/like`)
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					expect(res.body.message).equal('Book unliked successfully');
					done();
				});
		});

		it('book not liked - return 200', (done) => {
			User.findByIdAndUpdate(dbUser._id, { $pull: { booksLiked: book._id } }).then(() => {
				Book.findByIdAndUpdate(book._id, { $pull: { likedBy: dbUser._id } }).then(() => {
					chai
						.request(app)
						.delete(`/api/v1/books/${book._id}/like`)
						.set('Cookie', `jwt_token=${jwt}`)
						.end((err, res) => {
							expect(res.statusCode).equal(httpResponse.OK);
							expect(res.body.message).equal('Book not liked yet');
							done();
						});
				});
			});
		});

		it('user not logged in - return 401', (done) => {
			chai
				.request(app)
				.delete(`/api/v1/books/${book._id}/like`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal('You are not logged in! Please login in to continue');
					done();
				});
		});

		it('Not existent Book ID - return 404', (done) => {
			chai
				.request(app)
				.delete(`/api/v1/books/aaaaaaaaaaaaaaaaaaaab105/like`)
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.NOT_FOUND);
					expect(res.body.message).equal('Book not Found!');
					done();
				});
		});
	});
});
