require("dotenv").config();

const {
  sendVerificationOTP,
} = require("./services/emailService");

const test = async () => {
  try {
    await sendVerificationOTP(
      "therulerg00d@gmail.com",
      "g00d_UareALSO"
    );
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email error:", error);
  }
};

test();