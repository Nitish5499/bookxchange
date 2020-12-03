/**
 * Test signup-related functions
 * 1. signup()
 * 2. signupVerify()
 */

const mocks = require('node-mocks-http');
const chai = require('chai');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userController = require('$/controllers/userController');

const User = require('$/models/userModel');

const { expect } = chai;

describe('Unit - Test User Controller', () => {
	// Before all tests begin
	// 1. Load environment
	// 2. Connect to test database
	// 3. Delete all documents from Users collection
	before(async () => {
		console.log('\n------------- BEFORE TESTS -------------');
		console.log('\n1. Loading environment');
		dotenv.config({
			path: './config/test.env',
		});

		const database = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

		console.log('\n2. Connecting to database\n');
		try {
			await mongoose.connect(database, {
				useNewUrlParser: true,
				useCreateIndex: true,
				useFindAndModify: false,
				useUnifiedTopology: true,
			});
			console.log(`Connected to database - ${mongoose.connection.name}\n`);

			console.log('\n3. Deleting all documents from Users collection\n');
			await User.deleteMany({});
		} catch (err) {
			console.log(err);
			process.exit(1);
		}

		console.log('\n---------------------------------------\n');
	});

	// After all tests complete
	// 1. Delete all documents from Users collection
	// 2. Close database connection
	// 3. Exit process
	after(async () => {
		console.log('\n------------- AFTER TESTS -------------');
		try {
			console.log('\n1. Deleting all documents from Users collection');
			await User.deleteMany({});

			console.log('\n2. Closing database connection');
			mongoose.connection.close();

			console.log('\n3. Exiting test');
			console.log('\n---------------------------------------');
			console.log('\n\n\n');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	// Test signup()
	// 1. registration successful
	// 2. missing name and email
	// 3. invalid email format
	describe('signup() function', () => {
		// For better log readability
		before(() => {
			console.log('\n---------------------------------------\n');
		});

		// For better log readability
		after(() => {
			console.log('\n---------------------------------------\n');
		});

		it('registration success - return 200', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					name: 'foo',
					email: 'foo@bar.com',
				},
			});
			const res = mocks.createResponse();

			await userController.signup(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).to.be.a('number');
		});

		it('missing name and email - return 400', async () => {
			const req = mocks.createRequest({
				method: 'POST',
			});
			const res = mocks.createResponse();

			await userController.signup(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Missing required name and email parameters');
			});
		});

		it('invalid email format - return error', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					name: 'foo',
					email: 'foo',
				},
			});
			const res = mocks.createResponse();

			await userController.signup(req, res, (err) => {
				expect(err.message).to.include('Please provide a valid email');
			});
		});
	});

	// Test signupVerify()
	// 1. wrong otp
	// 2. verification success
	// 3. missing email and otp
	describe('signupVerify() function', () => {
		const name = 'foo1';
		const email = 'foo1@bar.com';
		const otpCorrect = 313371;
		const otpWrong = 313370;

		// Before all tests begin
		// 1. Register new user, yet to verify
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating user in database');

			try {
				await User.create({
					name,
					email,
					otp: otpCorrect,
					active: false,
				});
			} catch (err) {
				console.log(err);
				process.exit(1);
			}

			console.log('\n---------------------------------------\n');
		});

		// For better log readability
		after(() => {
			console.log('\n---------------------------------------\n');
		});

		it('wrong otp - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email,
					otp: otpWrong,
				},
			});
			const res = mocks.createResponse();

			await userController.signupVerify(req, res, (err) => {
				expect(err.statusCode).equal(401);
				expect(err.message).equal('Email or otp is wrong');
			});
		});

		it('verification success - return 200', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email,
					otp: otpCorrect,
				},
			});
			const res = mocks.createResponse();

			await userController.signupVerify(req, res, (err) => {
				console.log(err);
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).equal('Email verified');
		});

		it('missing email and otp - return 400', async () => {
			const req = mocks.createRequest({
				method: 'POST',
			});
			const res = mocks.createResponse();

			await userController.signupVerify(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Missing required email and otp parameters');
			});
		});
	});
});