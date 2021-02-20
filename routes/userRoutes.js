const express = require('express');

const userController = require('$/controllers/userController');
const errorController = require('$/controllers/errorController');

const authMiddleware = require('$/middlewares/authMiddleware');
const validateMiddleware = require('$/middlewares/validateMiddleware');

const userValidation = require('$/validations/userValidation');

const router = express.Router();

// POST - register a new user
router
	.route('/signup')
	.post(validateMiddleware(userValidation.signup), userController.signup)
	.all(errorController.methods(['POST']));

// POST - verify a new user
router
	.route('/signup/verify')
	.post(validateMiddleware(userValidation.signupVerify), userController.signupVerify)
	.all(errorController.methods(['POST']));

// POST - request new login otp
router
	.route('/login')
	.post(validateMiddleware(userValidation.login), userController.login)
	.all(errorController.methods(['POST']));

// POST - verify new login otp
router
	.route('/login/verify')
	.post(validateMiddleware(userValidation.loginVerify), userController.loginVerify)
	.all(errorController.methods(['POST']));

// JWT Middleware
router.use(authMiddleware.verifyJWT);

// GET - logout user
router
	.route('/logout')
	.get(userController.logout)
	.all(errorController.methods(['GET']));

// GET   - fetch details of user
// PATCH - update details of user
router
	.route('/me')
	.get(userController.getUser)
	.patch(validateMiddleware(userValidation.updateUser), userController.updateUser)
	.all(errorController.methods(['GET', 'PATCH']));

// POST - set the notifications' isRead value
router
	.route('/notifications')
	.post(validateMiddleware(userValidation.readNotifications), userController.readNotifications)
	.all(errorController.methods(['POST']));

// GET - fetch details of a user
router
	.route('/:id')
	.get(validateMiddleware(userValidation.getOtherUser), userController.getOtherUser)
	.all(errorController.methods(['GET']));

module.exports = router;
