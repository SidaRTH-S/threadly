const API_URL = "https://threadly-server.vercel.app/api";

export const getCommentsByPost = async (
  postId,
  token
) => {
  const response = await fetch(
    `${API_URL}/comments/post/${postId}`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch comments"
    );
  }

  return data;
};

export const createComment = async (
  postId,
  content,
  token,
  parentComment = null
) => {
  const response = await fetch(
    `${API_URL}/comments/post/${postId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
        parentComment,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create comment"
    );
  }

  return data;
};

export const upvoteComment = async (
  commentId,
  token
) => {
  const response = await fetch(
    `${API_URL}/comments/${commentId}/upvote`,
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
      data.message || "Failed to upvote comment"
    );
  }

  return data;
};

export const downvoteComment = async (
  commentId,
  token
) => {
  const response = await fetch(
    `${API_URL}/comments/${commentId}/downvote`,
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
      data.message || "Failed to downvote comment"
    );
  }

  return data;
};

export const updateComment = async (
  commentId,
  content,
  token
) => {
  const response = await fetch(
    `${API_URL}/comments/${commentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update comment"
    );
  }

  return data;
};

export const deleteComment = async (
  commentId,
  token
) => {
  const response = await fetch(
    `${API_URL}/comments/${commentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete comment"
    );
  }

  return data;
};
