const express = require('express');

const bookController = require('$/controllers/bookController');
const errorController = require('$/controllers/errorController');

// const authMiddleware = require('$/middlewares/authMiddleware');
const validateMiddleware = require('$/middlewares/validateMiddleware');

const bookValidation = require('$/validations/bookValidation');

const router = express.Router();

// JWT Middleware
// router.use(authMiddleware.verifyJWT);

// GET  - Fetch all books of a user
// POST - Add a new book
router
	.route('/')
	.get(bookController.getAllBooks)
	.post(validateMiddleware(bookValidation.addBook), bookController.addBook)
	.all(errorController.methods(['GET', 'POST']));

// GET    - Fetch a book by its ID
// PATCH  - Update a book by its ID
// DELETE - Delete a book by its ID
router
	.route('/:id')
	.get(validateMiddleware(bookValidation.getBook), bookController.getBook)
	.patch(validateMiddleware(bookValidation.updateBook), bookController.updateBook)
	.delete(validateMiddleware(bookValidation.deleteBook), bookController.deleteBook)
	.all(errorController.methods(['GET', 'PATCH', 'DELETE']));

module.exports = router;
