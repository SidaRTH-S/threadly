const API_URL = "http://localhost:5000/api";

export const getCommunities = async () => {
  const response = await fetch(
    `${API_URL}/communities`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch communities"
    );
  }

  return data;
};

export const createCommunity = async (
  communityData,
  token
) => {
  const response = await fetch(
    `${API_URL}/communities`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(communityData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create community"
    );
  }

  return data;
};

export const joinCommunity = async (
  communityName,
  token
) => {
  const response = await fetch(
    `${API_URL}/communities/${communityName}/join`,
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
      data.message || "Failed to join community"
    );
  }

  return data;
};

export const leaveCommunity = async (
  communityName,
  token
) => {
  const response = await fetch(
    `${API_URL}/communities/${communityName}/leave`,
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
      data.message || "Failed to leave community"
    );
  }

  return data;
};