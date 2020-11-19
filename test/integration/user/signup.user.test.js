/* eslint-disable no-shadow, no-unused-vars */

const chai = require('chai');

const { expect } = chai;
const chaiHttp = require('chai-http');
const dotenv = require('dotenv');

const User = require('$/models/userModel');

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
		console.log('\n------------- AFTER EACH TEST -------------');
		console.log('\n1. Deleting server cache\n\n');
		delete require.cache[require.resolve('$/server')];
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
			console.log('\n1. Registering user\n');
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name, email })
				.end(() => {
					done();
				});
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
			console.log('\n1. Registering a user\n');
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name, email })
				.end((err, res) => {
					otpCorrect = res.body.data;
					done();
				});

			console.log('\n2. Registering and verifying a user\n');
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name: name2, email: email2 })
				.end((err, res) => {
					otpCorrect2 = res.body.data;
					chai.request(server).post('/api/v1/users/signup/verify').send({ email: email2, otp: otpCorrect2 }).end();
				});
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

	// Test /login API
	// 1. login success
	// 2. missing parameter
	// 3. invalid HTTP PUT method
	// 4. direct login attempt
	describe('POST /api/v1/users/login', () => {
		const email = 'foo5@bar.com';

		const name2 = 'foo4';
		const email2 = 'foo4@bar.com';

		let otpCorrect;

		// Before all tests begin
		// 1. Register and verify a user
		before((done) => {
			console.log('\n------------- BEFORE TESTS -------------');

			console.log('\n1. Registering and verifying a user\n');
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name: name2, email: email2 })
				.end((err, res) => {
					otpCorrect = res.body.data;
					chai
						.request(server)
						.post('/api/v1/users/signup/verify')
						.send({ email: email2, otp: otpCorrect })
						.end((err, res) => {
							done();
						});
				});
		});

		it('login attempt success - return 200', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/login')
				.send({ email: email2 })
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					done();
				});
		});

		it('missing email parameters - return 400', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/login')
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(400);
					expect(res.body.message).equal('Missing required email parameter');
					done();
				});
		});

		it('Invalid HTTP PUT method - return 405', (done) => {
			chai
				.request(server)
				.put('/api/v1/users/login')
				.send({ email: email2 })
				.end((err, res) => {
					expect(res.statusCode).equal(405);
					expect(res.body.message).equal('Method not allowed');
					done();
				});
		});

		it('direct login attempt - return 401', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/login')
				.send({ email })
				.end((err, res) => {
					expect(res.statusCode).equal(401);
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
		const email = 'foo6@bar.com';

		const name2 = 'foo7';
		const email2 = 'foo7@bar.com';

		let otpCorrect;
		const otpWrong = '000000';

		// Before all tests begin
		// 1. Register and verify a user
		before((done) => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Registering and verifying a user\n');
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name: name2, email: email2 })
				.end((err, res) => {
					otpCorrect = res.body.data;
					chai
						.request(server)
						.post('/api/v1/users/signup/verify')
						.send({ email: email2, otp: otpCorrect })
						.end((err, res) => {
							chai
								.request(server)
								.post('/api/v1/users/login')
								.send({ email: email2 })
								.end((err, res) => {
									otpCorrect = res.body.data;
									done();
								});
						});
				});
		});

		it('login success - return 200', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/login/verify')
				.send({ email: email2, otp: otpCorrect })
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					done();
				});
		});

		it('missing email parameters - return 400', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/login/verify')
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(400);
					expect(res.body.message).equal('Missing required email or OTP parameters');
					done();
				});
		});

		it('Invalid HTTP PUT method - return 405', (done) => {
			chai
				.request(server)
				.put('/api/v1/users/login/verify')
				.send({ email: email2, otp: otpCorrect })
				.end((err, res) => {
					expect(res.statusCode).equal(405);
					expect(res.body.message).equal('Method not allowed');
					done();
				});
		});

		it('Email not registered - return 401', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/login/verify')
				.send({ email, otp: otpCorrect })
				.end((err, res) => {
					expect(res.statusCode).equal(401);
					expect(res.body.message).equal('Email not registered');
					done();
				});
		});

		it('Incorrect otp - return 401', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/login/verify')
				.send({ email: email2, otp: otpWrong })
				.end((err, res) => {
					expect(res.statusCode).equal(401);
					expect(res.body.message).equal('Invalid OTP or email');
					done();
				});
		});
	});
});
