const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const dotenv = require('dotenv');

const User = require('$/models/userModel');

chai.use(chaiHttp);

describe('Integration - Test users signup endpoints', () => {
	var server;

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
			console.log('Deleting all documents from Users collection');
			await User.deleteMany({});

			console.log('Exiting test');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	// Test /signup API
	// 1. valid endpoint and data
	describe('POST /api/v1/users/signup', () => {
		it('POST /api/v1/users/signup - return 200', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name: 'foo', email: 'foo@bar.com' })
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					done();
				});
		});
	});

	// Test /signup/verify API
	// 1. valid endpoint and data
	describe('POST /api/v1/users/signup/verify', () => {
		const name = 'foo1';
		const email = 'foo1@bar.com';
		var otpCorrect;

		// Before all tests begin
		// 1. Register a user using /signup
		before((done) => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Registering user\n');
			chai
				.request(server)
				.post('/api/v1/users/signup')
				.send({ name: name, email: email })
				.end((err, res) => {
					otpCorrect = res.body.data;
					done();
				});
		});

		it('POST /api/v1/users/signup/verify - return 200', (done) => {
			chai
				.request(server)
				.post('/api/v1/users/signup/verify')
				.send({ email: email, otp: otpCorrect })
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					done();
				});
		});
	});
});
