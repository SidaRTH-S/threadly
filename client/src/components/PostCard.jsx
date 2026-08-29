import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  savePost,
  unsavePost,
  upvotePost,
  downvotePost,
} from "../services/postService";

const PostCard = ({ post, onSavedChange }) => {
  const { token, user } = useAuth();

  const [saved, setSaved] = useState(Boolean(post.saved));
  const [currentPost, setCurrentPost] = useState(post);

  const [voteLoading, setVoteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    setSaved(Boolean(post.saved));
    setCurrentPost(post);
  }, [post]);

  const userId = user?._id?.toString();

  const hasUpvoted = currentPost.upvotes?.some(
    (id) => id.toString() === userId
  );

  const hasDownvoted = currentPost.downvotes?.some(
    (id) => id.toString() === userId
  );

  const handleUpvote = async () => {
    if (!token || voteLoading) return;

    try {
      setVoteLoading(true);

      const data = await upvotePost(
        currentPost._id,
        token
      );

      setCurrentPost((prev) => {
        let upvotes = [...(prev.upvotes || [])];
        let downvotes = [...(prev.downvotes || [])];

        if (hasUpvoted) {
          upvotes = upvotes.filter(
            (id) => id.toString() !== userId
          );
        } else {
          upvotes.push(user._id);

          downvotes = downvotes.filter(
            (id) => id.toString() !== userId
          );
        }

        return {
          ...prev,
          score: data.score,
          upvotes,
          downvotes,
        };
      });
    } catch (error) {
      console.error(error);
    } finally {
      setVoteLoading(false);
    }
  };

  const handleDownvote = async () => {
    if (!token || voteLoading) return;

    try {
      setVoteLoading(true);

      const data = await downvotePost(
        currentPost._id,
        token
      );

      setCurrentPost((prev) => {
        let upvotes = [...(prev.upvotes || [])];
        let downvotes = [...(prev.downvotes || [])];

        if (hasDownvoted) {
          downvotes = downvotes.filter(
            (id) => id.toString() !== userId
          );
        } else {
          downvotes.push(user._id);

          upvotes = upvotes.filter(
            (id) => id.toString() !== userId
          );
        }

        return {
          ...prev,
          score: data.score,
          upvotes,
          downvotes,
        };
      });
    } catch (error) {
      console.error(error);
    } finally {
      setVoteLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || saveLoading) return;

    try {
      setSaveLoading(true);

      if (saved) {
        await unsavePost(currentPost._id, token);

        setSaved(false);

        if (onSavedChange) {
          onSavedChange(currentPost._id, false);
        }
      } else {
        await savePost(currentPost._id, token);

        setSaved(true);

        if (onSavedChange) {
          onSavedChange(currentPost._id, true);
        }
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <article className="post-card">

      {/* POST HEADER */}
      <div className="post-header">

        <div className="post-author">

          {currentPost.author?.avatar ? (
            <img
              src={currentPost.author.avatar}
              alt={currentPost.author.username}
              className="post-avatar"
            />
          ) : (
            <div className="post-avatar placeholder">
              {currentPost.author?.username
                ?.charAt(0)
                ?.toUpperCase()}
            </div>
          )}

          <div>
            <Link
              to={`/profile/${currentPost.author?.username}`}
              className="post-username"
            >
              u/{currentPost.author?.username}
            </Link>

            {currentPost.community && (
              <div className="post-community">
                in{" "}
                <Link
                  to={`/communities/${currentPost.community.name}`}
                >
                  {currentPost.community.displayName}
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* POST CONTENT */}
      <div className="post-content">

        <Link
          to={`/posts/${currentPost._id}`}
          className="post-title"
        >
          {currentPost.title}
        </Link>

        {currentPost.content && (
          <p className="post-text">
            {currentPost.content}
          </p>
        )}

        {currentPost.postType === "link" &&
          currentPost.linkUrl && (
            <a
              href={currentPost.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="post-link"
            >
              🔗 {currentPost.linkUrl}
            </a>
          )}

        {currentPost.postType === "image" &&
          currentPost.imageUrl && (
            <img
              src={currentPost.imageUrl}
              alt={currentPost.title}
              className="post-image"
            />
          )}

      </div>

      {/* POST ACTIONS */}
      <div className="post-actions">

        <div className="vote-group">

          <button
            className={`vote-button ${
              hasUpvoted ? "active-upvote" : ""
            }`}
            onClick={handleUpvote}
            disabled={!token || voteLoading}
          >
            {hasUpvoted ? "▲" : "△"}
          </button>

          <span className="score">
            {currentPost.score || 0}
          </span>

          <button
            className={`vote-button ${
              hasDownvoted ? "active-downvote" : ""
            }`}
            onClick={handleDownvote}
            disabled={!token || voteLoading}
          >
            {hasDownvoted ? "▼" : "▽"}
          </button>

        </div>

        <Link
          to={`/posts/${currentPost._id}`}
          className="action-button"
        >
          💬 {currentPost.commentCount || 0}
        </Link>

        <button
          className={`action-button ${
            saved ? "saved-button" : ""
          }`}
          onClick={handleSave}
          disabled={!token || saveLoading}
        >
          {saved ? "🔖 Saved" : "🔖 Save"}
        </button>

      </div>

    </article>
  );
};

export default PostCard;
