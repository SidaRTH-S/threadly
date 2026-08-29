const crypto = require("crypto");

const {
  sendVerificationOTP,
} = require("../services/emailService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    // Clean input
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check username already exists
    const existingUsername = await User.findOne({
      username: cleanUsername,
    });

    if (existingUsername) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    // Check email already exists
    const existingEmail = await User.findOne({
      email: cleanEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Generate 6-digit OTP
    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // OTP expires in 10 minutes
    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Create user
    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,

      emailVerified: false,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: otpExpires,
    });

    // Send OTP email
    await sendVerificationOTP(
      user.email,
      otp
    );

    return res.status(201).json({
      message:
        "Registration successful. Please verify your email.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check whether both fields were sent
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find the user using the email
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    // Do not reveal whether the email exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }


    // Compare the entered password with the stored hash
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create a JWT token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    // Send the token and safe user information
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        karma: user.karma,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    if (
      !user.emailVerificationOTP ||
      !user.emailVerificationOTPExpires
    ) {
      return res.status(400).json({
        message: "No verification OTP found",
      });
    }

    if (
      user.emailVerificationOTPExpires <
      new Date()
    ) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.emailVerified = true;

    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(
      "Verify email error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    // Generate new 6-digit OTP
    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // New OTP expires in 10 minutes
    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = otpExpires;

    await user.save();

    // Send new OTP
    await sendVerificationOTP(
      user.email,
      otp
    );

    return res.status(200).json({
      message: "A new OTP has been sent to your email",
    });

  } catch (error) {
    console.error("Resend OTP error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendOTP,
};
