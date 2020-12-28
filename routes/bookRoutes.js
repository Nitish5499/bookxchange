const express = require('express');

const bookController = require('$/controllers/bookController');
const errorController = require('$/controllers/errorController');

const authMiddleware = require('$/middlewares/authMiddleware');
const validateMiddleware = require('$/middlewares/validateMiddleware');

const bookValidation = require('$/validations/bookValidation');

const router = express.Router();

// JWT Middleware
router.use(authMiddleware.verifyJWT);

// POST - Add a new book
router
	.route('/')
	.post(validateMiddleware(bookValidation.addBook), bookController.addBook)
	.all(errorController.methods(['POST']));

// GET  - Fetch all liked books of a user
router
	.route('/liked')
	.get(bookController.getLikedBooks)
	.all(errorController.methods(['GET']));

// GET  - Fetch all books of a user
router
	.route('/owned')
	.get(bookController.getAllBooks)
	.all(errorController.methods(['GET']));

// GET    - Fetch a book by its ID
// PATCH  - Update a book by its ID
// DELETE - Delete a book by its ID
router
	.route('/:id')
	.get(validateMiddleware(bookValidation.getBook), bookController.getBook)
	.patch(validateMiddleware(bookValidation.updateBook), bookController.updateBook)
	.delete(validateMiddleware(bookValidation.deleteBook), bookController.deleteBook)
	.all(errorController.methods(['GET', 'PATCH', 'DELETE']));

// PUT  - Like a book by its ID
// DELETE - Remove like for a book by its ID
router
	.route('/:id/like')
	.put(validateMiddleware(bookValidation.getBook), bookController.likeBook)
	.delete(validateMiddleware(bookValidation.getBook), bookController.unlikeBook)
	.all(errorController.methods(['PUT', 'DELETE']));

module.exports = router;
