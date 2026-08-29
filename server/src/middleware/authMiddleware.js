const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    if (!authorizationHeader) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check the expected format:
    // Authorization: Bearer TOKEN
    const tokenParts = authorizationHeader.split(" ");

    if (
      tokenParts.length !== 2 ||
      tokenParts[0] !== "Bearer"
    ) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    const token = tokenParts[1];

    // Verify the JWT
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find the user whose ID is stored in the JWT
    const user = await User.findById(decodedToken.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    // Attach the logged-in user to the request
    req.user = user;

    // Continue to the protected route
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token = continue as guest
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // IMPORTANT:
      // Your JWT stores the user ID as userId
      const user = await User.findById(
        decoded.userId
      ).select("-password");

      if (user) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (error) {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error(
      "Optional auth error:",
      error
    );

    req.user = null;
    next();
  }
};



module.exports = {
  protect,
  optionalProtect,
};