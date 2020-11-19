module.exports = Object.freeze({
	HASH_LENGTH: 32,
	BCRYPT_SALT_LENGTH: 12,
	SENDGRID_ENDPOINT: 'https://api.sendgrid.com/v3/scopes',

	MONGO_STATES: {
		0: 'disconnected',
		1: 'connected',
		2: 'connecting',
		3: 'disconnecting',
	},
});
