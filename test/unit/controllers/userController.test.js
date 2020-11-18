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

			console.log('\n3. Deleting all documents from Users collection\n');
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
			console.log('\n---------------------------------------');
			console.log('\n\n\n');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	// Test signup()
	// 1. registration successful
	// 2. missing name and email
	// 3. invalid email format
	describe('signup() function', () => {
		it('registration success - return 200', async () => {
			const req = mocks.createRequest({
				method: 'POST',
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

		it('missing name and email - return 400', async () => {
			const req = mocks.createRequest({
				method: 'POST',
			});
			const res = mocks.createResponse();

			await userController.signup(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Missing required name and email parameters');
			});
		});

		it('invalid email format - return error', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					name: 'foo',
					email: 'foo',
				},
			});
			const res = mocks.createResponse();

			await userController.signup(req, res, (err) => {
				expect(err.message).to.include('Please provide a valid email');
			});
		});
	});

	// Test verify()
	// 1. wrong otp
	// 2. verification success
	// 3. missing email and otp
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

		it('wrong otp - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
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
				method: 'POST',
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

		});

		it('missing email and otp - return 400', async () => {
			const req = mocks.createRequest({
				method: 'POST',
			});
			const res = mocks.createResponse();

			await userController.verify(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Missing required email and otp parameters');
			});
		});
	});

	//Test Login function
	//1.user not registered
	//2.user not verified
	//3.Missing email parameter
	//4.successful login attempt
	describe('login() function', ()=> {
		const name = 'jett';
		const email = 'jett@rp.com';
		const email2 = 'faker@hacker.com';
		const email3 = 'aaa@bbb.com';
		const name3 = 'abcd';

		// before all tests begin
		// 1.create a registered user
		// 2.create a new user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating user in database\n');

			try {
				await User.create({
					name: name,
					email: email,
					otp: '',
					active: true,
				});
				await User.create({
					name: name3,
					email: email3,
					otp: '',
					active: false,
				});
			} catch (err) {
				console.log(err);
				process.exit(1);
			}
		});
		
		it('user not registered - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email: email2,
				},
			});
			const res = mocks.createResponse();
			await userController.login(req, res, (err) => {
				expect(err.statusCode).equal(401);
				expect(err.message).equal('Email not registered');
			});
		});

		it('user not verified - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email: email3,
				},
			});
			const res = mocks.createResponse();
			await userController.login(req, res, (err) => {
				expect(err.statusCode).equal(401);
				expect(err.message).equal('Email not verified');
			});
		});

		it('missing email or otp - return 400', async () => {
			const req = mocks.createRequest({
				method: 'POST',
			});

			const res = mocks.createResponse();

			await userController.login(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Missing required email parameter');
			});
		});

		it('successful login attempt - return 200', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email: email,
				}
			});

			const res = mocks.createResponse();

			await userController.login(req, res, (err) => {
				expect(err).equal(false);
			});

			const { data } = res._getJSONData();
			expect(data).to.be.a('number');
		});
	});

	//Test verifyOTP function
	//1.user not registered
	//2.user not verified
	//3.Missing email or otp parameter
	//4.unsuccessful login(wrong otp)
	//5.successful login 
	describe('verifyOTP() function', ()=> {
		const name = 'jack';
		const email = 'jack@rp.com';

		const otpCorrect = '383749';
		const otpWrong = '343434';

		const email2 = 'faker@hacker.com';

		const email3 = 'aa@bb.com';
		const name3 = 'abcd';
		
		// before all tests begin
		// 1.create a registered user
		// 2.create a new user
		before(async () => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Creating user in database\n');

			try {
				await User.create({
					name: name,
					email: email,
					otp: otpCorrect,
					active: true,
				});
				await User.create({
					name: name3,
					email: email3,
					otp: '',
					active: false,
				});
			} catch (err) {
				console.log(err);
				process.exit(1);
			}
		});
		
		it('user not registered - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email: email2,
					otp: '434343'
				},
			});
			const res = mocks.createResponse();
			await userController.verifyOTP(req, res, (err) => {
				expect(err.statusCode).equal(401);
				expect(err.message).equal('Email not registered');
			});
		});

		it('user not verified - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email: email3,
					otp: '554344'
				},
			});
			const res = mocks.createResponse();
			await userController.verifyOTP(req, res, (err) => {
				expect(err.statusCode).equal(401);
				expect(err.message).equal('Email not verified');
			});
		});

		it('missing email or otp - return 400', async () => {
			const req = mocks.createRequest({
				method: 'POST',
			});

			const res = mocks.createResponse();

			await userController.verifyOTP(req, res, (err) => {
				expect(err.statusCode).equal(400);
				expect(err.message).equal('Missing required email or OTP parameters');
			});
		});

		it('unsuccessful login(wrong otp) - return 401', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email: email,
					otp: otpWrong
				}
			});

			const res = mocks.createResponse();

			await userController.verifyOTP(req, res, (err) => {
				expect(err.statusCode).equal(401);
				expect(err.message).equal('Invalid OTP or email');
			});
		});

		it('successful login - return 200', async () => {
			const req = mocks.createRequest({
				method: 'POST',
				body: {
					email: email,
					otp: otpCorrect
				}
			});

			const res = mocks.createResponse();

			await userController.verifyOTP(req, res, (err) => {
				expect(err).equal(false);
			});
      
			const cookie = res.cookies.jwt_token.value;
			expect(cookie).to.be.a('string');
		});
	});
});
