const httpStatus = require('http-status');

const objectId = (value, helpers) => {
	if (!value.match(/^[0-9a-fA-F]{24}$/)) {
		return helpers.message(httpStatus[httpStatus.BAD_REQUEST]);
	}
	return value;
};

module.exports = {
	objectId,
};
