const Post = require("../models/Post");
const Community = require("../models/Community");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Notification = require("../models/Notification");
const createPost = async (req, res) => {
  try {
    const {
      community,
      title,
      content,
      postType,
      linkUrl,
      imageUrl,
    } = req.body;

    // Validate required fields
    if (!community || !title) {
      return res.status(400).json({
        message: "Community and title are required",
      });
    }

    // Find the community using its name
    const communityDocument = await Community.findOne({
      name: community.trim().toLowerCase(),
    });

    if (!communityDocument) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    // Check whether the logged-in user is a member
    const isMember = communityDocument.members.some(
      (memberId) =>
        memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message:
          "You must join this community before creating a post",
      });
    }

    // Validate post type
    const allowedPostTypes = ["text", "link", "image"];

    const selectedPostType = postType || "text";

    if (!allowedPostTypes.includes(selectedPostType)) {
      return res.status(400).json({
        message:
          "Post type must be text, link, or image",
      });
    }

    // Additional validation for link posts
    if (selectedPostType === "link" && !linkUrl) {
      return res.status(400).json({
        message: "A link URL is required for a link post",
      });
    }

    // Additional validation for image posts
    if (selectedPostType === "image" && !imageUrl) {
      return res.status(400).json({
        message:
          "An image URL is required for an image post",
      });
    }

    // Create the post
    const post = await Post.create({
      title: title.trim(),
      content: content ? content.trim() : "",
      postType: selectedPostType,
      linkUrl: linkUrl ? linkUrl.trim() : "",
      imageUrl: imageUrl ? imageUrl.trim() : "",
      author: req.user._id,
      community: communityDocument._id,
    });

    // Populate author and community information
    await post.populate([
      {
        path: "author",
        select: "username avatar",
      },
      {
        path: "community",
        select: "name displayName",
      },
    ]);

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate(
        "author",
        "username avatar"
      )
      .populate(
        "community",
        "name displayName"
      )
      .sort({ createdAt: -1 })
      .lean();

    let savedPostIds = new Set();

    // If logged in, get their saved posts
    if (req.user) {
      const user = await User.findById(
        req.user._id
      ).select("savedPosts");

      if (user) {
        savedPostIds = new Set(
          user.savedPosts.map((id) =>
            id.toString()
          )
        );
      }
    }

    // Add saved + userVote information
    const postsWithState = posts.map(
      (post) => {
        const userId = req.user?._id?.toString();

        const hasUpvoted = userId
          ? post.upvotes.some(
              (id) =>
                id.toString() === userId
            )
          : false;

        const hasDownvoted = userId
          ? post.downvotes.some(
              (id) =>
                id.toString() === userId
            )
          : false;

        return {
          ...post,

          saved: savedPostIds.has(
            post._id.toString()
          ),

          userVote: hasUpvoted
            ? "upvote"
            : hasDownvoted
            ? "downvote"
            : null,
        };
      }
    );

    return res.status(200).json({
      count: postsWithState.length,
      posts: postsWithState,
    });
  } catch (error) {
    console.error(
      "Get posts error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate(
        "author",
        "username avatar"
      )
      .populate(
        "community",
        "name displayName"
      )
      .lean();

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    let saved = false;
    let userVote = null;

    // Check state only if user is logged in
    if (req.user) {
      const userId =
        req.user._id.toString();

      const user = await User.findById(
        req.user._id
      ).select("savedPosts");

      if (user) {
        saved = user.savedPosts.some(
          (postId) =>
            postId.toString() ===
            post._id.toString()
        );
      }

      const hasUpvoted =
        post.upvotes.some(
          (id) =>
            id.toString() === userId
        );

      const hasDownvoted =
        post.downvotes.some(
          (id) =>
            id.toString() === userId
        );

      userVote = hasUpvoted
        ? "upvote"
        : hasDownvoted
        ? "downvote"
        : null;
    }

    return res.status(200).json({
      post: {
        ...post,
        saved,
        userVote,
      },
    });
  } catch (error) {
    console.error(
      "Get post error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const getPostsByCommunity = async (req, res) => {
  try {
    const communityName = req.params.name
      .trim()
      .toLowerCase();

    const community = await Community.findOne({
      name: communityName,
    });

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    const posts = await Post.find({
      community: community._id,
    })
      .populate(
        "author",
        "username avatar"
      )
      .populate(
        "community",
        "name displayName"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Get saved posts for logged-in user
    let savedPostIds = new Set();

    if (req.user) {
      const user = await User.findById(
        req.user._id
      ).select("savedPosts");

      if (user) {
        savedPostIds = new Set(
          user.savedPosts.map((id) =>
            id.toString()
          )
        );
      }
    }

    const postsWithState = posts.map(
      (post) => {
        const userId =
          req.user?._id?.toString();

        const hasUpvoted = userId
          ? post.upvotes.some(
              (id) =>
                id.toString() === userId
            )
          : false;

        const hasDownvoted = userId
          ? post.downvotes.some(
              (id) =>
                id.toString() === userId
            )
          : false;

        return {
          ...post,

          saved: savedPostIds.has(
            post._id.toString()
          ),

          userVote: hasUpvoted
            ? "upvote"
            : hasDownvoted
            ? "downvote"
            : null,
        };
      }
    );

    return res.status(200).json({
      community: {
        name: community.name,
        displayName:
          community.displayName,
      },
      count: postsWithState.length,
      posts: postsWithState,
    });
  } catch (error) {
    console.error(
      "Get community posts error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const userId = req.user._id.toString();

    const hasUpvoted = post.upvotes.some(
      (voteUserId) => voteUserId.toString() === userId
    );

    const hasDownvoted = post.downvotes.some(
      (voteUserId) => voteUserId.toString() === userId
    );

    // Clicking upvote again removes the upvote
    if (hasUpvoted) {
      post.upvotes = post.upvotes.filter(
        (voteUserId) => voteUserId.toString() !== userId
      );

      post.score -= 1;

      await post.save();
      
      const existingNotification =
        await Notification.findOne({
          recipient: post.author,
          sender: req.user._id,
          type: "post_upvote",
          post: post._id,
        });

      if (
        post.author.toString() !==
          req.user._id.toString() &&
        !existingNotification
      ) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: "post_upvote",
          post: post._id,
          message: "Someone upvoted your post",
        });
      }

      return res.status(200).json({
        message: "Upvote removed",
        score: post.score,
        userVote: null,
      });
    }

    // If the user had downvoted, remove that downvote first
    if (hasDownvoted) {
      post.downvotes = post.downvotes.filter(
        (voteUserId) => voteUserId.toString() !== userId
      );

      post.score += 1;
    }

    // Add the upvote
    post.upvotes.push(req.user._id);

    post.score += 1;

    await post.save();

    return res.status(200).json({
      message: "Post upvoted successfully",
      score: post.score,
      userVote: "upvote",
    });
  } catch (error) {
    console.error("Upvote post error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const downvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const userId = req.user._id.toString();

    const hasUpvoted = post.upvotes.some(
      (voteUserId) => voteUserId.toString() === userId
    );

    const hasDownvoted = post.downvotes.some(
      (voteUserId) => voteUserId.toString() === userId
    );

    // Clicking downvote again removes the downvote
    if (hasDownvoted) {
      post.downvotes = post.downvotes.filter(
        (voteUserId) => voteUserId.toString() !== userId
      );

      post.score += 1;

      await post.save();

      return res.status(200).json({
        message: "Downvote removed",
        score: post.score,
        userVote: null,
      });
    }

    // If the user had upvoted, remove that upvote first
    if (hasUpvoted) {
      post.upvotes = post.upvotes.filter(
        (voteUserId) => voteUserId.toString() !== userId
      );

      post.score -= 1;
    }

    // Add the downvote
    post.downvotes.push(req.user._id);

    post.score -= 1;

    await post.save();

    return res.status(200).json({
      message: "Post downvoted successfully",
      score: post.score,
      userVote: "downvote",
    });
  } catch (error) {
    console.error("Downvote post error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Only the post author can edit the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to edit this post",
      });
    }

    // Update only the fields that were provided
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Post title cannot be empty",
        });
      }

      post.title = title.trim();
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({
          message: "Post content cannot be empty",
        });
      }

      post.content = content.trim();
    }

    await post.save();

    await post.populate(
      "author",
      "username avatar"
    );

    await post.populate(
      "community",
      "name displayName"
    );

    return res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Only the post author can delete the post
    if (
      post.author.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to delete this post",
      });
    }

    // Delete every comment belonging to this post
    const deletedComments = await Comment.deleteMany({
      post: post._id,
    });

    // Delete the post
    await post.deleteOne();

    return res.status(200).json({
      message: "Post and all its comments deleted successfully",
      deletedCommentCount: deletedComments.deletedCount,
    });
  } catch (error) {
    console.error("Delete post error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const savePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        savedPosts: post._id,
      },
    });

    return res.status(200).json({
      message: "Post saved successfully",
      postId: post._id,
    });
  } catch (error) {
    console.error("Save post error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const unsavePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        savedPosts: post._id,
      },
    });

    return res.status(200).json({
      message: "Post unsaved successfully",
      postId: post._id,
    });
  } catch (error) {
    console.error("Unsave post error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("savedPosts")
      .populate({
        path: "savedPosts",
        populate: [
          {
            path: "author",
            select: "username avatar",
          },
          {
            path: "community",
            select: "name displayName icon",
          },
        ],
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      count: user.savedPosts.length,
      posts: user.savedPosts,
    });
  } catch (error) {
    console.error("Get saved posts error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
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
};