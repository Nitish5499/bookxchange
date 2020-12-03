const express = require('express');

const userController = require('$/controllers/userController');
const errorController = require('$/controllers/errorController');

const authMiddleware = require('$/middlewares/authMiddleware');

const router = express.Router();

// Signup
router.all('/signup', errorController.methods(['POST']), userController.signup);
router.all('/signup/verify', errorController.methods(['POST']), userController.signupVerify);

// Login
router.all('/login', errorController.methods(['POST']), userController.login);
router.all('/login/verify', errorController.methods(['POST']), userController.loginVerify);

// Logout
router.all('/logout', errorController.methods(['GET']), userController.logout);

// JWT Middleware
router.use(authMiddleware.verifyJWT);

// // Protect all routes after this middleware
// router.use(authController.protect);

// router.delete("/deleteMe", userController.deleteMe);

// // Only admin have permission to access for the below APIs
// router.use(authController.restrictTo("admin"));

// router.route("/").get(userController.getAllUsers);

// router
//   .route("/:id")
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
