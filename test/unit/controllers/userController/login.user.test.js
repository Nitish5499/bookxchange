/**
 * Test login-related functions
 * 1. login()
 * 2. loginVerify()
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

	// Test Login function
	// 1. User not registered
	// 2. User not verified
	// 4. Successful login attempt
	describe('login() function', () => {
		const name = 'jett';
		const email = 'jett@rp.com';
		const email2 = 'faker@hacker.com';
		const email3 = 'aaa@bbb.com';
		const name3 = 'abcd';

		// Before all tests begin
		// 1. Create a registered user
		// 2. Create a new user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating user in database');

			try {
				await User.create({
					name,
					email,
					otp: '',
					active: true,
				});
				await User.create({
					name: name3,
					email: email3,
					otp: '',
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

		it('user not registered - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email: email2,
				},
			});
			const res = mocks.createResponse();
			await userController.login(req, res, (err) => {
				expect(err.statusCode).equal(httpResponse.FORBIDDEN);
				expect(err.message).equal(constants.RESPONSE_USER_AUTH_NO_EMAIL_FAIL);
			});
		});

		it('user not verified - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email: email3,
				},
			});
			const res = mocks.createResponse();
			await userController.login(req, res, (err) => {
				expect(err.statusCode).equal(httpResponse.FORBIDDEN);
				expect(err.message).equal(constants.RESPONSE_USER_AUTH_NO_VERIFY_FAIL);
			});
		});

		it('successful login attempt - return 200', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email,
				},
			});

			const res = mocks.createResponse();

			await userController.login(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).to.be.a('number');
		});
	});

	// Test loginVerify function
	// 1.user not registered
	// 2.user not verified
	// 4.unsuccessful login(wrong otp)
	// 5.successful login
	describe('loginVerify() function', () => {
		const name = 'jack';
		const email = 'jack@rp.com';

		const otpCorrect = 383749;
		const otpWrong = 343434;

		const email2 = 'faker@hacker.com';

		const email3 = 'aa@bb.com';
		const name3 = 'abcd';

		// Before all tests begin
		// 1. Create a registered user
		// 2. Create a new user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating user in database');

			try {
				await User.create({
					name,
					email,
					otp: otpCorrect,
					active: true,
				});
				await User.create({
					name: name3,
					email: email3,
					otp: '',
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

		it('user not registered - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email: email2,
					otp: 434343,
				},
			});
			const res = mocks.createResponse();
			await userController.loginVerify(req, res, (err) => {
				expect(err.statusCode).equal(httpResponse.FORBIDDEN);
				expect(err.message).equal(constants.RESPONSE_USER_AUTH_NO_VERIFY_FAIL);
			});
		});

		it('user not verified - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email: email3,
					otp: 554344,
				},
			});
			const res = mocks.createResponse();
			await userController.loginVerify(req, res, (err) => {
				expect(err.statusCode).equal(httpResponse.FORBIDDEN);
				expect(err.message).equal(constants.RESPONSE_USER_AUTH_NO_VERIFY_FAIL);
			});
		});

		it('unsuccessful login (wrong otp) - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email,
					otp: otpWrong,
				},
			});

			const res = mocks.createResponse();

			await userController.loginVerify(req, res, (err) => {
				expect(err.statusCode).equal(httpResponse.UNAUTHORIZED);
				expect(err.message).equal(constants.RESPONSE_USER_AUTH_FAIL);
			});
		});

		it('successful login - return 200', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email,
					otp: otpCorrect,
				},
			});

			const res = mocks.createResponse();

			await userController.loginVerify(req, res, (err) => {
				expect(err).equal(false);
			});

			const cookie = res.cookies.jwt_token.value;
			expect(cookie).to.be.a('string');
		});
	});
});
