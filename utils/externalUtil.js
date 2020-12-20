const sgMail = require('@sendgrid/mail');
const httpResponse = require('http-status');

const { ErrorHandler } = require('$/utils/errorHandler');

exports.sendEmail = (recipientEmail, name, otp) => {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
		throw new ErrorHandler(httpResponse.INTERNAL_SERVER_ERROR, 'Error sending email');
	}
};
