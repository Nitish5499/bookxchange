const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const httpResponse = require('http-status');

const adminController = require('$/controllers/adminController');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');
const app = require('$/app');
const constants = require('$/config/constants');

const { expect } = chai;
chai.use(chaiHttp);
chai.use(deepEqualInAnyOrder);

describe('Integration - Test user fetch endpoints', () => {
	const dbUserId = mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa107');
	let jwtUser;
	const resUser = {
		booksOwned: [
			{
				_id: 'aaaaaaaaaaaaaaaaaaaab103',
				name: 'The Sun Down Motel',
				author: 'Simone St. James',
				link: 'https://www.goodreads.com/book/show/45885644-the-sun-down-motel',
			},
			{
				_id: 'aaaaaaaaaaaaaaaaaaaab104',
				name: 'From Blood and Ash',
				author: 'Jennifer L. Armentrout',
				link: 'https://www.goodreads.com/book/show/52941854-from-blood-and-ash',
			},
		],
		_id: 'aaaaaaaaaaaaaaaaaaaaa106',
		name: 'Jimmy',
	};

	const reqCorrectUserId = mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa106');
	const reqWrongUserId = mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa069');

	// Before all tests begin
	// 1. Clear database
	// 2. Insert test records in database
	// 2. Insert session for test user in database
	before(async () => {
		try {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Deleting documents from database');
			await Book.deleteMany({});
			await User.deleteMany({});
			await Session.deleteMany({});

			console.log('\n2. Inserting test data in database');
			adminController.populate();

			console.log('\n3. Inserting test data into sessions collection');
			jwtUser = authUtil.createToken(dbUserId);
			await Session.create({
				userId: dbUserId,
				sessionToken: jwtUser,
			});
		} catch (err) {
			console.log(err);
			process.exit(1);
		}

		console.log('\n---------------------------------------\n');
	});

	// After all tests complete
	// 1. Clear database
	after(async () => {
		console.log('\n------------- AFTER TESTS -------------');
		try {
			console.log('\n1. Deleting documents from database');
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

	// Test GET /users/:id API
	// 1. successful retrieval
	// 2. invalid id, not found
	// 3. user not logged in
	describe('GET /api/v1/users/:id', () => {
		it('successful user retrieval - return 200', (done) => {
			chai
				.request(app)
				.get(`/api/v1/users/${reqCorrectUserId}`)
				.set('Cookie', `jwt_token=${jwtUser}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					const { data } = res.body;
					expect(JSON.stringify(data.user)).equal(JSON.stringify(resUser));
					done();
				});
		});

		it('invalid id, not found - return 404', (done) => {
			chai
				.request(app)
				.get(`/api/v1/users/${reqWrongUserId}`)
				.set('Cookie', `jwt_token=${jwtUser}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.NOT_FOUND);
					expect(res.body.message).equal(httpResponse[httpResponse.NOT_FOUND]);
					done();
				});
		});

		it('user not logged in - return 401', (done) => {
			chai
				.request(app)
				.get(`/api/v1/users/${reqCorrectUserId}`)
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal(constants.RESPONSE_NOT_LOGGED_IN);
					done();
				});
		});
	});
});
