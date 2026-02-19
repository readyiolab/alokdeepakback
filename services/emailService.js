const transporter = require('../config/email');

const sendApplicationEmail = async (email, name, referralCode) => {
  const mailOptions = {
    from: '"Sownmark Team" <hello@sownmark.com>',
    to: email,
    subject: 'Sownmark Digital Marketing Course - Application Confirmation',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #0073b1;
            padding: 20px;
            text-align: center;
          }
          .header img {
            max-width: 150px;
          }
          .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
          }
          .content h2 {
            color: #0073b1;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content p {
            margin: 10px 0;
            font-size: 16px;
          }
          .referral-code {
            background-color: #f8f8f8;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: #333333;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #0073b1;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            background-color: #f8f8f8;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666666;
          }
          .footer a {
            color: #0073b1;
            text-decoration: none;
            margin: 0 10px;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dbyjiqjui/image/upload/v1754482074/logo_pfc5lt.webp" alt="Sownmark Logo">
          </div>
          <div class="content">
            <h2>Thank You for Your Application!</h2>
            <p>Hello ${name},</p>
            <p>We’re excited to confirm that your application for the Sownmark Digital Marketing Course has been successfully received!</p>
            <p>Your unique referral code is:</p>
            <div class="referral-code">${referralCode}</div>
            <p>Share this code with friends to refer them to the course and help them kickstart their digital marketing journey.</p>
            <a href="https://www.sownmark.com/referral-program" class="cta-button">Learn More About Referrals</a>
            <p>We’ll be in touch soon with the next steps. If you have any questions, feel free to reach out to us at <a href="mailto:support@sownmark.com">support@sownmark.com</a>.</p>
            <p>Best regards,<br>The Sownmark Team</p>
          </div>
          <div class="footer">
            <p>Follow us on social media:</p>
            <a href="https://www.linkedin.com/company/sownmark/posts/?feedView=all">LinkedIn</a> |
            <a href="https://www.instagram.com/sownmarkofficial/">Instagram</a>
            <p>&copy; 2025 Sownmark. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Application email sent to ${email}`);
    return { success: true, message: `Application email sent to ${email}` };
  } catch (error) {
    console.error(`Error sending application email to ${email}:`, error);
    throw new Error(`Failed to send application email: ${error.message}`);
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