const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const chai = require('chai');
const chaiJWT = require('chai-jwt');
const dotenv = require('dotenv');

const { expect } = chai;

const authController = require('$/controllers/authController');

chai.use(chaiJWT);

describe('Unit - Test Auth Controller', () => {
	// Before all tests begin
	// 1. Load environment
	before(async () => {
		console.log('\n------------- BEFORE TESTS -------------');
		console.log('\n1. Loading environment');

		dotenv.config({
			path: './config/test.env',
		});
	});

	// After all tests complete
	after(async () => {
		console.log('\n------------- AFTER TESTS -------------');
		console.log('\n3. Exiting test');
		console.log('\n---------------------------------------');
		console.log('\n\n\n');
	});

	// Test createToken()
	// 1. expect valid jwt token
	describe('createToken() function', () => {
		it('expect valid jwt token', async () => {
			const testEmail = 'foo@bar.com';

			const jwtToken = authController.createToken(testEmail);
			// eslint-disable-next-line no-unused-expressions
			expect(jwtToken).to.be.a.jwt;
			expect(jwtToken).to.be.signedWith(process.env.JWT_SECRET);

			const decode = await promisify(jwt.verify)(jwtToken, process.env.JWT_SECRET);
			const { email } = decode;
			expect(email).to.equal(testEmail);
		});
	});
});
