const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const dotenv = require('dotenv');

const constants = require('$/config/constants.js');

chai.use(chaiHttp);

describe('Integration - Test root endpoints', () => {
	// Test root level API
	// 1. valid endpoint
	// 2. invalid endpoint
	describe('/', () => {
		var server;

		// Before all tests begin
		// 1. Load environment
		// 2. Start server
		before(() => {
			console.log('\n------------- BEFORE TESTS -------------');
			console.log('\n1. Loading environment');
			dotenv.config({
				path: './config/test.env',
			});

			console.log('\n2. Starting server\n');
			server = require('$/server');
		});

		// After each tests ends
		// 1. Delete server cache
		afterEach(() => {
			console.log('\n------------- AFTER EACH TEST -------------');
			console.log('\n1. Deleting server cache\n\n');
			delete require.cache[require.resolve('$/server')];
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

					const mongoStates = Object.keys(constants.MONGO_STATES).map(function (key) {
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
