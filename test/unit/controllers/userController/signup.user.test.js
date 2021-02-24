/**
 * Test signup-related functions
 * 1. signup()
 * 2. signupVerify()
 */

const mocks = require('node-mocks-http');
const chai = require('chai');
const httpResponse = require('http-status');

const userController = require('$/controllers/userController');

const User = require('$/models/userModel');

const constants = require('$/config/constants');

const { expect } = chai;

describe('Unit - Test User Controller', () => {
	// Before all tests begin
	// 1. Load environment
	// 2. Connect to test database
	// 3. Delete all documents from Users collection
	before(async () => {
		try {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Deleting all documents from Users collection');
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
			console.log('\n2. Exiting test');
			console.log('\n---------------------------------------');
			console.log('\n\n\n');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	// Test signup()
	// 1. registration successful
	// 2. non-operating location
	describe('signup() function', () => {
		// For better log readability
		before(async () => {
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
					location: '515870',
				},
			});
			const res = mocks.createResponse();

			await userController.signup(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).to.be.a('number');
		});

		it('location not serviceable - return 200', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					name: 'foo1',
					email: 'foo1@bar.com',
					location: '8927361',
				},
			});
			const res = mocks.createResponse();

			await userController.signup(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).equal(constants.RESPONSE_USER_SIGNUP_INVALID_LOCATION);
		});
	});

	// Test signupVerify()
	// 1. wrong otp
	// 2. verification success
	describe('signupVerify() function', () => {
		const name = 'foo1';
		const email = 'foo1@bar.com';
		const otpCorrect = 313371;
		const otpWrong = 313370;

		const email1 = 'foo2@bar.com';

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
				expect(err.statusCode).equal(httpResponse.UNAUTHORIZED);
				expect(err.message).equal(constants.RESPONSE_USER_AUTH_FAIL);
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
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).equal(constants.RESPONSE_USER_SIGNUP_VERIFY_SUCCESS);
		});

		it('unregistered email - return 403', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email1,
					otp: otpCorrect,
				},
			});
			const res = mocks.createResponse();

			await userController.signupVerify(req, res, (err) => {
				expect(err.statusCode).equal(httpResponse.FORBIDDEN);
				expect(err.message).equal(constants.RESPONSE_USER_SIGNUP_VERIFY_FAIL);
			});
		});
	});
});
