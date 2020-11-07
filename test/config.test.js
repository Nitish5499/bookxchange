const request = require('request');
const chai = require('chai');
const dotenv = require('dotenv');

const constants = require('$/config/constants');

describe('Test config setup', () => {
	describe('SendGrid API KEY', () => {
		var options;

		before(function () {
			dotenv.config({
				path: './config/development.env',
			});

			options = {
				url: constants.SENDGRID_ENDPOINT,
				headers: {
					Authorization: 'Bearer ' + process.env.SENDGRID_API_KEY,
				},
			};
		});

		it('should return 200', () => {
			request.get(options, function (err, res) {
				chai.expect(res.statusCode).to.equal(200);
			});
		});
	});
});
