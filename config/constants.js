module.exports = Object.freeze({
	// SendGrid API Key validation endpoint
	SENDGRID_ENDPOINT: 'https://api.sendgrid.com/v3/scopes',

	// MongoDB
	MONGO_ERROR: 'MongoError',
	MONGO_STATES: {
		0: 'disconnected',
		1: 'connected',
		2: 'connecting',
		3: 'disconnecting',
	},

	// Validation
	RESPONSE_MISSING_PARAMETERS: 'Missing parameters',

	// Distance for finding nearby zipcodes
	BOOKS_FIND_DISTANCE: 3000,

	// Response status
	STATUS_SUCCESS: 'Success',
	STATUS_ERROR: 'Error',

	// Authentication - general responses
	RESPONSE_EMAIL_ERROR: 'Error sending email',
	RESPONSE_EMAIL_EXISTS: 'Email already exists',
	RESPONSE_NOT_LOGGED_IN: 'You are not logged in, please login in to continue',

	// Book endpoints
	RESPONSE_BOOK_LIKE_FAIL: 'Book already liked',
	RESPONSE_BOOK_LIKE_SUCCESS: 'Book liked successfully',
	RESPONSE_BOOK_LIKE_MATCH: 'It is a match!',

	RESPONSE_BOOK_UNLIKE_FAIL: 'Book not liked yet',
	RESPONSE_BOOK_UNLIKE_SUCCESS: 'Book unliked successfully',

	// User endpoints
	RESPONSE_USER_AUTH_FAIL: 'Email or otp is wrong',
	RESPONSE_USER_AUTH_NO_EMAIL_FAIL: 'Email not registered',
	RESPONSE_USER_AUTH_NO_VERIFY_FAIL: 'Email not verified',

	RESPONSE_USER_SIGNUP_SUCCESS: 'Email has been sent',

	RESPONSE_USER_SIGNUP_VERIFY_FAIL: 'User email has already been verified',
	RESPONSE_USER_SIGNUP_VERIFY_SUCCESS: 'Email verified',

	RESPONSE_USER_LOGIN_SUCCESS: 'Check mail',

	RESPONSE_USER_LOGIN_VERIFY_SUCCESS: 'Login successful',

	RESPONSE_USER_UPDATE_SUCCESS: 'Update successful',

	RESPONSE_USER_LOGOUT_SUCCESS: 'Successfully logged out',
});
