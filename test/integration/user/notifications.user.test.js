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

describe('Integration - Test users notifications endpoints', () => {
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

	// Test /users/notifications API - POST method
	// 1. successful updation of isRead in notifications
	// 2. User not logged in
	// 3. Missing parameters
	describe('GET /api/v1/users/me', () => {
		const name = 'test_name';
		const email = 'test_email@bar.com';
		const address = 'test_address';
		const notification = [
			{
				text: 'A liked your book, B',
				isRead: false,
				userId: mongoose.Types.ObjectId(),
				timestamp: new Date('2021-01-20T14:56:59.301+00:00'),
			},
			{
				text: 'B liked your book, C',
				isRead: false,
				userId: mongoose.Types.ObjectId(),
				timestamp: new Date('2021-01-19T14:56:59.301+00:00'),
			},
			{
				text: 'C liked your book, D',
				isRead: false,
				userId: mongoose.Types.ObjectId(),
				timestamp: new Date('2021-01-25T14:56:59.301+00:00'),
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
					address,
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

		it('successful updation of isRead in notifications - return 200', (done) => {
			const resBody = {
				newNotifications: {
					notifications: [
						{
							text: user.notifications[2].text,
							userId: user.notifications[2].userId,
						},
					],
					timestamp: new Date('2021-01-25T14:56:59.301+00:00'),
				},
			};

			const jsonData = JSON.parse(JSON.stringify(resBody));

			chai
				.request(app)
				.post('/api/v1/users/notifications')
				.set('Cookie', `jwt_token=${jwt}`)
				.send({ timestamp: '2021-01-22T14:56:59.301+00:00' })
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);
					expect(res.body.data).deep.equals(jsonData);
					done();
				});
		});

		it('user not logged in - return 401', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/notifications')
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.UNAUTHORIZED);
					expect(res.body.message).equal(constants.RESPONSE_NOT_LOGGED_IN);
					done();
				});
		});

		it('Missing parameters - return 400', (done) => {
			chai
				.request(app)
				.post('/api/v1/users/notifications')
				.set('Cookie', `jwt_token=${jwt}`)
				.send({})
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.BAD_REQUEST);
					expect(res.body.message).equal(constants.RESPONSE_MISSING_PARAMETERS);
					done();
				});
		});
	});
});
