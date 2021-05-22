const mocks = require('node-mocks-http');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const mongoose = require('mongoose');
const httpResponse = require('http-status');

const bookController = require('$/controllers/bookController');
const adminController = require('$/controllers/adminController');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

chai.use(deepEqualInAnyOrder);
const { expect } = chai;

describe('Unit - Test Book Controller', () => {
	const dbUserIdOne = mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa107');
	const dbUserIdTwo = mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa104');

	// Before all tests begin
	// 1. Load environment
	// 2. Connect to test database
	// 3. Insert test records
	before(async () => {
		try {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Deleting all documents from Books,User and Session collection');
			await Book.deleteMany({});
			await User.deleteMany({});
			await Session.deleteMany({});

			console.log('\n2. Inserting records into Users, Books collection');
			adminController.populate();
		} catch (err) {
			console.log(err);
			process.exit(1);
		}

		console.log('\n---------------------------------------\n');
	});

	// After all tests complete
	// 1. Delete all documents from Users, Books and Session collection
	// 2. Close database connection
	// 3. Exit process
	after(async () => {
		console.log('\n------------- AFTER TESTS -------------');
		try {
			console.log('\n1. Deleting all documents from Books,User and Session collection');
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

	describe('findBooks() function', () => {
		// For better log readability
		after(async () => {
			console.log('\n---------------------------------------\n');
		});

		it("successful user's books retrieval - return 200", async () => {
			const testResponse = [
				{
					id: 'aaaaaaaaaaaaaaaaaaaab101',
					name: 'The Guest List',
					author: 'Lucy Foley',
					link: 'https://www.goodreads.com/book/show/54911607-the-guest-list',
					userName: 'Smith',
				},
				{
					id: 'aaaaaaaaaaaaaaaaaaaab104',
					name: 'From Blood and Ash',
					author: 'Jennifer L. Armentrout',
					link: 'https://www.goodreads.com/book/show/52941854-from-blood-and-ash',
					userName: 'Jimmy',
				},
			];

			const req = mocks.createRequest({
				user: dbUserIdOne,
				method: 'GET',
			});

			const res = mocks.createResponse();

			await bookController.findBooks(req, res, (err) => {
				expect(err).equal(false);
			});
			const { data } = res._getJSONData();

			expect(data.nearbyBooks).deep.equalInAnyOrder(JSON.parse(JSON.stringify(testResponse)));
		});

		it('no nearby books - return 200', async () => {
			const req = mocks.createRequest({
				user: dbUserIdTwo,
				method: 'GET',
			});

			const res = mocks.createResponse();

			await bookController.findBooks(req, res, (err) => {
				expect(err).equal(false);
				console.log(res);
			});

			const { data } = res._getJSONData();

			expect(res.statusCode).equal(httpResponse.OK);
			// eslint-disable-next-line no-unused-expressions
			expect(data.nearbyBooks).to.be.empty;
		});
	});
});
