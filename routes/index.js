const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('$/routes/userRoutes');
const bookRoutes = require('$/routes/bookRoutes');
const adminRoutes = require('$/routes/adminRoutes');

const constants = require('$/config/constants');

const router = express.Router();

// Health route
router.get('/api/v1/status', (req, res) =>
	res.json({ status: constants.MONGO_STATES[mongoose.connection.readyState] }),
);

// User routes
router.use('/api/v1/users', userRoutes);

// Books routes
router.use('/api/v1/books', bookRoutes);

// Admin routes
router.use('/api/v1/admin', adminRoutes);

module.exports = router;
