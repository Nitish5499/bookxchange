const mocks = require('node-mocks-http');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const mongoose = require('mongoose');

const bookController = require('$/controllers/bookController');
const adminController = require('$/controllers/adminController');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');

chai.use(deepEqualInAnyOrder);
const { expect } = chai;

describe('Unit - Test Book Controller', () => {
	const dbUserId = mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaa107');
	let user = null;
	let jwt = null;

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

			console.log('\n3. Inserting record into sessions collection');

			jwt = authUtil.createToken(dbUserId);
			user = await Session.create({
				userId: dbUserId,
				sessionToken: jwt,
			});
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
					id: 'aaaaaaaaaaaaaaaaaaaab103',
					name: 'The Sun Down Motel',
					author: 'Simone St. James',
					link: 'https://www.goodreads.com/book/show/45885644-the-sun-down-motel',
					userName: 'Jimmy',
				},
				{
					id: 'aaaaaaaaaaaaaaaaaaaab104',
					name: 'From Blood and Ash',
					author: 'Jennifer L. Armentrout',
					link: 'https://www.goodreads.com/book/show/52941854-from-blood-and-ash',
					userName: 'Jimmy',
				},
				{
					id: 'aaaaaaaaaaaaaaaaaaaab105',
					name: 'Pride and Prejudice',
					author: 'Jane Austen',
					link: 'https://www.goodreads.com/book/show/1885.Pride_and_Prejudice',
					userName: 'Sam',
				},
				{
					id: 'aaaaaaaaaaaaaaaaaaaab106',
					name: 'The Great Gatsby',
					author: 'F. Scott Fitzgerald',
					link: 'https://www.goodreads.com/book/show/4671.The_Great_Gatsby',
					userName: 'Sam',
				},
			];

			const req = mocks.createRequest({
				user,
				method: 'GET',
			});

			const res = mocks.createResponse();

			await bookController.findBooks(req, res, (err) => {
				expect(err).equal(false);
			});
			const { data } = res._getJSONData();

			expect(data.nearbyBooks).deep.equalInAnyOrder(JSON.parse(JSON.stringify(testResponse)));
		});
	});
});
