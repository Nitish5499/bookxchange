const mocks = require('node-mocks-http');
const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userController = require('$/controllers/userController');

const User = require('$/models/userModel');

describe('Unit - Test User Controller', () => {
	// Before all tests begin
	// 1. Load environment
	// 2. Connect to test database
	// 3. Delete all documents from Users collection
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

			console.log('Deleting all documents from Users collection\n');
			await User.deleteMany({});
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

			console.log('\n2. Closing database connection');
			mongoose.connection.close();

			console.log('\n3. Exiting test');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	// Test signup()
	// 1. missing name and email
	// 2. registration successful
	describe('signup() function', () => {
		it('missing name and email - return 400', async () => {
			const req = mocks.createRequest({
				method: 'GET',
			});
			const res = mocks.createResponse();

			await userController.signup(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Missing required name and email parameters');
			});
		});

		it('registration success - return 200', async () => {
			const req = mocks.createRequest({
				method: 'GET',
				body: {
					name: 'foo',
					email: 'foo@bar.com',
				},
			});
			const res = mocks.createResponse();

			await userController.signup(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).to.be.a('number');
		});
	});

	// Test verify()
	// 1. missing email and otp
	// 2. wrong otp
	// 3. verification success
	describe('verify() function', () => {
		const name = 'foo1';
		const email = 'foo1@bar.com';
		const otpCorrect = '313371';
		const otpWrong = '313370';

		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating user in database\n');

			try {
				await User.create({
					name: name,
					email: email,
					otp: otpCorrect,
					active: false,
				});
			} catch (err) {
				console.log(err);
				process.exit(1);
			}
		});

		it('missing email and otp - return 400', async () => {
			const req = mocks.createRequest({
				method: 'GET',
			});
			const res = mocks.createResponse();

			await userController.verify(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Missing required email and otp parameters');
			});
		});

		it('wrong otp - return 403', async () => {
			const req = mocks.createRequest({
				method: 'GET',
				body: {
					email: email,
					otp: otpWrong,
				},
			});
			const res = mocks.createResponse();

			await userController.verify(req, res, (err) => {
				expect(err.statusCode).equal(401);
				expect(err.message).equal('Email or otp is wrong');
			});
		});

		it('verification success - return 200', async () => {
			const req = mocks.createRequest({
				method: 'GET',
				body: {
					email: email,
					otp: otpCorrect,
				},
			});
			const res = mocks.createResponse();

			await userController.verify(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).equal('Email verified');

			const cookie = res.cookies.jwt_token.value;
			expect(cookie).to.be.a('string');
		});
	});
});
