const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const dotenv = require('dotenv');

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

		it('GET /status - return 200', (done) => {
			chai
				.request(server)
				.get('/status')
				.end((err, res) => {
					expect(res.statusCode).equal(200);
					expect(res.body.status).to.equal('alive');
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
