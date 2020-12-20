const winston = require('winston');

const enumerateErrorFormat = winston.format((info) => {
	if (info instanceof Error) {
		Object.assign(info, { message: info.stack });
	}
	return info;
});

// eslint-disable-next-line new-cap
const logger = new winston.createLogger({
	level: process.env === 'development' ? 'debug' : 'info',
	format: winston.format.combine(
		enumerateErrorFormat(),
		process.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
		winston.format.timestamp(),
		winston.format.splat(),
		winston.format.json(({ level, message }) => `${level}: ${message}`),
	),

	transports: [
		new winston.transports.File({
			level: 'error',
			filename: './logs/error.log',
			handleExceptions: true,
			json: true,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
			colorize: false,
			silent: process.env.NODE_ENV === 'test',
		}),
		new winston.transports.File({
			level: 'info',
			filename: './logs/all-logs.log',
			handleExceptions: true,
			json: true,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
			colorize: false,
			silent: process.env.NODE_ENV === 'test',
		}),
		new winston.transports.Console({
			level: 'debug',
			handleExceptions: true,
			json: false,
			colorize: true,
			silent: process.env.NODE_ENV === 'test',
		}),
	],
	exitOnError: false,
});

module.exports = logger;
module.exports.stream = {
	write(message) {
		logger.info(message);
	},
};
