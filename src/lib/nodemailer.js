const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.HOST_MAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const SendMail = async (emailTemplate, email, subject) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.HOST_MAIL,
      to: email,
      subject: subject,
      html: emailTemplate,
    });

    return info.messageId;
  } catch (error) {
    console.log(`error from sending mail: ${error}`);
  }
};

module.exports = { SendMail };
