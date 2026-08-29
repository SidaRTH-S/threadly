const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationOTP = async (
  email,
  otp
) => {
  await transporter.sendMail({
    from: `"Threadly" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Threadly Email Verification",
    text: `Your Threadly verification OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div>
        <h2>Welcome to Threadly</h2>

        <p>
          Your email verification code is:
        </p>

        <h1>${otp}</h1>

        <p>
          This OTP expires in 10 minutes.
        </p>

        <p>
          If you did not create a Threadly account,
          you can ignore this email.
        </p>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationOTP,
};