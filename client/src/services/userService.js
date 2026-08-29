const API_URL = "https://threadly-server.vercel.app/api";

export const followUser = async (userId, token) => {
  const response = await fetch(
    `${API_URL}/users/${userId}/follow`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to follow user"
    );
  }

  return data;
};


export const updateProfile = async (profileData, token) => {
  const response = await fetch(
    `${API_URL}/users/me`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update profile"
    );
  }

  return data;
};


export const unfollowUser = async (userId, token) => {
  const response = await fetch(
    `${API_URL}/users/${userId}/unfollow`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to unfollow user"
    );
  }

  return data;
};
