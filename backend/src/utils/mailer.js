const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(to, sub, msg) {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: to,
      subject: sub,
      html: msg
    });
    console.log(`Email sent to ${to} with subject "${sub}"`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
/*
CHECKING IF THE MAILER WORKS
sendEmail("asmoairasara@gmail.com", "Test Subject", "<h1>This is a test email</h1>");
*/
module.exports = { sendEmail };
