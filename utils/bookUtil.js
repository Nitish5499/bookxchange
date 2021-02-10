const mongoose = require('mongoose');

/*
 * To create a notification object.
 * userId - user who has liked the book.
 * message - the notification text to be added in the database.
 */
exports.createNotification = (message, userId) => {
	return {
		text: message,
		userId: mongoose.Types.ObjectId(userId),
		isRead: false,
		timestamp: new Date(),
	};
};

exports.notificationMessage = (userName, bookName, email, scenario) => {
	if (scenario === 'like') {
		return `${userName} liked your book, ${bookName}`;
	}
	if (scenario === 'unlike') {
		return `${userName} un-liked your book, ${bookName}`;
	}
	if (scenario === 'match') {
		return `It is a match! ${userName}(${email}) and you can now exchange book(s)`;
	}
};
