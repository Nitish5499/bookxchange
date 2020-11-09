const userUtil = require('$/utils/userUtil');

const chai = require('chai');

describe('Unit - Test User Utils', () => {
	// Test getOTP()
	// 1. returns 6-digit number
	describe('getOTP()', () => {
		it('should return 6-digit otp', () => {
			const otp = userUtil.getOTP();
			chai.assert(otp / 100000, 6);
		});
	});
});
