const Post = require("../models/Post");
const Community = require("../models/Community");
const User = require("../models/User");

const search = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    // Check search query
    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    if (query.length < 2) {
      return res.status(400).json({
        message: "Search query must be at least 2 characters",
      });
    }

    // Escape special regex characters
    const escapedQuery = query.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(
      escapedQuery,
      "i"
    );

    // Search posts
    const posts = await Post.find({
      $or: [
        { title: regex },
        { content: regex },
      ],
    })
      .populate("author", "username avatar")
      .populate(
        "community",
        "name displayName icon"
      )
      .sort({
        createdAt: -1,
      })
      .limit(20);

    // Search communities
    const communities = await Community.find({
      $or: [
        { name: regex },
        { displayName: regex },
        { description: regex },
      ],
    })
      .populate("owner", "username avatar")
      .sort({
        createdAt: -1,
      })
      .limit(20);

    // Search users
    const users = await User.find({
      $or: [
        { username: regex },
        { bio: regex },
      ],
    })
      .select(
        "username avatar bio karma createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(20);

    return res.status(200).json({
      query,
      results: {
        posts: {
          count: posts.length,
          items: posts,
        },

        communities: {
          count: communities.length,
          items: communities,
        },

        users: {
          count: users.length,
          items: users,
        },
      },
    });
  } catch (error) {
    console.error("Search error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  search,
};