const User = require("../models/User");
const Post = require("../models/Post");

// Get the currently logged-in user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get a public user profile by username
const getUserProfile = async (req, res) => {
  try {
    const username = req.params.username
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      username,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const postCount = await Post.countDocuments({
      author: user._id,
    });

    let isFollowing = false;

    if (req.user) {
      isFollowing = user.followers.some(
        (followerId) =>
          followerId.toString() ===
          req.user._id.toString()
      );
    }

    return res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        karma: user.karma,
        createdAt: user.createdAt,
        postCount,
        followerCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing,
      },
    });
  } catch (error) {
    console.error(
      "Get user profile error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
// Get all posts created by a user
const getUserPosts = async (req, res) => {
  try {
    const username = req.params.username
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      username,
    }).select("_id username");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const posts = await Post.find({
      author: user._id,
    })
      .populate(
        "author",
        "username avatar"
      )
      .populate(
        "community",
        "name displayName"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      username: user.username,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get user posts error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update username
    if (username !== undefined) {
      const trimmedUsername = username.trim().toLowerCase();

      if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
        return res.status(400).json({
          message: "Username must be between 3 and 30 characters",
        });
      }

      const existingUser = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Username already exists",
        });
      }

      user.username = trimmedUsername;
    }

    // Update bio
    if (bio !== undefined) {
      if (bio.length > 300) {
        return res.status(400).json({
          message: "Bio cannot exceed 300 characters",
        });
      }

      user.bio = bio.trim();
    }

    // Update avatar
    if (avatar !== undefined) {
      user.avatar = avatar.trim();
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        karma: user.karma,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    // Don't allow following yourself
    if (
      targetUserId.toString() ===
      currentUserId.toString()
    ) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const targetUser = await User.findById(
      targetUserId
    );

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const currentUser = await User.findById(
      currentUserId
    );

    // Check if already following
    const alreadyFollowing =
      currentUser.following.some(
        (id) =>
          id.toString() ===
          targetUserId.toString()
      );

    if (alreadyFollowing) {
      return res.status(409).json({
        message: "You are already following this user",
      });
    }

    // Add target to following
    currentUser.following.push(
      targetUser._id
    );

    // Add current user to target's followers
    targetUser.followers.push(
      currentUser._id
    );

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      message: "User followed successfully",
    });
  } catch (error) {
    console.error("Follow user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(
      targetUserId
    );

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const currentUser = await User.findById(
      currentUserId
    );

    const isFollowing =
      currentUser.following.some(
        (id) =>
          id.toString() ===
          targetUserId.toString()
      );

    if (!isFollowing) {
      return res.status(400).json({
        message: "You are not following this user",
      });
    }

    currentUser.following =
      currentUser.following.filter(
        (id) =>
          id.toString() !==
          targetUserId.toString()
      );

    targetUser.followers =
      targetUser.followers.filter(
        (id) =>
          id.toString() !==
          currentUserId.toString()
      );

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.error(
      "Unfollow user error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    )
      .select("following")
      .populate(
        "following",
        "username avatar bio karma"
      );

    return res.status(200).json({
      count: user.following.length,
      users: user.following,
    });
  } catch (error) {
    console.error(
      "Get following error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    )
      .select("followers")
      .populate(
        "followers",
        "username avatar bio karma"
      );

    return res.status(200).json({
      count: user.followers.length,
      users: user.followers,
    });
  } catch (error) {
    console.error(
      "Get followers error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
module.exports = {
  getMe,
  getUserProfile,
  getUserPosts,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
};