const mongoose = require('mongoose');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
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

chai.use(deepEqualInAnyOrder);
chai.use(chaiHttp);

describe('Integration - Test book fetch endpoints', () => {
	let dbUser = null;
	let jwt = null;
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
			console.log('\n1. Deleting all documents from Books collection\n');
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

	// Test GET /api/v1/books/owned API
	// 1. User's book retrieval success
	// 2. user not logged in
	describe('GET /api/v1/books/liked', () => {
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating books in database');

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

		after(async () => {
			// Clearing collections
			await Book.deleteMany({});
			console.log('\n---------------------------------------\n');
		});

		it("successful user's liked books retrieval - return 200", (done) => {
			chai
				.request(app)
				.get(`/api/v1/books/liked`)
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					const { data } = res.body;

					Book.find({ likedBy: dbUser._id }, { _id: 1, name: 1, author: 1, link: 1, owner: 1 }, (err1, books) => {
						if (err1) console.log(err1);

						expect(data.books).deep.equalInAnyOrder(JSON.parse(JSON.stringify(books)));
						done();
					});
				});
		});

		it('user not logged in - return 401', (done) => {
			chai
				.request(app)
				.get(`/api/v1/books/liked`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal(constants.RESPONSE_NOT_LOGGED_IN);
					done();
				});
		});
	});
});
