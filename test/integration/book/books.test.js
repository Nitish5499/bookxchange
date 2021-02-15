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
	let dbUser = null;
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

	// Test POST /ap1/v1/books API
	// 1. book creation success
	// 2. user not logged in
	// 3. missing request parameters
	describe('POST /api/v1/books', () => {
		after(async () => {
			// Clearing collections
			await Book.deleteMany({});
			console.log('\n---------------------------------------\n');
		});

		it('successful book creation - return 200', (done) => {
			chai
				.request(app)
				.post(`/api/v1/books`)
				.send({
					name: 'To Sleep in a Sea of Stars',
					author: 'Christopher Paolini',
					link: 'https://www.goodreads.com/book/show/48829708-to-sleep-in-a-sea-of-stars?from_choice=true',
				})
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					done();
				});
		});

		it('user not logged in - return 401', (done) => {
			chai
				.request(app)
				.post(`/api/v1/books`)
				.send({
					name: 'To Sleep in a Sea of Stars',
					author: 'Christopher Paolini',
					link: 'https://www.goodreads.com/book/show/48829708-to-sleep-in-a-sea-of-stars?from_choice=true',
				})
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal(constants.RESPONSE_NOT_LOGGED_IN);
					done();
				});
		});

		it('missing request parameters - return 400', (done) => {
			chai
				.request(app)
				.post(`/api/v1/books`)
				.send({})
				.set('Cookie', `jwt_token=${jwt}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.BAD_REQUEST);
					expect(res.body.message).equal('name is required');
					done();
				});
		});
	});
});
