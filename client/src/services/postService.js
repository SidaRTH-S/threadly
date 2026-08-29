const API_URL = "https://threadly-server.vercel.app/api";

export const getPosts = async (token) => {
  const response = await fetch(
    `${API_URL}/posts`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch posts"
    );
  }

  return data;
};
export const upvotePost = async (postId, token) => {
  const response = await fetch(
    `${API_URL}/posts/${postId}/upvote`,
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
      data.message || "Failed to upvote post"
    );
  }

  return data;
};

export const downvotePost = async (postId, token) => {
  const response = await fetch(
    `${API_URL}/posts/${postId}/downvote`,
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
      data.message || "Failed to downvote post"
    );
  }

  return data;
};

export const createPost = async (postData, token) => {
  const response = await fetch(
    `${API_URL}/posts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create post"
    );
  }

  return data;
};

export const savePost = async (
  postId,
  token
) => {
  const response = await fetch(
    `${API_URL}/posts/${postId}/save`,
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
      data.message || "Failed to save post"
    );
  }

  return data;
};

export const unsavePost = async (
  postId,
  token
) => {
  const response = await fetch(
    `${API_URL}/posts/${postId}/unsave`,
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
      data.message || "Failed to unsave post"
    );
  }

  return data;
};

export const getSavedPosts = async (
  token
) => {
  const response = await fetch(
    `${API_URL}/posts/me/saved`,
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
        "Failed to fetch saved posts"
    );
  }

  return data;
};

