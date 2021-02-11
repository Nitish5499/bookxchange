const mocks = require('node-mocks-http');
const chai = require('chai');
const mongoose = require('mongoose');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');

const bookController = require('$/controllers/bookController');
const adminController = require('$/controllers/adminController');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');

chai.use(deepEqualInAnyOrder);
const { expect } = chai;

describe('Unit - Test Book Controller', () => {
	const dbUserId1 = mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa107');
	let sessionUser1;
	let jwtUser1;
	const resUser1 = [
		{
			likedBy: [
				{
					_id: 'aaaaaaaaaaaaaaaaaaaaa106',
					name: 'Jimmy',
				},
				{
					_id: 'aaaaaaaaaaaaaaaaaaaaa108',
					name: 'Claire',
				},
			],
			_id: 'aaaaaaaaaaaaaaaaaaaab105',
			name: 'Pride and Prejudice',
			author: 'Jane Austen',
			link: 'https://www.goodreads.com/book/show/1885.Pride_and_Prejudice',
		},
		{
			likedBy: [
				{
					_id: 'aaaaaaaaaaaaaaaaaaaaa108',
					name: 'Claire',
				},
			],
			_id: 'aaaaaaaaaaaaaaaaaaaab106',
			name: 'The Great Gatsby',
			author: 'F. Scott Fitzgerald',
			link: 'https://www.goodreads.com/book/show/4671.The_Great_Gatsby',
		},
	];

	const dbUserId2 = mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa102');
	let sessionUser2;
	let jwtUser2;
	const resUser2 = [];

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
			jwtUser1 = authUtil.createToken(dbUserId1);
			sessionUser1 = await Session.create({
				userId: dbUserId1,
				sessionToken: jwtUser1,
			});

			jwtUser2 = authUtil.createToken(dbUserId2);
			sessionUser2 = await Session.create({
				userId: dbUserId2,
				sessionToken: jwtUser2,
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

	describe('getOthersLikedBooks() function', () => {
		// For better log readability
		after(async () => {
			console.log('\n---------------------------------------\n');
		});

		it('successful retrieval, multiple entries - return 200', async () => {
			const req = mocks.createRequest({
				user: sessionUser1,
				method: 'GET',
			});

			const res = mocks.createResponse();

			await bookController.getOthersLikedBooks(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data.books).deep.equalInAnyOrder(resUser1);
		});

		it('successful retrieval, zero entries - return 200', async () => {
			const req = mocks.createRequest({
				user: sessionUser2,
				method: 'GET',
			});

			const res = mocks.createResponse();

			await bookController.getOthersLikedBooks(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data.books).deep.equalInAnyOrder(resUser2);
		});
	});
});
