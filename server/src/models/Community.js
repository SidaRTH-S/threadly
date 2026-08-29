const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    icon: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
      default: "",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    memberCount: {
        type: Number,
        default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Community = mongoose.model(
  "Community",
  communitySchema
);

module.exports = Community;
