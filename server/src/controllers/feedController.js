const User = require("../models/User");
const Post = require("../models/Post");

const getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("joinedCommunities");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // -----------------------------
    // Pagination
    // -----------------------------

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit) || 10,
        1
      ),
      50
    );

    const skip = (page - 1) * limit;

    // -----------------------------
    // Sorting
    // -----------------------------

    const sort = req.query.sort || "new";

    if (!["new", "top", "hot"].includes(sort)) {
      return res.status(400).json({
        message:
          "Invalid sort. Use new, top, or hot",
      });
    }

    // -----------------------------
    // No joined communities
    // -----------------------------

    if (user.joinedCommunities.length === 0) {
      return res.status(200).json({
        page,
        limit,
        sort,
        count: 0,
        totalPages: 0,
        posts: [],
      });
    }

    // -----------------------------
    // Build query
    // -----------------------------

    const query = {
      community: {
        $in: user.joinedCommunities,
      },
    };

    // -----------------------------
    // NEW
    // -----------------------------

    if (sort === "new") {
      const totalPosts = await Post.countDocuments(
        query
      );

      const posts = await Post.find(query)
        .populate(
          "author",
          "username avatar"
        )
        .populate(
          "community",
          "name displayName icon"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit);

      return res.status(200).json({
        page,
        limit,
        sort,
        count: posts.length,
        totalPosts,
        totalPages: Math.ceil(
          totalPosts / limit
        ),
        posts,
      });
    }

    // -----------------------------
    // TOP
    // -----------------------------

    if (sort === "top") {
      const totalPosts = await Post.countDocuments(
        query
      );

      const posts = await Post.find(query)
        .populate(
          "author",
          "username avatar"
        )
        .populate(
          "community",
          "name displayName icon"
        )
        .sort({
          score: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit);

      return res.status(200).json({
        page,
        limit,
        sort,
        count: posts.length,
        totalPosts,
        totalPages: Math.ceil(
          totalPosts / limit
        ),
        posts,
      });
    }

    // -----------------------------
    // HOT
    // -----------------------------

    const posts = await Post.find(query)
      .populate(
        "author",
        "username avatar"
      )
      .populate(
        "community",
        "name displayName icon"
      );

    const now = Date.now();

    const rankedPosts = posts
      .map((post) => {
        const ageInHours =
          (now -
            new Date(post.createdAt).getTime()) /
          (1000 * 60 * 60);

        // Prevent division by zero
        const age = Math.max(ageInHours, 1);

        const hotScore =
          (post.score + 1) /
          Math.pow(age + 2, 1.5);

        return {
          post,
          hotScore,
        };
      })
      .sort(
        (a, b) =>
          b.hotScore - a.hotScore
      );

    const totalPosts =
      rankedPosts.length;

    const paginatedPosts =
      rankedPosts
        .slice(skip, skip + limit)
        .map((item) => item.post);

    return res.status(200).json({
      page,
      limit,
      sort,
      count: paginatedPosts.length,
      totalPosts,
      totalPages: Math.ceil(
        totalPosts / limit
      ),
      posts: paginatedPosts,
    });
  } catch (error) {
    console.error(
      "Get feed error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getFeed,
};
