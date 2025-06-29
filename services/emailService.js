const transporter = require('../config/email');

const sendSubscriptionEmail = async (email) => {
  const unsubscribeLink = `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: '"Sownmark Newsletter" <hello@sownmark.com>', // Custom from address
    to: email,
    subject: 'Welcome to Sownmark Newsletter!',
    html: `
      <h2>Thank You for Subscribing!</h2>
      <p>You’ve successfully subscribed to the Sownmark Newsletter. Get ready for the latest insights delivered to your inbox!</p>
      <p>If you wish to unsubscribe, click <a href="${unsubscribeLink}">here</a>.</p>
      <p>Best regards,<br>Sownmark Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Subscription email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending subscription email to ${email}:`, error);
    throw new Error('Failed to send subscription email');
  }
};

const sendUnsubscriptionEmail = async (email) => {
  const mailOptions = {
    from: '"Sownmark Newsletter" <hello@sownmark.com>', // Custom from address
    to: email,
    subject: 'You’ve Unsubscribed from Sownmark Newsletter',
    html: `
      <h2>Unsubscription Confirmed</h2>
      <p>You’ve successfully unsubscribed from the Sownmark Newsletter. We’re sorry to see you go!</p>
      <p>If this was a mistake, you can <a href="${process.env.FRONTEND_URL}/newsletter">re-subscribe here</a>.</p>
      <p>Best regards,<br>Sownmark Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Unsubscription email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending unsubscription email to ${email}:`, error);
    throw new Error('Failed to send unsubscription email');
  }
};

module.exports = { sendSubscriptionEmail, sendUnsubscriptionEmail };