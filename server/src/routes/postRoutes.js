const express = require("express");

const {
  createPost,
  getPosts,
  getPostById,
  getPostsByCommunity,
  upvotePost,
  downvotePost,
  updatePost,
  deletePost,
  savePost,
  unsavePost,
  getSavedPosts,
} = require("../controllers/postController");

const {
  protect,
  optionalProtect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", 
  optionalProtect,
  getPosts,
);

router.get(
  "/community/:name",
  optionalProtect,
  getPostsByCommunity,
);

router.get("/:id", 
  optionalProtect,
  getPostById,
);

// Protected routes
router.post("/", protect, createPost);

router.post(
  "/:id/upvote",
  protect,
  upvotePost
);

router.post(
  "/:id/downvote",
  protect,
  downvotePost
);

router.put(
  "/:id",
  protect,
  updatePost
);

router.delete(
  "/:id",
  protect,
  deletePost
);

router.post(
  "/:id/save",
  protect,
  savePost
);

router.post(
  "/:id/unsave",
  protect,
  unsavePost
);

router.get(
  "/me/saved",
  protect,
  getSavedPosts
);




module.exports = router;