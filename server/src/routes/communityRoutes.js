const express = require("express");

const {
  createCommunity,
  getCommunities,
  getCommunityByName,
  joinCommunity,
  leaveCommunity,
} = require("../controllers/communityController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getCommunities);
router.get("/:name", getCommunityByName);

// Protected routes
router.post("/", protect, createCommunity);

router.post("/:name/join", protect, joinCommunity);

router.delete("/:name/leave", protect, leaveCommunity);

module.exports = router;