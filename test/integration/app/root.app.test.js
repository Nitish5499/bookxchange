/**
 * Test root-level APIs
 * 1. api/v1/status
 */

const dotenv = require('dotenv');
const chai = require('chai');
const chaiHttp = require('chai-http');

const constants = require('$/config/constants.js');

const { expect } = chai;

chai.use(chaiHttp);

describe('Integration - Test root endpoints', () => {
	// Test root level API
	// 1. Valid endpoint
	// 2. Invalid endpoint
	describe('/', () => {
		let server;

		// Before all tests begin
		// 1. Load environment
		// 2. Start server
		before(() => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Loading environment');
			dotenv.config({
				path: './config/test.env',
			});

			console.log('\n2. Starting server');
			// eslint-disable-next-line global-require
			server = require('$/server');

			console.log('\n---------------------------------------');
		});

		// After each tests ends
		// 1. Delete server cache
		afterEach(() => {
			console.log('\n---------- AFTER EACH TEST -----------');
			console.log('\n1. Deleting server cache');
			delete require.cache[require.resolve('$/server')];
			console.log('\n---------------------------------------');
		});

		after(() => {
			console.log('\n------------- AFTER TESTS -------------');
			console.log('\n1. Exiting test');
			console.log('\n---------------------------------------');
			console.log('\n\n\n');
		});

		it('GET /status - return 200', (done) => {
			chai
				.request(server)
				.get('/status')
				.end((err, res) => {
					expect(res.statusCode).equal(200);

					const mongoStates = Object.keys(constants.MONGO_STATES).map((key) => {
						return constants.MONGO_STATES[key];
					});
					expect(res.body.status).to.be.oneOf(mongoStates);

					done();
				});
		});

		it('GET /404 - return 404', (done) => {
			chai
				.request(server)
				.get('/404')
				.end((err, res) => {
					expect(res.statusCode).equal(404);
					done();
				});
		});
	});
});
