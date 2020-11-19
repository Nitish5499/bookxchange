const express = require('express');

const router = express.Router();
const userController = require('$/controllers/userController');
const errorController = require('$/controllers/errorController');

// Signup
router.all('/signup', errorController.methods(['POST']), userController.signup);
router.all('/signup/verify', errorController.methods(['POST']), userController.verify);

// Login
router.all('/login', errorController.methods(['POST']), userController.login);
router.all('/login/verify', errorController.methods(['POST']), userController.verifyOTP);

// JWT Middleware
router.use(userController.verifyJWT);

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
