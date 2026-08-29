const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications =
      await Notification.find({
        recipient: req.user._id,
      })
        .populate(
          "sender",
          "username avatar"
        )
        .populate(
          "post",
          "title"
        )
        .populate(
          "comment",
          "content"
        )
        .sort({ createdAt: -1 });

    return res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    notification.read = true;

    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    return res.status(200).json({
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
