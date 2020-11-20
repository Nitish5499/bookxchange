/* eslint-disable no-shadow, no-unused-vars */

/**
 * Test user-signup APIs
 * 1. api/v1/signup
 * 2. api/v1/signup/verify
 */

const dotenv = require('dotenv');
const chai = require('chai');
const chaiHttp = require('chai-http');

const User = require('$/models/userModel');

const { expect } = chai;

chai.use(chaiHttp);

describe('Integration - Test users signup endpoints', () => {
	let server;

	// Before all tests begin
	// 1. Load environment
	// 2. Start server
	// 3. Delete all documents from Users collection
	before(async () => {
		console.log('\n------------- BEFORE TESTS -------------');
		console.log('\n1. Loading environment');
		dotenv.config({
			path: './config/test.env',
		});

		console.log('\n2. Starting server');
		// eslint-disable-next-line global-require
		server = require('$/server');

		try {
			console.log('\n3. Deleting all documents from Users collection\n');
			await User.deleteMany({});
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	// After each tests ends
	// 1. Delete server cache
	afterEach(() => {
		console.log('\n---------- AFTER EACH TEST -----------');
		console.log('\n1. Deleting server cache');
		delete require.cache[require.resolve('$/server')];
		console.log('\n---------------------------------------\n');
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

		// Before all tests begin
		// 1. Register a user using /signup
		before((done) => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Registering user');
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name, email })
				.end(() => {
					done();
				});
			console.log('\n---------------------------------------\n');
		});

		it('registration success - return 200', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name: 'foo', email: 'foo@bar.com' })
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					expect(res.body.data).to.be.a('number');
					done();
				});
		});

		it('missing parameter - return 400', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name: 'foo' })
				.end((err, res) => {
					expect(res.statusCode).equal(400);
					expect(res.body.message).equal('Missing required name and email parameters');
					done();
				});
		});

		it('invalid HTTP method PUT - return 405', (done) => {
			chai
				.request(server)
				.put('/api/v1/users/signup')
				.send({ name: 'foo', email: 'foo@bar.com' })
				.end((err, res) => {
					expect(res.statusCode).equal(405);
					expect(res.body.message).equal('Method not allowed');
					done();
				});
		});

		it('duplicate user email - return 409', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name, email })
				.end((err, res) => {
					expect(res.statusCode).equal(409);
					expect(res.body.message).equal('Email already exists');
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
		let otpCorrect;

		const name2 = 'foo3';
		const email2 = 'foo3@bar.com';
		let otpCorrect2;

		// Before all tests begin
		// 1. Register a user
		// 2. Register and verify a user
		before((done) => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Registering a user');
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name, email })
				.end((err, res) => {
					otpCorrect = res.body.data;
					done();
				});

			console.log('\n2. Registering and verifying a user');
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name: name2, email: email2 })
				.end((err, res) => {
					otpCorrect2 = res.body.data;
					chai.request(server).post('/api/v1/users/signup/verify').send({ email: email2, otp: otpCorrect2 }).end();
				});
			console.log('\n---------------------------------------\n');
		});

		it('verification success - return 200', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/signup/verify')
				.send({ email, otp: otpCorrect })
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					expect(res.body.data).equal('Email verified');
					done();
				});
		});

		it('email already verified - return 403', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/signup/verify')
				.send({ email, otp: otpCorrect })
				.end((err, res) => {
					expect(res.statusCode).equal(403);
					expect(res.body.message).equal('User email has already been verified');
					done();
				});
		});
	});
});
