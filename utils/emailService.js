const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // This should be an app-specific password
    }
});

/**
 * Send event registration confirmation email
 * @param {string} recipientEmail - Recipient's email address
 * @param {Object} eventDetails - Event details
 * @returns {Promise} - Email sending response
 */
const sendEventConfirmationEmail = async (recipientEmail, eventDetails) => {
    try {
        const emailContent = `
            <h1>Event Registration Confirmation</h1>
            <p>Thank you for registering for "${eventDetails.name}"!</p>
            
            <h2>Event Details:</h2>
            <ul>
                <li><strong>Date:</strong> ${new Date(eventDetails.date).toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${eventDetails.startTime}</li>
                <li><strong>Venue:</strong> ${eventDetails.eventType === 'Online' ? 'Online Event' : eventDetails.venue}</li>
                ${eventDetails.onlineLink ? `<li><strong>Online Link:</strong> ${eventDetails.onlineLink}</li>` : ''}
            </ul>

            <h2>Organizer Information:</h2>
            <ul>
                <li><strong>Name:</strong> ${eventDetails.organizerName}</li>
                <li><strong>Email:</strong> ${eventDetails.organizerEmail}</li>
                ${eventDetails.contactNumber ? `<li><strong>Contact:</strong> ${eventDetails.contactNumber}</li>` : ''}
            </ul>

            <p>We look forward to seeing you at the event!</p>
            
            <p><small>This is an automated email. Please do not reply.</small></p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: `Registration Confirmed: ${eventDetails.name}`,
            html: emailContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendEventConfirmationEmail
}; 