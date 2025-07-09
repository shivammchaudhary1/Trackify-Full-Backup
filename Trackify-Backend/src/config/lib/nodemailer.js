const nodemailer = require("nodemailer");
const { config } = require("../env/default");

// const transporter = nodemailer.createTransport({
//   host: "trackify.ai",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "support@trackify.ai",
//     pass: "support@trackify.ai",
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
//   connectionTimeout: 10000,
// });

const transporter = nodemailer.createTransport({
  host: config.ses.host,
  port: 465,
  secure: true,
  auth: {
    user: config.ses.userName,
    pass: config.ses.password
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: "support@trackify.ai",
      to,
      subject,
      html,
    };

    // Sending the  email with timeout handling
    await transporter.sendMail(mailOptions);
    return null;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Email sending failed: " + error.message);
  }
};

module.exports = { sendEmail };
