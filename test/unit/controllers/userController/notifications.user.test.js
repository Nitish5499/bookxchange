/**
 * Test user-update-related functions
 * 1. getUser()
 * 2. updateUser()
 */

const mongoose = require('mongoose');
const mocks = require('node-mocks-http');
const chai = require('chai');

const userController = require('$/controllers/userController');

const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');

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

	// Test getUser function
	// 1. Successful retrieval of user details
	describe('getUser() function', () => {
		const name = 'jett';
		const email = 'jett@rp.com';
		const location = 'test_location';
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

		let dbUser;
		let user;

		// Before all tests begin
		// 1. Create a new user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating user in database');

			try {
				dbUser = await User.create({
					name,
					email,
					location,
					otp: '',
					active: true,
					notifications: notification,
				});
				const jwt = authUtil.createToken(dbUser._id);
				user = await Session.create({
					userId: dbUser._id,
					sessionToken: jwt,
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

		it('successful updation of isRead in notifications - return 200', async () => {
			const req = mocks.createRequest({
				user,
				method: 'POST',
				body: {
					timestamp: '2021-01-22T14:56:59.301+00:00',
				},
			});

			const res = mocks.createResponse();

			const userData = {
				newNotifications: {
					notifications: [
						{
							text: dbUser.notifications[2].text,
							userId: dbUser.notifications[2].userId,
						},
					],
					timestamp: new Date('2021-01-25T14:56:59.301+00:00'),
				},
			};

			const jsonData = JSON.parse(JSON.stringify(userData));

			await userController.readNotifications(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).deep.equals(jsonData);
		});
	});
});
