const mongoose = require('mongoose');
const dotenv = require('dotenv');

exports.mochaGlobalSetup = async () => {
	console.log('\n------------- GLOBAL SETUP -------------');
	console.log('\n1. Loading environment');
	dotenv.config({
		path: './config/env/test.env',
	});

	const database = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

	console.log('\n2. Connecting to database\n');
	await mongoose.connect(database, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	});
	console.log(`Connected to database - ${mongoose.connection.name}`);
	console.log('\n---------------------------------------');
};

exports.mochaGlobalTeardown = async () => {
	console.log('\n------------- GLOBAL TEARDOWN -------------');
	console.log('\n1. Disconnecting from database');
	await mongoose.disconnect();
	console.log('\n2. Exiting test');
	console.log('\n---------------------------------------');
	console.log('\n\n\n');
};
