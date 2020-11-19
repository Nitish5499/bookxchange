const request = require('request');
const chai = require('chai');

const { expect } = chai;
const dotenv = require('dotenv');

const constants = require('$/config/constants');

describe('Config - Test config setup', () => {
	let options;

	// Before all tests begin
	// 1. Load environment
	// 2. Set request options
	before(() => {
		console.log('\n------------- BEFORE TESTS -------------');
		console.log('\n1. Loading environment\n');
		dotenv.config({
			path: './config/test.env',
		});

		console.log('\n2. Fetching SendGrid API KEY\n\n');
		options = {
			url: constants.SENDGRID_ENDPOINT,
			headers: {
				Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
			},
		};
	});

	after(() => {
		console.log('\n------------- AFTER TESTS -------------');
		console.log('\n1. Exiting test');
		console.log('\n---------------------------------------');
		console.log('\n\n\n');
	});

	// Test SendGrid API KEY
	// 1. verify if API KEY is valid
	describe('Verify SendGrid API KEY', () => {
		it('should return 200', () => {
			request.get(options, (err, res) => {
				expect(res.statusCode).equal(200);
			});
		});
	});
});
