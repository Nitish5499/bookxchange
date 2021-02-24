const mongoose = require('mongoose');
const dotenv = require('dotenv');

const logger = require('$/config/logger');

if (process.env.NODE_ENV === 'development') {
	dotenv.config({
		path: './config/env/development.env',
	});
} else if (process.env.NODE_ENV === 'development-frontend') {
	dotenv.config({
		path: './config/env/development-frontend.env',
	});
} else {
	dotenv.config({
		path: './config/env/production.env',
	});
}

process.on('uncaughtException', (err) => {
	console.log('Uncaught Exception! shutting down...');
	console.log(err.name, err.message);
	process.exit(1);
});

const app = require('./app');

const database = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// Connect the database
mongoose
	.connect(database, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})
	.then(() => {
		logger.info(`Connected to database - ${mongoose.connection.name}`);
	});

// Start the server
const port = process.env.PORT;
const server = app.listen(port, () => {
	logger.info(`Application is running on port ${port}`);
	logger.info(`Environment - ${process.env.NODE_ENV}`);
});

process.on('unhandledRejection', (err) => {
	console.log('Unhandled Exception!  shutting down ...');
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});

module.exports = server;
