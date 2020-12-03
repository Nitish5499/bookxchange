const express = require('express');

const bookController = require('$/controllers/bookController');
const errorController = require('$/controllers/errorController');

const router = express.Router();

router.route('/').post(bookController.addBook).get(bookController.getAllBooks);

router
	.route('/:id')

	// Fetch a book by its ID
	.get(bookController.getBook)

	// Update a book by its ID
	.patch(bookController.updateBook)

	// Delete a book by its ID
	.delete(bookController.deleteBook)

	// Handles other /book requests
	.all(errorController.methods(['GET', 'PATCH', 'DELETE']));

module.exports = router;
