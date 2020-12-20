/**
 * Test root-level APIs
 * 1. api/v1/status
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const httpResponse = require('http-status');

const constants = require('$/config/constants.js');
const app = require('$/app');

const { expect } = chai;

chai.use(chaiHttp);

describe('Integration - Test root endpoints', () => {
	after(() => {
		console.log('\n------------- AFTER TESTS -------------');
		console.log('\n1. Exiting test');
		console.log('\n---------------------------------------');
		console.log('\n\n\n');
	});
	// Test root level API
	// 1. Valid endpoint
	// 2. Invalid endpoint
	describe('/', () => {
		it('GET /status - return 200', (done) => {
			chai
				.request(app)
				.get('/status')
				.end((err, res) => {
					expect(res.statusCode).equal(httpResponse.OK);

					const mongoStates = Object.keys(constants.MONGO_STATES).map((key) => {
						return constants.MONGO_STATES[key];
					});
					expect(res.body.status).to.be.oneOf(mongoStates);

					done();
				});
		});

		it('GET /404 - return 404', (done) => {
			chai
				.request(app)
				.get('/404')
				.end((err, res) => {
					expect(res.statusCode).equal(404);
					done();
				});
		});
	});
});
