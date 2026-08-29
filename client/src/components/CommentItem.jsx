import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  upvoteComment,
  downvoteComment,
  createComment,
  updateComment,
  deleteComment,
} from "../services/commentService";

const CommentItem = ({
  comment,
  replies,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
}) => {
  const { token, user } = useAuth();

  const [score, setScore] = useState(
    comment.score || 0
  );
  const [userVote, setUserVote] = useState(
    comment.userVote || null
  );

  const [voteLoading, setVoteLoading] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [editText, setEditText] =
    useState(comment.content);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [editLoading, setEditLoading] =
    useState(false);

  const [replying, setReplying] =
    useState(false);

  const [replyText, setReplyText] =
    useState("");

  const [replyLoading, setReplyLoading] =
    useState(false);

  // Check if this comment belongs to logged-in user
  const isOwner =
    user &&
    comment.author?._id === user._id;

  // -----------------------------
  // UPVOTE
  // -----------------------------

  const handleUpvote = async () => {
    if (voteLoading) return;

    try {
      setVoteLoading(true);

      const data = await upvoteComment(
        comment._id,
        token
      );

      setScore(data.score);
      setUserVote(data.userVote);
    } catch (error) {
      console.error(error);
    } finally {
      setVoteLoading(false);
    }
  };


  // -----------------------------
  // DOWNVOTE
  // -----------------------------

  const handleDownvote = async () => {
    if (voteLoading) return;

    try {
      setVoteLoading(true);

      const data = await downvoteComment(
        comment._id,
        token
      );

      setScore(data.score);
      setUserVote(data.userVote);
    } catch (error) {
      console.error(error);
    } finally {
      setVoteLoading(false);
    }
  };


  // -----------------------------
  // EDIT
  // -----------------------------

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!editText.trim()) return;

    try {
      setEditLoading(true);

      const data = await updateComment(
        comment._id,
        editText.trim(),
        token
      );

      if (onCommentUpdated) {
        onCommentUpdated(data.comment);
      }

      setEditing(false);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  // -----------------------------
  // DELETE
  // -----------------------------

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this comment and all its replies?"
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);

      const data = await deleteComment(
        comment._id,
        token
      );

      if (onCommentDeleted) {
        onCommentDeleted(
          comment._id,
          data.deletedCount
        );
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // -----------------------------
  // REPLY
  // -----------------------------

  const handleReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) return;

    try {
      setReplyLoading(true);

      const data = await createComment(
        comment.post,
        replyText.trim(),
        token,
        comment._id
      );

      setReplyText("");
      setReplying(false);

      if (onCommentAdded) {
        onCommentAdded(data.comment);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setReplyLoading(false);
    }
  };

return (
  <div className="comment-wrapper">
    <div className="comment">

      {/* COMMENT HEADER */}
      <div className="comment-header">

        <div className="comment-avatar">
          {comment.author?.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.username}
            />
          ) : (
            comment.author?.username
              ?.charAt(0)
              .toUpperCase() || "?"
          )}
        </div>

        {comment.author?.username ? (
          <Link
            to={`/profile/${comment.author.username}`}
            className="comment-username"
          >
            @{comment.author.username}
          </Link>
        ) : (
          <span className="comment-username">
            Unknown user
          </span>
        )}

      </div>

      {/* COMMENT CONTENT */}
      {!editing ? (
        <>
          <p className="comment-content">
            {comment.content}
          </p>

          {/* OWNER ACTIONS */}
          {isOwner && (
            <div className="comment-owner-actions">
              <button
                onClick={() => {
                  setEditText(comment.content);
                  setEditing(true);
                }}
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          )}
        </>
      ) : (
        <form
          onSubmit={handleEdit}
          className="comment-edit-form"
        >
          <textarea
            value={editText}
            onChange={(e) =>
              setEditText(e.target.value)
            }
            rows={3}
          />

          <div className="comment-form-actions">
            <button
              type="submit"
              disabled={
                editLoading ||
                !editText.trim()
              }
            >
              {editLoading
                ? "Saving..."
                : "Save"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setEditText(comment.content);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* VOTING + REPLY */}
      <div className="comment-actions">

        <button
          className={
            userVote === "upvote"
              ? "comment-vote active"
              : "comment-vote"
          }
          onClick={handleUpvote}
          disabled={voteLoading}
        >
          ▲
        </button>

        <span className="comment-score">
          {score}
        </span>

        <button
          className={
            userVote === "downvote"
              ? "comment-vote active"
              : "comment-vote"
          }
          onClick={handleDownvote}
          disabled={voteLoading}
        >
          ▼
        </button>

        <button
          className="comment-reply-button"
          onClick={() =>
            setReplying(!replying)
          }
        >
          💬 Reply
        </button>

      </div>

      {/* REPLY FORM */}
      {replying && (
        <form
          onSubmit={handleReply}
          className="reply-form"
        >
          <textarea
            value={replyText}
            onChange={(e) =>
              setReplyText(e.target.value)
            }
            placeholder="Write a reply..."
            rows={3}
          />

          <div className="comment-form-actions">

            <button
              type="submit"
              disabled={
                replyLoading ||
                !replyText.trim()
              }
            >
              {replyLoading
                ? "Replying..."
                : "Reply"}
            </button>

            <button
              type="button"
              onClick={() => {
                setReplying(false);
                setReplyText("");
              }}
            >
              Cancel
            </button>

          </div>
        </form>
      )}

    </div>

    {/* NESTED REPLIES */}
    {replies && replies.length > 0 && (
      <div className="comment-replies">
        {replies.map((reply) => (
          <CommentItem
            key={reply._id}
            comment={reply}
            replies={reply.replies || []}
            onCommentAdded={onCommentAdded}
            onCommentUpdated={onCommentUpdated}
            onCommentDeleted={onCommentDeleted}
          />
        ))}
      </div>
    )}

  </div>
);

};

export default CommentItem;

