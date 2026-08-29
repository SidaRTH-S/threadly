const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    // Check that content was sent
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    // Find the post
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Find parent comment if this is a reply
    let parent = null;

    if (parentComment) {
      parent = await Comment.findOne({
        _id: parentComment,
        post: post._id,
      });

      if (!parent) {
        return res.status(404).json({
          message: "Parent comment not found",
        });
      }
    }

    // Create the comment
    const comment = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      post: post._id,
      parentComment: parentComment || null,
    });

    // Increase the post's comment count
    post.commentCount += 1;

    await post.save();

    // -----------------------------
    // CREATE NOTIFICATION
    // -----------------------------

    // If this is a reply
    if (parent) {
      // Don't notify yourself
      if (
        parent.author.toString() !==
        req.user._id.toString()
      ) {
        await Notification.create({
          recipient: parent.author,
          sender: req.user._id,
          type: "comment_reply",
          post: post._id,
          comment: comment._id,
          message: "Someone replied to your comment",
        });
      }
    }

    // If this is a top-level comment
    else {
      // Don't notify yourself
      if (
        post.author.toString() !==
        req.user._id.toString()
      ) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: "post_comment",
          post: post._id,
          comment: comment._id,
          message: "Someone commented on your post",
        });
      }
    }

    // Add author information to response
    await comment.populate(
      "author",
      "username avatar"
    );

    return res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error(
      "Create comment error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        message:
          "Invalid post ID or comment ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCommentsByPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comments = await Comment.find({
      post: post._id,
    })
      .populate("author", "username avatar")
      .sort({ createdAt: 1 })
      .lean();

    // Find current user's ID if logged in
    const userId = req.user
      ? req.user._id.toString()
      : null;

    const commentMap = new Map();

    comments.forEach((comment) => {
      comment.replies = [];

      if (userId) {
        const hasUpvoted = comment.upvotes.some(
          (id) => id.toString() === userId
        );

        const hasDownvoted = comment.downvotes.some(
          (id) => id.toString() === userId
        );

        if (hasUpvoted) {
          comment.userVote = "upvote";
        } else if (hasDownvoted) {
          comment.userVote = "downvote";
        } else {
          comment.userVote = null;
        }
      } else {
        comment.userVote = null;
      }

      commentMap.set(
        comment._id.toString(),
        comment
      );
    });

    const nestedComments = [];

    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parentComment =
          commentMap.get(
            comment.parentComment.toString()
          );

        if (parentComment) {
          parentComment.replies.push(comment);
        }
      } else {
        nestedComments.push(comment);
      }
    });

    return res.status(200).json({
      count: comments.length,
      topLevelCount: nestedComments.length,
      comments: nestedComments,
    });
  } catch (error) {
    console.error(
      "Get comments error:",
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

const upvoteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const userId = req.user._id.toString();

    const hasUpvoted = comment.upvotes.some(
      (voteUserId) => voteUserId.toString() === userId
    );

    const hasDownvoted = comment.downvotes.some(
      (voteUserId) => voteUserId.toString() === userId
    );

    // Clicking upvote again removes the upvote
    if (hasUpvoted) {
      comment.upvotes = comment.upvotes.filter(
        (voteUserId) => voteUserId.toString() !== userId
      );

      comment.score -= 1;

      await comment.save();
      const existingNotification =
        await Notification.findOne({
          recipient: comment.author,
          sender: req.user._id,
          type: "comment_upvote",
          comment: comment._id,
        });

      if (
        comment.author.toString() !==
          req.user._id.toString() &&
        !existingNotification
      ) {
        await Notification.create({
          recipient: comment.author,
          sender: req.user._id,
          type: "comment_upvote",
          post: comment.post,
          comment: comment._id,
          message: "Someone upvoted your comment",
        });
      }

      return res.status(200).json({
        message: "Comment upvote removed",
        score: comment.score,
        userVote: null,
      });
    }

    // Remove an existing downvote before adding the upvote
    if (hasDownvoted) {
      comment.downvotes = comment.downvotes.filter(
        (voteUserId) => voteUserId.toString() !== userId
      );

      comment.score += 1;
    }

    // Add the upvote
    comment.upvotes.push(req.user._id);

    comment.score += 1;

    await comment.save();

    return res.status(200).json({
      message: "Comment upvoted successfully",
      score: comment.score,
      userVote: "upvote",
    });
  } catch (error) {
    console.error("Upvote comment error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const downvoteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const userId = req.user._id.toString();

    const hasUpvoted = comment.upvotes.some(
      (voteUserId) => voteUserId.toString() === userId
    );

    const hasDownvoted = comment.downvotes.some(
      (voteUserId) => voteUserId.toString() === userId
    );

    // Clicking downvote again removes the downvote
    if (hasDownvoted) {
      comment.downvotes = comment.downvotes.filter(
        (voteUserId) => voteUserId.toString() !== userId
      );

      comment.score += 1;

      await comment.save();

      return res.status(200).json({
        message: "Comment downvote removed",
        score: comment.score,
        userVote: null,
      });
    }

    // Remove an existing upvote before adding the downvote
    if (hasUpvoted) {
      comment.upvotes = comment.upvotes.filter(
        (voteUserId) => voteUserId.toString() !== userId
      );

      comment.score -= 1;
    }

    // Add the downvote
    comment.downvotes.push(req.user._id);

    comment.score -= 1;

    await comment.save();

    return res.status(200).json({
      message: "Comment downvoted successfully",
      score: comment.score,
      userVote: "downvote",
    });
  } catch (error) {
    console.error("Downvote comment error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Only the comment author can edit it
    if (
      comment.author.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to edit this comment",
      });
    }

    // Validate the new content
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment content cannot be empty",
      });
    }

    comment.content = content.trim();

    await comment.save();

    await comment.populate(
      "author",
      "username avatar"
    );

    return res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Update comment error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Only the comment author can delete it
    if (
      comment.author.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to delete this comment",
      });
    }

    // Delete this comment and every nested reply below it
    const commentsToDelete = [comment._id];

    let currentLevel = [comment._id];

    while (currentLevel.length > 0) {
      const childComments = await Comment.find({
        parentComment: {
          $in: currentLevel,
        },
      }).select("_id");

      const childIds = childComments.map(
        (child) => child._id
      );

      commentsToDelete.push(...childIds);

      currentLevel = childIds;
    }

    // Delete the complete comment subtree
    await Comment.deleteMany({
      _id: {
        $in: commentsToDelete,
      },
    });

    // Decrease the post's comment count
    await Post.findByIdAndUpdate(
      comment.post,
      {
        $inc: {
          commentCount: -commentsToDelete.length,
        },
      }
    );

    return res.status(200).json({
      message: "Comment and its replies deleted successfully",
      deletedCount: commentsToDelete.length,
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  upvoteComment,
  downvoteComment,
  updateComment,
  deleteComment,
};