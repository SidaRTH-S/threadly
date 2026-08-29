const express = require("express");

const {
  createComment,
  getCommentsByPost,
  upvoteComment,
  downvoteComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const {
  protect,
  optionalProtect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public route
router.get(
  "/post/:postId",
  optionalProtect,
  getCommentsByPost
);

// Create a comment or nested reply
router.post(
  "/post/:postId",
  protect,
  createComment
);

// Voting routes
router.post(
  "/:id/upvote",
  protect,
  upvoteComment
);

router.post(
  "/:id/downvote",
  protect,
  downvoteComment
);

// Edit a comment
router.put(
  "/:id",
  protect,
  updateComment
);

// Delete a comment and its nested replies
router.delete(
  "/:id",
  protect,
  deleteComment
);

module.exports = router;