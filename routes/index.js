const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('$/routes/userRoutes');
const bookRoutes = require('$/routes/bookRoutes');
const adminRoutes = require('$/routes/adminRoutes');

const constants = require('$/config/constants');

// const app = express();
const router = express.Router();

// Test routes
router.get('/status', (req, res) => res.json({ status: constants.MONGO_STATES[mongoose.connection.readyState] }));

// Routes
router.use('/api/v1/users', userRoutes);

// Sample route
router.use('/api/v1/books', bookRoutes);

// Admin route
router.use('/api/v1/admin', adminRoutes);

module.exports = router;
