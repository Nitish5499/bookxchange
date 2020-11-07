const userUtil = require('$/utils/userUtil');

const chai = require('chai');

describe('Test User Utils', () => {
	describe('getOTP()', () => {
		it('should return 6-digit otp', () => {
			const otp = userUtil.getOTP();
			chai.assert(otp / 100000, 6);
		});
	});
});
