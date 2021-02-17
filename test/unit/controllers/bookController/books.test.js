const mocks = require('node-mocks-http');
const chai = require('chai');

const bookController = require('$/controllers/bookController');

const Book = require('$/models/bookModel');
const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');

const { expect } = chai;

describe('Unit - Test Book Controller', () => {
	let dbUser = null;
	let user = null;
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
			console.log('\n1. Deleting all documents from Books,User and Session collection');
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
			user = await Session.create({
				userId: dbUser._id,
				sessionToken: jwt,
			});
		} catch (err) {
			console.log(err);
			process.exit(1);
		}

		console.log('\n---------------------------------------\n');
	});

	// After all tests complete
	// 1. Delete all documents from Books collection
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

	describe('addBook() function', () => {
		// For better log readability
		after(async () => {
			// Clearing collections
			await Book.deleteMany({});
			console.log('\n---------------------------------------\n');
		});

		it('successful book addition - return 200', async () => {
			const req = mocks.createRequest({
				user,
				method: 'POST',
				body: {
					name: 'To Sleep in a Sea of Stars',
					author: 'Christopher Paolini',
					link: 'https://www.goodreads.com/book/show/48829708-to-sleep-in-a-sea-of-stars?from_choice=true',
				},
			});

			const res = mocks.createResponse();

			await bookController.addBook(req, res, (err) => {
				expect(err).equal(false);
			});
		});
	});
});
