const nodemailer = require("nodemailer");
const { smtpHost, smtpPort, smtpUser, smtpPass } = require("../config/dotenvconfg");

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false, // Use SSL
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mail Transporter Error:", error);
  } else {
    console.log("✅ Mail Transporter Ready");
  }
});

module.exports = transporter;
