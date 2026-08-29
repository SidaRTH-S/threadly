import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";

const Notifications = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getNotifications(token);

      setNotifications(
        data.notifications || []
      );
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadNotifications();
    }
  }, [token]);

  const handleNotificationClick = async (
    notification
  ) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(
          notification._id,
          token
        );

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  read: true,
                }
              : item
          )
        );
      }

      if (notification.post?._id) {
        navigate(
          `/posts/${notification.post._id}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsAsRead(token);

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  if (!token) {
    return (
      <main className="notifications-page">
        <div className="notifications-container">
          <Link
            to="/"
            className="back-button"
          >
            ← Back
          </Link>

          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              🔔
            </div>

            <h2>Login required</h2>

            <p>
              Please log in to view your
              notifications.
            </p>

            <Link
              to="/login"
              className="notification-login-button"
            >
              Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="notifications-page">
        <div className="notifications-container">
          <p className="page-loading">
            Loading notifications...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="notifications-page">
        <div className="notifications-container">
          <Link
            to="/"
            className="back-button"
          >
            ← Back
          </Link>

          <h1>Notifications</h1>

          <div className="error-message">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="notifications-page">
      <div className="notifications-container">

        <div className="notifications-top">

          <Link
            to="/"
            className="back-button"
          >
            ← Back
          </Link>

          <div className="notifications-heading">
            <div>
              <h1>Notifications</h1>

              <p>
                Stay updated with your
                activity on Threadly.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                className="mark-all-button"
                onClick={handleReadAll}
              >
                ✓ Mark all as read
              </button>
            )}
          </div>

        </div>

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              🔔
            </div>

            <h2>
              You're all caught up
            </h2>

            <p>
              You don't have any
              notifications yet.
            </p>
          </div>
        ) : (
          <section className="notifications-list">

            {notifications.map(
              (notification) => (
                <article
                  key={notification._id}
                  className={`notification-card ${
                    notification.read
                      ? "read"
                      : "unread"
                  }`}
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                >

                  <div className="notification-icon">
                    {notification.read
                      ? "🔔"
                      : "🔔"}
                  </div>

                  <div className="notification-content">

                    <div className="notification-title">
                      <strong>
                        {notification.sender
                          ?.username ||
                          "Someone"}
                      </strong>

                      {!notification.read && (
                        <span className="unread-dot" />
                      )}
                    </div>

                    <p>
                      {notification.message}
                    </p>

                    {notification.post?.title && (
                      <span className="notification-post">
                        {notification.post.title}
                      </span>
                    )}

                    {!notification.read && (
                      <button
                        className="notification-read-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(
                            notification._id,
                            token
                          ).then(() => {
                            setNotifications(
                              (prev) =>
                                prev.map(
                                  (item) =>
                                    item._id ===
                                    notification._id
                                      ? {
                                          ...item,
                                          read: true,
                                        }
                                      : item
                                )
                            );
                          });
                        }}
                      >
                        Mark as read
                      </button>
                    )}

                  </div>

                  <span className="notification-arrow">
                    →
                  </span>

                </article>
              )
            )}

          </section>
        )}

      </div>
    </main>
  );
};

export default Notifications;
