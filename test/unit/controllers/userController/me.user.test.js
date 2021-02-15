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

	// Test getUser function
	// 1. Successful retrieval of user details
	describe('getUser() function', () => {
		const name = 'jett';
		const email = 'jett@rp.com';
		const address = 'test_address';
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
					address,
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

		it('successful retrieval of user details - return 200', async () => {
			const req = mocks.createRequest({
				user,
				method: 'GET',
				body: {
					email,
				},
			});

			const res = mocks.createResponse();

			const userData = {
				name: dbUser.name,
				email: dbUser.email,
				address: dbUser.address,
				notifications: [
					{
						text: dbUser.notifications[0].text,
						userId: dbUser.notifications[0].userId,
					},
					{
						text: dbUser.notifications[1].text,
						userId: dbUser.notifications[1].userId,
					},
				],
				timestamp: dbUser.notifications[0].timestamp,
			};

			const jsonData = JSON.parse(JSON.stringify(userData));

			await userController.getUser(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).deep.equals(jsonData);
		});
	});

	// Test updateUser function
	// 1. Successful update of user details
	describe('updateUser() function', () => {
		const name = 'jett1';
		const email = 'jett1@rp.com';
		const address = 'test_address';

		let dbUser;

		// Before all tests begin
		// 1. Create a new user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating user in database');

			try {
				dbUser = await User.create({
					name,
					email,
					address,
					otp: '',
					active: true,
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

		it('successful update of user details - return 200', async () => {
			const req = mocks.createRequest({
				user: dbUser,
				method: 'PATCH',
				body: {
					name: 'test_update',
					address: 'test_address',
				},
			});

			const res = mocks.createResponse();

			const message = constants.RESPONSE_USER_UPDATE_SUCCESS;

			await userController.updateUser(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).deep.equals(message);
		});
	});
});
