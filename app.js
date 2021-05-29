const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const httpResponse = require('http-status');

const routes = require('$/routes/index');

const { ErrorHandler, handleError } = require('$/utils/errorHandler');
const logger = require('$/config/logger');

const app = express();

// Allow Cross-Origin requests
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

// Set security HTTP headers
app.use(helmet());

// Body parser, reading data from body into req.body
app.use(
	express.json({
		limit: '15kb',
	}),
);

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Logger
if (process.env.NODE_ENV !== 'test') {
	app.use(morgan('combined', { stream: logger.stream }));
}

// cookie-parser
app.use(cookieParser());

// Main router
app.use('/', routes);

// handle undefined Routes
app.use('*', (req, res, next) => {
	const err = new ErrorHandler(httpResponse.NOT_FOUND, httpResponse[httpResponse.NOT_FOUND]);
	next(err, req, res, next);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	handleError(err, res);
});

module.exports = app;
