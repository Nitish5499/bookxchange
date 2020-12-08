/* eslint-disable no-shadow, no-unused-vars */

/**
 * Test user-me APIs
 * 1. GET api/v1/user/me
 * 2. PATCH api/v1/users/me
 */

const dotenv = require('dotenv');
const chai = require('chai');
const chaiHttp = require('chai-http');

const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');

const { expect } = chai;

chai.use(chaiHttp);

describe('Integration - Test users me endpoints', () => {
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

	// Test /users/me API - GET method
	// 1. User info retrieval success
	// 2. User not logged in
	// 3. Invalid HTTP PUT method
	describe('GET /api/v1/users/me', () => {
		const name = 'test_name';
		const email = 'test_email@bar.com';
		const address = 'test_address';

		let user;
		let jwt;

		// Before all tests begin
		// 1. create a new user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');

			console.log('\n1.create a new user');
			try {
				user = await User.create({
					name,
					email,
					address,
					otp: '',
					active: true,
				});

				jwt = authUtil.createToken(user._id);

				console.log('\n2. Creating session for user in database');
				await Session.create({
					userId: user._id,
					sessionToken: jwt,
				});
			} catch (err) {
				console.log(err);
				process.exit(1);
			}
			console.log('\n---------------------------------------\n');
		});

		it('retrieval success - return 200', (done) => {
			const resBody = {
				name: user.name,
				email: user.email,
				address: user.address,
			};

			const jsonData = JSON.parse(JSON.stringify(resBody));

			chai
				.request(server)
				.get('/api/v1/users/me')
				.set('Cookie', `jwt_token=${jwt}`)
				.send()
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					expect(res.body.data).deep.equals(jsonData);
					done();
				});
		});

		it('user not logged in - return 401', (done) => {
			chai
				.request(server)
				.get('/api/v1/users/me')
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(401);
					expect(res.body.message).equal('You are not logged in! Please login in to continue');
					done();
				});
		});

		it('Invalid HTTP PUT method - return 405', (done) => {
			chai
				.request(server)
				.put('/api/v1/users/me')
				.set('Cookie', `jwt_token=${jwt}`)
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(405);
					expect(res.body.message).equal('Method not allowed');
					done();
				});
		});
	});

	// Test /users/me PATCH API
	// 1. Successful update of user info
	// 2. missing update parameters
	describe('PATCH /api/v1/users/me', () => {
		const email = 'foo6@bar.com';
		const name = 'foo6';
		const address = 'foo_address';
		const updateName = 'test_name';
		const updateAddress = 'test_address';

		let user;
		let jwt;

		// Before all tests begin
		// 1. Create a new user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Registering and verifying a user\n');

			user = await User.create({
				name,
				email,
				address,
				otp: '',
				active: true,
			});

			jwt = authUtil.createToken(user._id);

			console.log('\n2. Creating session for user in database');
			await Session.create({
				userId: user._id,
				sessionToken: jwt,
			});

			console.log('\n---------------------------------------\n');
		});

		it('Successful update of user info - return 200', (done) => {
			const resBody = {
				name: updateName,
				email,
				address: updateAddress,
			};

			const jsonData = JSON.parse(JSON.stringify(resBody));

			chai
				.request(server)
				.patch('/api/v1/users/me')
				.set('cookie', `jwt_token=${jwt}`)
				.send({ name: updateName, address: updateAddress })
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					expect(res.body.data).equals('update successful');
					User.findById(user._id)
						.select('name email address -_id')
						.then((user, err) => {
							expect(JSON.parse(JSON.stringify(user))).deep.equals(jsonData);
						});
					done();
				});
		});

		it('missing update parameters - return 400', (done) => {
			chai
				.request(server)
				.patch('/api/v1/users/me')
				.set('cookie', `jwt_token=${jwt}`)
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(400);
					expect(res.body.message).equal('Missing update parameters');
					done();
				});
		});
	});
});
