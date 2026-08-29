const express = require("express");

const {
  getMe,
  getUserProfile,
  getUserPosts,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
} = require("../controllers/userController");

const { protect,optionalProtect } = require("../middleware/authMiddleware");

const router = express.Router();

// Logged-in user's profile
router.get("/me", protect, getMe);

// Public user's posts
router.get("/:username/posts", getUserPosts);

// Public user profile
router.get("/:username", 
  optionalProtect,
  getUserProfile
);

router.put("/me", protect, updateProfile);

//follow mechanix
router.post(
  "/:id/follow",
  protect,
  followUser
);

router.post(
  "/:id/unfollow",
  protect,
  unfollowUser
);

router.get(
  "/me/following",
  protect,
  getFollowing
);

router.get(
  "/me/followers",
  protect,
  getFollowers
);

module.exports = router;