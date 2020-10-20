"use strict";

const winston = require("winston");

const myformat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
  )
);

module.exports = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: myformat,
    }),
  ],
});
