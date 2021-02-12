const mocks = require('node-mocks-http');
const chai = require('chai');
const mongoose = require('mongoose');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');

const userController = require('$/controllers/userController');
const adminController = require('$/controllers/adminController');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');

const { expect } = chai;
chai.use(deepEqualInAnyOrder);

describe('Unit - Test User Controller', () => {
	const dbUserId = mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa107');
	let sessionUser;
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

	const reqUserId = mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa106');

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
			sessionUser = await Session.create({
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
	describe('getOtherUser() function', () => {
		it('Successful retrieval - return 200', async () => {
			const req = mocks.createRequest({
				user: sessionUser,
				method: 'GET',
				params: {
					id: reqUserId,
				},
			});

			const res = mocks.createResponse();

			await userController.getOtherUser(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(JSON.stringify(data.user)).equal(JSON.stringify(resUser));
		});
	});
});
