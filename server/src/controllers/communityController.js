const Community = require("../models/Community");
const User = require("../models/User");

const createCommunity = async (req, res) => {
  try {
    const { name, displayName, description } = req.body;

    // Check required fields
    if (!name || !displayName) {
      return res.status(400).json({
        message: "Community name and display name are required",
      });
    }

    // Clean the community name
    const formattedName = name.trim().toLowerCase();

    // Check whether the community already exists
    const existingCommunity = await Community.findOne({
      name: formattedName,
    });

    if (existingCommunity) {
      return res.status(409).json({
        message: "A community with this name already exists",
      });
    }

    // Create the community
    const community = await Community.create({
      name: formattedName,
      displayName: displayName.trim(),
      description: description ? description.trim() : "",
      owner: req.user._id,
      members: [req.user._id],
      memberCount: 1,
    });

    // Add community to the owner's joined communities
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        joinedCommunities: community._id,
      },
    });

    return res.status(201).json({
      message: "Community created successfully",
      community,
    });
  } catch (error) {
    console.error("Create community error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("owner", "username avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: communities.length,
      communities,
    });
  } catch (error) {
    console.error("Get communities error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCommunityByName = async (req, res) => {
  try {
    const communityName = req.params.name
      .trim()
      .toLowerCase();

    const community = await Community.findOne({
      name: communityName,
    }).populate("owner", "username avatar");

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    return res.status(200).json({
      community,
    });
  } catch (error) {
    console.error("Get community error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const joinCommunity = async (req, res) => {
  try {
    const communityName = req.params.name.trim().toLowerCase();

    const community = await Community.findOne({
      name: communityName,
    });

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    const userId = req.user._id;

    // Check whether the user is already a member
    const isAlreadyMember = community.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (isAlreadyMember) {
      return res.status(409).json({
        message: "You are already a member of this community",
      });
    }

    // Add the logged-in user
    community.members.push(userId);

    await community.save();

    return res.status(200).json({
      message: "Joined community successfully",
      memberCount: community.members.length,
      community,
    });
  } catch (error) {
    console.error("Join community error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const leaveCommunity = async (req, res) => {
  try {
    const communityName = req.params.name.trim().toLowerCase();

    const community = await Community.findOne({
      name: communityName,
    });

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    const userId = req.user._id;

    // Check whether the user is a member
    const isMember = community.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(400).json({
        message: "You are not a member of this community",
      });
    }

    // Do not allow the owner to leave for now
    if (community.owner.toString() === userId.toString()) {
      return res.status(400).json({
        message:
          "The community owner cannot leave the community",
      });
    }

    // Remove the logged-in user from members
    community.members = community.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );

    await community.save();

    return res.status(200).json({
      message: "Left community successfully",
      memberCount: community.members.length,
      community,
    });
  } catch (error) {
    console.error("Leave community error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createCommunity,
  getCommunities,
  getCommunityByName,
  joinCommunity,
  leaveCommunity,
};