/* eslint-disable no-shadow, no-unused-vars */

/**
 * Test user-me APIs
 * 1. GET api/v1/user/me
 * 2. PATCH api/v1/users/me
 */

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const httpResponse = require('http-status');

const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');
const app = require('$/app');

const authUtil = require('$/utils/authUtil');
const constants = require('$/config/constants');

const { expect } = chai;

chai.use(chaiHttp);

describe('Integration - Test users me endpoints', () => {
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

	// Test /users/me API - GET method
	// 1. User info retrieval success
	// 2. User not logged in
	// 3. Invalid HTTP PUT method
	describe('GET /api/v1/users/me', () => {
		const name = 'test_name';
		const email = 'test_email@bar.com';
		const location = 'test_location';
		const notification = [
			{
				text: 'A liked your book, B',
				isRead: false,
				userId: mongoose.Types.ObjectId(),
				timestamp: new Date(),
			},
			{
				text: 'B liked your book, C',
				isRead: false,
				userId: mongoose.Types.ObjectId(),
				timestamp: new Date(),
			},
		];

		let user;
		let jwt;

		// Before all tests begin
		// 1. create a new user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');

			console.log('\n1. Create a new user');
			try {
				user = await User.create({
					name,
					email,
					location,
					otp: '',
					active: true,
					notifications: notification,
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
				location: user.location,
				notifications: [
					{
						text: user.notifications[0].text,
						userId: user.notifications[0].userId,
					},
					{
						text: user.notifications[1].text,
						userId: user.notifications[1].userId,
					},
				],
				timestamp: user.notifications[0].timestamp,
			};

			const jsonData = JSON.parse(JSON.stringify(resBody));

			chai
				.request(app)
				.get('/api/v1/users/me')
				.set('Cookie', `jwt_token=${jwt}`)
				.send()
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					expect(res.body.data).deep.equals(jsonData);
					done();
				});
		});

		it('user not logged in - return 401', (done) => {
			chai
				.request(app)
				.get('/api/v1/users/me')
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal(constants.RESPONSE_NOT_LOGGED_IN);
					done();
				});
		});

		it('Invalid HTTP PUT method - return 405', (done) => {
			chai
				.request(app)
				.put('/api/v1/users/me')
				.set('Cookie', `jwt_token=${jwt}`)
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.METHOD_NOT_ALLOWED);
					expect(res.body.message).equal(httpResponse[httpResponse.METHOD_NOT_ALLOWED]);
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
		const location = 'foo_location';
		const updateName = 'test_name';
		const updateLocation = '600083';

		let user;
		let jwt;

		// Before all tests begin
		// 1. Create a new user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Registering and verifying a user');

			user = await User.create({
				name,
				email,
				location,
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
				location: updateLocation,
			};

			const jsonData = JSON.parse(JSON.stringify(resBody));

			chai
				.request(app)
				.patch('/api/v1/users/me')
				.set('cookie', `jwt_token=${jwt}`)
				.send({ name: updateName, location: updateLocation })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					expect(res.body.data).equals(constants.RESPONSE_USER_UPDATE_SUCCESS);
					User.findById(user._id)
						.select('name email location -_id')
						.then((user, err) => {
							expect(JSON.parse(JSON.stringify(user))).deep.equals(jsonData);
						});
					done();
				});
		});

		it('missing update parameters - return 400', (done) => {
			chai
				.request(app)
				.patch('/api/v1/users/me')
				.set('cookie', `jwt_token=${jwt}`)
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.BAD_REQUEST);
					expect(res.body.message).equal(constants.RESPONSE_MISSING_PARAMETERS);
					done();
				});
		});
	});
});
