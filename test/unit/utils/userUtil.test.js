const chai = require('chai');
const userUtil = require('$/utils/userUtil');

describe('Unit - Test User Utils', () => {
	after(() => {
		console.log('\n------------- AFTER TESTS -------------');
		console.log('\n1. Exiting test');
		console.log('\n---------------------------------------');
		console.log('\n\n\n');
	});

	// Test getOTP()
	// 1. returns 6-digit number
	describe('getOTP()', () => {
		it('should return 6-digit otp', () => {
			const otp = userUtil.getOTP();
			chai.assert(otp / 100000, 6);
		});
	});
});
