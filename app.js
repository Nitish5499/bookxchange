const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const httpResponse = require('http-status');

const userRoutes = require('$/routes/userRoutes');
const bookRoutes = require('$/routes/bookRoutes');
const { ErrorHandler, handleError } = require('$/utils/errorHandler');
const logger = require('$/config/logger');
const constants = require('$/config/constants');

const app = express();

// Allow Cross-Origin requests
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Limit request from the same API
const limiter = rateLimit({
	max: 150,
	windowMs: 60 * 60 * 1000,
	message: 'Too Many Request from this IP, please try again in an hour',
});
app.use('/api', limiter);

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

// Test routes
app.get('/status', (req, res) => res.json({ status: constants.MONGO_STATES[mongoose.connection.readyState] }));

// Routes
app.use('/api/v1/users', userRoutes);

// Sample route
app.use('/api/v1/books', bookRoutes);

// handle undefined Routes
app.use('*', (req, res, next) => {
	const err = new ErrorHandler(httpResponse.NOT_FOUND, 'undefined route');
	next(err, req, res, next);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	handleError(err, res);
});

module.exports = app;
