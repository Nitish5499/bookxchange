/* eslint-disable no-shadow, no-unused-vars */

/**
 * Test user-logout APIs
 * 1. api/v1/logout
 */

const chai = require('chai');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');

const User = require('$/models/userModel');
const Session = require('$/models/sessionModel');
const app = require('$/app');

const authUtil = require('$/utils/authUtil');

const { expect } = chai;

chai.use(chaiHttp);

describe('Integration - Test users logout endpoints', () => {
	// Before all tests begin
	// 1. Load environment
	// 2. Start server
	// 3. Delete all documents from Users, Sessions collection
	before(async () => {
		try {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Deleting all documents from Users, Sessions collection');
			await User.deleteMany({});
			await Session.deleteMany({});
			console.log('\n---------------------------------------\n');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	// After all tests complete
	// 1. Delete all documents from Users, Sessions collection
	after(async () => {
		console.log('\n------------- AFTER TESTS -------------');
		try {
			console.log('\n1. Deleting all documents from Users, Sessions collection');
			await User.deleteMany({});
			await Session.deleteMany({});
			console.log('\n2. Exiting test');
			console.log('\n---------------------------------------');
			console.log('\n\n\n');
		} catch (err) {
			console.log(err);
			process.exit(1);
		}
	});

	// Test /logout API
	// 1. logout successful - no jwt
	// 2. logout successful - invalid session
	// 3. logout successful - valid session
	describe('GET /api/v1/users/logout', () => {
		const email = 'foo@bar.com';
		const name = 'foo';

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
				console.log('\n---------------------------------------');
			} catch (err) {
				console.log(err);
				process.exit(1);
			}
		});

		it('logout failed - no jwt, return 401', (done) => {
			chai
				.request(app)
				.get('/api/v1/users/logout')
				.end((err, res) => {
					expect(res.statusCode).equal(401);
					expect(res.body.message).equal('You are not logged in');
					done();
				});
		});

		it('logout successful - invalid session, return 200', (done) => {
			chai
				.request(app)
				.get('/api/v1/users/logout')
				.set('Cookie', `jwt_token=${jwtTokenInvalid}`)
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					expect(res.body.data).equal('successfully logged out');
					done();
				});
		});

		it('logout successful - valid session, return 200', (done) => {
			chai
				.request(app)
				.get('/api/v1/users/logout')
				.set('Cookie', `jwt_token=${jwtTokenValid}`)
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					expect(res.body.data).equal('successfully logged out');
					done();
				});
		});
	});
});
