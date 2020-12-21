const express = require('express');

const adminController = require('$/controllers/adminController');
const errorController = require('$/controllers/errorController');

const router = express.Router();

// GET  - Populate the dev env with dummy data
router
	.route('/populate')
	.get(adminController.populate)
	.all(errorController.methods(['GET']));

// GET  - Purge the tables in dev env
router
	.route('/purge')
	.get(adminController.purge)
	.all(errorController.methods(['GET']));

module.exports = router;
