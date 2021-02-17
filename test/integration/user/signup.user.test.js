/* eslint-disable no-shadow, no-unused-vars */

/**
 * Test user-signup APIs
 * 1. api/v1/signup
 * 2. api/v1/signup/verify
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const httpResponse = require('http-status');

const User = require('$/models/userModel');
const app = require('$/app');

const constants = require('$/config/constants');

const { expect } = chai;

chai.use(chaiHttp);

describe('Integration - Test users signup endpoints', () => {
	let server;

	// Before all tests begin
	// 1. Load environment
	// 2. Start server
	// 3. Delete all documents from Users collection
	before(async () => {
		try {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Deleting all documents from Users collection');
			await User.deleteMany({});
			console.log('\n---------------------------------------\n');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	// After all tests complete
	// 1. Delete all documents from Users collection
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

	// Test /signup API
	// 1. registration success
	// 2. missing parameter
	// 3. invalid HTTP method PUT
	// 4. duplicate user email
	describe('POST /api/v1/users/signup', () => {
		const name = 'foo1';
		const email = 'foo1@bar.com';
		const address = '515870';

		// Before all tests begin
		// 1. Register a user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Registering user');
			try {
				await User.create({
					name,
					email,
					otp: '',
					active: true,
				});
			} catch (err) {
				console.log(err);
				process.exit(1);
			}
			console.log('\n---------------------------------------\n');
		});

		it('registration success - return 200', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/signup')
				.send({ name: 'foo', email: 'foo@bar.com', address: '515870' })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					expect(res.body.data).to.be.a('number');
					done();
				});
		});

		it('missing parameter - return 400', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/signup')
				.send({ name: 'foo' })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.BAD_REQUEST);
					expect(res.body.message).equal(constants.RESPONSE_MISSING_PARAMETERS);
					done();
				});
		});

		it('invalid HTTP method PUT - return 405', (done) => {
			chai
				.request(app)
				.put('/api/v1/users/signup')
				.send({ name: 'foo', email: 'foo@bar.com', address: '515870' })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.METHOD_NOT_ALLOWED);
					expect(res.body.message).equal(httpResponse[httpResponse.METHOD_NOT_ALLOWED]);
					done();
				});
		});

		it('duplicate user email - return 409', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/signup')
				.send({ name, email, address })
				.end((err, res) => {
					expect(res.statusCode).equal(409);
					expect(res.body.message).equal(constants.RESPONSE_EMAIL_EXISTS);
					done();
				});
		});
	});

	// Test /signup/verify API
	// 1. verification success
	// 2. email already verified
	describe('POST /api/v1/users/signup/verify', () => {
		const name = 'foo2';
		const email = 'foo2@bar.com';
		const otpCorrect = '123456';

		const name2 = 'foo3';
		const email2 = 'foo3@bar.com';
		const otpCorrect2 = '654321';

		// Before all tests begin
		// 1. Register a user
		// 2. Register a verified user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			try {
				console.log('\n1. Registering a user');
				await User.create({
					name,
					email,
					otp: otpCorrect,
					active: false,
				});

				console.log('\n2. Registering a verified user');
				await User.create({
					name: name2,
					email: email2,
					otp: '',
					active: true,
				});
			} catch (err) {
				console.log(err);
				process.exit(1);
			}
			console.log('\n---------------------------------------\n');
		});

		it('verification success - return 200', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/signup/verify')
				.send({ email, otp: otpCorrect })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					expect(res.body.data).equal(constants.RESPONSE_USER_SIGNUP_VERIFY_SUCCESS);
					done();
				});
		});

		it('email already verified - return 403', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/signup/verify')
				.send({ email: email2, otp: otpCorrect2 })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.FORBIDDEN);
					expect(res.body.message).equal(constants.RESPONSE_USER_SIGNUP_VERIFY_FAIL);
					done();
				});
		});
	});
});
