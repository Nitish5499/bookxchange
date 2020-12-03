/**
 * Test logout-related functions
 * 1. logout()
 */

const mocks = require('node-mocks-http');
const chai = require('chai');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userController = require('$/controllers/userController');

const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');

const authUtil = require('$/utils/authUtil');

const { expect } = chai;

describe('Unit - Test User Controller', () => {
	// Before all tests begin
	// 1. Load environment
	// 2. Connect to test database
	// 3. Delete all documents from Users, Sessions collection
	before(async () => {
		console.log('\n------------- BEFORE TESTS -------------');
		console.log('\n1. Loading environment');
		dotenv.config({
			path: './config/test.env',
		});

		const database = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

		console.log('\n2. Connecting to database\n');
		try {
			await mongoose.connect(database, {
				useNewUrlParser: true,
				useCreateIndex: true,
				useFindAndModify: false,
				useUnifiedTopology: true,
			});
			console.log(`Connected to database - ${mongoose.connection.name}\n`);

			console.log('\n3. Deleting all documents from Users, Sessions collection\n');
			await User.deleteMany({});
			await Session.deleteMany({});
		} catch (err) {
			console.log(err);
			process.exit(1);
		}

		console.log('\n---------------------------------------\n');
	});

	// After all tests complete
	// 1. Delete all documents from Users, Sessions collection
	// 2. Close database connection
	// 3. Exit process
	after(async () => {
		console.log('\n------------- AFTER TESTS -------------');
		try {
			console.log('\n1. Deleting all documents from Users, Sessions collection');
			await User.deleteMany({});
			await Session.deleteMany({});

			console.log('\n2. Closing database connection');
			mongoose.connection.close();

			console.log('\n3. Exiting test');
			console.log('\n---------------------------------------');
			console.log('\n\n\n');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	// Test logout()
	// 1. logout successful - invalid session
	// 2. logout successful - valid session
	describe('logout() function', () => {
		const name = 'foo';
		const email = 'foo@bar.com';

		let jwtTokenValid;
		let jwtTokenInvalid;

		let dbUser;

		// Before all tests begin
		// 1. Register new user
		// 2. Register session for the user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');

			try {
				console.log('\n1. Creating user in database');
				dbUser = await User.create({
					name,
					email,
					otp: '',
					active: true,
				});

				jwtTokenValid = authUtil.createToken(dbUser._id);

				const fakeUserId = mongoose.Types.ObjectId();
				jwtTokenInvalid = authUtil.createToken(fakeUserId);

				console.log('\n2. Creating session for user in database');
				await Session.create({
					userId: dbUser._id,
					sessionToken: jwtTokenValid,
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

		it('logout successful - invalid session, return 200', async () => {
			const req = mocks.createRequest({
				method: 'GET',
				cookies: {
					// eslint-disable-next-line camelcase
					jwt_token: jwtTokenInvalid,
				},
			});
			const res = mocks.createResponse();

			await userController.logout(req, res, (err) => {
				console.log(err);
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).equal('successfully logged out');
		});

		it('logout successful - valid session, return 200', async () => {
			const req = mocks.createRequest({
				method: 'GET',
				cookies: {
					// eslint-disable-next-line camelcase
					jwt_token: jwtTokenValid,
				},
			});
			const res = mocks.createResponse();

			await userController.logout(req, res, (err) => {
				console.log(err);
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).equal('successfully logged out');

			const dbSession = await Session.findOne({ userId: dbUser._id, sessionToken: jwtTokenValid });
			// eslint-disable-next-line no-unused-expressions
			expect(dbSession).to.be.null;
		});
	});
});