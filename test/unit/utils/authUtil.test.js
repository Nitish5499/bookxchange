/**
 * Test util functions
 * 1. getOTP()
 * 2. createToken()
 */

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const chai = require('chai');
const chaiJWT = require('chai-jwt');
const dotenv = require('dotenv');

const authUtil = require('$/utils/authUtil');

const { expect } = chai;

chai.use(chaiJWT);

describe('Unit - Test Auth Util', () => {
	// Before all tests begin
	// 1. Load environment
	before(async () => {
		console.log('\n------------- BEFORE TESTS -------------');
		console.log('\n1. Loading environment');

		dotenv.config({
			path: './config/test.env',
		});

		console.log('\n---------------------------------------\n');
	});

	// After all tests complete
	after(async () => {
		console.log('\n------------- AFTER TESTS -------------');
		console.log('\n3. Exiting test');
		console.log('\n---------------------------------------');
		console.log('\n\n\n');
	});

	// Test getOTP()
	// 1. returns 6-digit number
	describe('getOTP()', () => {
		it('should return 6-digit otp', () => {
			const otp = authUtil.getOTP();
			chai.assert(otp / 100000, 6);
		});
	});

	// Test createToken()
	// 1. expect valid jwt token
	describe('createToken() function', () => {
		it('expect valid jwt token', async () => {
			const testId = 'foobar1234';

			const jwtToken = authUtil.createToken(testId);
			// eslint-disable-next-line no-unused-expressions
			expect(jwtToken).to.be.a.jwt;
			expect(jwtToken).to.be.signedWith(process.env.JWT_SECRET);

			const decode = await promisify(jwt.verify)(jwtToken, process.env.JWT_SECRET);
			const { id } = decode;
			expect(id).to.equal(testId);
		});
	});
});
