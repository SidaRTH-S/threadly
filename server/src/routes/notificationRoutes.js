const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  getNotifications
);

router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

module.exports = router;
