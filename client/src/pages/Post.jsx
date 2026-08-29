import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CommentItem from "../components/CommentItem";
import { useAuth } from "../context/AuthContext";
import "./Post.css";
import {
  getCommentsByPost,
  createComment,
} from "../services/commentService";

import PostCard from "../components/PostCard";

const API_URL = "http://localhost:5000/api";

const Post = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // =========================
  // LOAD POST + COMMENTS
  // =========================
  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError("");

        const postResponse = await fetch(
          `${API_URL}/posts/${id}`
        );

        const postData = await postResponse.json();

        if (!postResponse.ok) {
          throw new Error(
            postData.message || "Failed to load post"
          );
        }

        setPost(postData.post);

        const commentData = await getCommentsByPost(
          id,
          token
        );

        setComments(commentData.comments || []);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, token]);

  // =========================
  // CREATE COMMENT
  // =========================
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    try {
      setCommentLoading(true);
      setError("");

      const data = await createComment(
        id,
        commentText.trim(),
        token
      );

      setComments((prev) => [
        ...prev,
        data.comment,
      ]);

      setCommentText("");

      setPost((prev) => ({
        ...prev,
        commentCount:
          (prev.commentCount || 0) + 1,
      }));
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setCommentLoading(false);
    }
  };

  // =========================
  // UPDATE COMMENT
  // =========================
  const handleCommentUpdated = (updatedComment) => {
    const updateCommentTree = (comments) => {
      return comments.map((comment) => {
        if (comment._id === updatedComment._id) {
          return {
            ...comment,
            ...updatedComment,
          };
        }

        return {
          ...comment,
          replies: updateCommentTree(
            comment.replies || []
          ),
        };
      });
    };

    setComments((prev) =>
      updateCommentTree(prev)
    );
  };

  // =========================
  // ADD COMMENT / REPLY
  // =========================
  const handleCommentAdded = (newComment) => {
    const addReplyToTree = (comments) => {
      return comments.map((comment) => {
        if (
          comment._id ===
          newComment.parentComment
        ) {
          return {
            ...comment,
            replies: [
              ...(comment.replies || []),
              newComment,
            ],
          };
        }

        return {
          ...comment,
          replies: addReplyToTree(
            comment.replies || []
          ),
        };
      });
    };

    if (!newComment.parentComment) {
      setComments((prev) => [
        ...prev,
        newComment,
      ]);
    } else {
      setComments((prev) =>
        addReplyToTree(prev)
      );
    }

    setPost((prev) => ({
      ...prev,
      commentCount:
        (prev.commentCount || 0) + 1,
    }));
  };

  // =========================
  // DELETE COMMENT
  // =========================
  const handleCommentDeleted = (
    commentId,
    deletedCount = 1
  ) => {
    const removeCommentTree = (comments) => {
      return comments
        .filter(
          (comment) =>
            comment._id !== commentId
        )
        .map((comment) => ({
          ...comment,
          replies: removeCommentTree(
            comment.replies || []
          ),
        }));
    };

    setComments((prev) =>
      removeCommentTree(prev)
    );

    setPost((prev) => ({
      ...prev,
      commentCount: Math.max(
        0,
        (prev.commentCount || 0) -
          deletedCount
      ),
    }));
  };

  // =========================
  // LOADING / ERROR
  // =========================
  if (loading) {
    return (
      <main className="page-container">
        <div className="loading-state">
          Loading post...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <div className="error-state">
          {error}
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="page-container">
        <div className="empty-state">
          Post not found.
        </div>
      </main>
    );
  }

  // =========================
  // PAGE
  // =========================
  return (
    <main className="post-page">

      {/* BACK */}
      <div className="post-back">
        <Link to="/">
          ← Back to feed
        </Link>
      </div>

      {/* POST */}
      <section className="post-section">
        <PostCard post={post} />
      </section>

      {/* COMMENTS */}
      <section className="comments-section">

        <div className="comments-header">
          <div>
            <h2>Comments</h2>

            <span className="comments-count">
              {post.commentCount || 0} comments
            </span>
          </div>
        </div>

        {/* CREATE COMMENT */}
        <form
          className="comment-form"
          onSubmit={handleCommentSubmit}
        >
          <textarea
            value={commentText}
            onChange={(e) =>
              setCommentText(e.target.value)
            }
            placeholder="Join the discussion..."
            rows={4}
            maxLength={1000}
          />

          <div className="comment-form-footer">
            <span>
              {commentText.length}/1000
            </span>

            <button
              type="submit"
              disabled={
                commentLoading ||
                !commentText.trim()
              }
            >
              {commentLoading
                ? "Posting..."
                : "Post comment"}
            </button>
          </div>
        </form>

        {/* COMMENTS */}
        <div className="comments-list">

          {comments.length === 0 ? (
            <div className="empty-comments">
              <div className="empty-comments-icon">
                💬
              </div>

              <h3>No comments yet</h3>

              <p>
                Be the first person to join
                the discussion.
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                replies={comment.replies || []}
                onCommentAdded={
                  handleCommentAdded
                }
                onCommentUpdated={
                  handleCommentUpdated
                }
                onCommentDeleted={
                  handleCommentDeleted
                }
              />
            ))
          )}

        </div>
      </section>
    </main>
  );
};

export default Post;
