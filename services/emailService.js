const transporter = require('../config/email');

const sendApplicationEmail = async (email, name, referralCode) => {
  const mailOptions = {
    from: '"Sownmark Team" <hello@sownmark.com>',
    to: email,
    subject: 'Application Confirmation',
    html: `
      <h2>Thank You for Your Application!</h2>
      <p>Hello ${name},</p>
      <p>Your application for the digital marketing course has been received!</p>
      <p>Your unique referral code is: <strong>${referralCode}</strong></p>
      <p>Share this code with friends to refer them.</p>
      <p>Best regards,<br>Sownmark Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Application email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending application email to ${email}:`, error);
    throw new Error('Failed to send application email');
  }
};

const sendSubscriptionEmail = async (email) => {
  const unsubscribeLink = `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: '"Sownmark Newsletter" <hello@sownmark.com>',
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
    from: '"Sownmark Newsletter" <hello@sownmark.com>',
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

module.exports = { sendApplicationEmail, sendSubscriptionEmail, sendUnsubscriptionEmail };