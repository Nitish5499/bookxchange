/* eslint-disable no-shadow, no-unused-vars */

/**
 * Test user-login APIs
 * 1. api/v1/login
 * 2. api/v1/login/verify
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const httpResponse = require('http-status');

const User = require('$/models/userModel');
const app = require('$/app');

const { expect } = chai;

chai.use(chaiHttp);

describe('Integration - Test users login endpoints', () => {
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

	// Test /login API
	// 1. login success
	// 2. missing parameter
	// 3. invalid HTTP PUT method
	// 4. direct login attempt
	describe('POST /api/v1/users/login', () => {
		const email2 = 'foo5@bar.com';

		const name = 'foo4';
		const email = 'foo4@bar.com';

		let otpCorrect;

		// Before all tests begin
		// 1. Register a verified user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Registering a verified user');
			await User.create({
				name,
				email,
				otp: '',
				active: true,
			});
			console.log('\n---------------------------------------\n');
		});

		it('login success - return 200', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/login')
				.send({ email })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					done();
				});
		});

		it('missing email parameters - return 400', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/login')
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.BAD_REQUEST);
					expect(res.body.message).equal('email is required');
					done();
				});
		});

		it('Invalid HTTP PUT method - return 405', (done) => {
			chai
				.request(app)
				.put('/api/v1/users/login')
				.send({ email })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.METHOD_NOT_ALLOWED);
					expect(res.body.message).equal('Method not allowed');
					done();
				});
		});

		it('direct login attempt - return 401', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/login')
				.send({ email: email2 })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal('Email not registered');
					done();
				});
		});
	});

	// Test /login/verify API
	// 1. login success
	// 2. missing parameter
	// 3. invalid HTTP PUT method
	// 4. Email not registered
	// 5. incorrect otp
	describe('POST /api/v1/users/login/verify', () => {
		const email2 = 'foo6@bar.com';

		const name = 'foo7';
		const email = 'foo7@bar.com';

		const otpCorrect = '123456';
		const otpWrong = '000000';

		// Before all tests begin
		// 1. Register a verified user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Registering a verified user with otp');
			await User.create({
				name,
				email,
				otp: otpCorrect,
				active: true,
			});
			console.log('\n---------------------------------------\n');
		});

		it('login success - return 200', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/login/verify')
				.send({ email, otp: otpCorrect })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					done();
				});
		});

		it('missing email parameters - return 400', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/login/verify')
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.BAD_REQUEST);
					expect(res.body.message).equal('email is required');
					done();
				});
		});

		it('Invalid HTTP PUT method - return 405', (done) => {
			chai
				.request(app)
				.put('/api/v1/users/login/verify')
				.send({ email, otp: otpCorrect })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.METHOD_NOT_ALLOWED);
					expect(res.body.message).equal('Method not allowed');
					done();
				});
		});

		it('Email not registered - return 401', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/login/verify')
				.send({ email: email2, otp: otpCorrect })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal('Email not registered');
					done();
				});
		});

		it('Incorrect otp - return 401', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/login/verify')
				.send({ email, otp: otpWrong })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal('Invalid OTP or email');
					done();
				});
		});
	});
});
