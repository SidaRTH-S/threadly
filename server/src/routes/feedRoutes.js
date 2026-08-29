const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  getFeed,
} = require("../controllers/feedController");

const router = express.Router();

router.get("/", protect, getFeed);

module.exports = router;