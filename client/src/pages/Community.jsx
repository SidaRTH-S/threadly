import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import PostCard from "../components/PostCard";
import {
  joinCommunity,
  leaveCommunity,
} from "../services/communityService";

const API_URL = "http://localhost:5000/api";

const Community = () => {
  const { name } = useParams();
  const { token, user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCommunity = async () => {
      try {
        setLoading(true);
        setError("");

        const communityResponse = await fetch(
          `${API_URL}/communities/${name}`
        );

        const communityData =
          await communityResponse.json();

        if (!communityResponse.ok) {
          throw new Error(
            communityData.message ||
              "Failed to load community"
          );
        }

        const postsResponse = await fetch(
          `${API_URL}/posts/community/${name}`
        );

        const postsData =
          await postsResponse.json();

        if (!postsResponse.ok) {
          throw new Error(
            postsData.message ||
              "Failed to load posts"
          );
        }

        setCommunity(
          communityData.community
        );

        setPosts(
          postsData.posts || []
        );
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCommunity();
  }, [name]);

  const isMember =
    community?.members?.some(
      (memberId) =>
        memberId.toString() ===
        user?._id?.toString()
    );

  const handleJoin = async () => {
    if (!token || actionLoading) return;

    try {
      setActionLoading(true);
      setError("");

      await joinCommunity(
        community.name,
        token
      );

      setCommunity((prev) => ({
        ...prev,
        members: [
          ...(prev.members || []),
          user._id,
        ],
      }));
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!token || actionLoading) return;

    try {
      setActionLoading(true);
      setError("");

      await leaveCommunity(
        community.name,
        token
      );

      setCommunity((prev) => ({
        ...prev,
        members: (
          prev.members || []
        ).filter(
          (memberId) =>
            memberId.toString() !==
            user._id.toString()
        ),
      }));
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="page-container">
        <div className="loading-state">
          Loading community...
        </div>
      </main>
    );
  }

  if (error && !community) {
    return (
      <main className="page-container">
        <Link
          to="/communities"
          className="back-button"
        >
          ← Communities
        </Link>

        <div className="error-state">
          {error}
        </div>
      </main>
    );
  }

  if (!community) {
    return (
      <main className="page-container">
        <Link
          to="/communities"
          className="back-button"
        >
          ← Communities
        </Link>

        <div className="empty-state">
          <div className="empty-icon">
            🏘️
          </div>

          <h2>
            Community not found
          </h2>

          <p>
            This community doesn't exist or
            may have been removed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="community-page">

      {/* BACK */}

      <div className="community-topbar">
        <Link
          to="/communities"
          className="back-button"
        >
          ← Communities
        </Link>
      </div>

      {/* COMMUNITY HEADER */}

      <section className="community-hero">

        <div className="community-icon">
          {community.name
            ?.charAt(0)
            ?.toUpperCase() || "R"}
        </div>

        <div className="community-info">

          <p className="community-name">
            r/{community.name}
          </p>

          <h1>
            {community.displayName}
          </h1>

          {community.description && (
            <p className="community-description">
              {community.description}
            </p>
          )}

          <div className="community-meta">
            <span>
              👥{" "}
              {community.members?.length || 0}{" "}
              members
            </span>

            {community.createdAt && (
              <span>
                🌱 Community
              </span>
            )}
          </div>

        </div>

        <div className="community-actions">

          {isMember ? (
            <>
              <Link
                to={`/create-post?community=${community.name}`}
                className="community-primary-button"
              >
                ✏️ Create Post
              </Link>

              <button
                className="community-secondary-button"
                onClick={handleLeave}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Leaving..."
                  : "Leave"}
              </button>
            </>
          ) : (
            <button
              className="community-primary-button"
              onClick={handleJoin}
              disabled={
                !token || actionLoading
              }
            >
              {actionLoading
                ? "Joining..."
                : "Join Community"}
            </button>
          )}

        </div>

      </section>

      {error && (
        <div className="inline-error">
          {error}
        </div>
      )}

      {/* POSTS */}

      <section className="community-posts">

        <div className="section-heading">
          <div>
            <h2>Community Posts</h2>

            <p>
              See what people are talking about.
            </p>
          </div>

          <span className="post-count">
            {posts.length}{" "}
            {posts.length === 1
              ? "post"
              : "posts"}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state community-empty">

            <div className="empty-icon">
              📝
            </div>

            <h3>
              No posts yet
            </h3>

            <p>
              Be the first person to start a
              conversation.
            </p>

            {isMember && (
              <Link
                to={`/create-post?community=${community.name}`}
                className="primary-button"
              >
                Create the first post
              </Link>
            )}

          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
              />
            ))}
          </div>
        )}

      </section>

    </main>
  );
};

export default Community;