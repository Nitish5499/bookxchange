const request = require('request');
const chai = require('chai');
const expect = chai.expect;
const dotenv = require('dotenv');

const constants = require('$/config/constants');

describe('Config - Test config setup', () => {
	var options;

	// Before all tests begin
	// 1. Load environment
	// 2. Set request options
	before(() => {
		console.log('\n------------- BEFORE TESTS -------------');
		console.log('\n1. Loading environment\n');
		dotenv.config({
			path: './config/test.env',
		});

		console.log('\n2. Fetching SendGrid API KEY');
		options = {
			url: constants.SENDGRID_ENDPOINT,
			headers: {
				Authorization: 'Bearer ' + process.env.SENDGRID_API_KEY,
			},
		};
	});

	// Test SendGrid API KEY
	// 1. verify if API KEY is valid
	describe('Verify SendGrid API KEY', () => {
		it('should return 200', () => {
			request.get(options, function (err, res) {
				expect(res.statusCode).equal(200);
			});
		});
	});
});
