const API_URL = "https://threadly-server.vercel.app/api";

export const getNotifications = async (token) => {
  const response = await fetch(
    `${API_URL}/notifications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch notifications"
    );
  }

  return data;
};

export const markNotificationAsRead = async (
  notificationId,
  token
) => {
  const response = await fetch(
    `${API_URL}/notifications/${notificationId}/read`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to mark notification as read"
    );
  }

  return data;
};

export const markAllNotificationsAsRead =
  async (token) => {
    const response = await fetch(
      `${API_URL}/notifications/read-all`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to mark notifications as read"
      );
    }



    return data;
  };
export const getUnreadNotificationCount =
  async (token) => {
    const data =
      await getNotifications(token);

    return data.notifications.filter(
      (notification) =>
        !notification.read
    ).length;
  };
