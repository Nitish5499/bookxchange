const sgMail = require('@sendgrid/mail');
const { ErrorHandler } = require('$/utils/errorHandler');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = (recipientEmail, name, otp) => {
	const msg = {
		to: recipientEmail,
		from: process.env.BXC_EMAIL_ACCOUNT,
		templateId: process.env.SENDGRID_TEMPLATE_ID,
		dynamicTemplateData: {
			name,
			otp,
		},
	};

	try {
		return sgMail.send(msg);
	} catch (err) {
		throw new ErrorHandler(500, 'Error sending email');
	}
};

exports.getOTP = () => {
	return Math.floor(100000 + Math.random() * 900000);
};
