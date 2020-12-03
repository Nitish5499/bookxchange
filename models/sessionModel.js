const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	sessionToken: {
		type: String,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: process.env.JWT_SESSION_DB_TTL });

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
