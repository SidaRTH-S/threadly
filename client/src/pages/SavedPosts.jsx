import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  getSavedPosts,
} from "../services/postService";

import PostCard from "../components/PostCard";

const SavedPosts = () => {
  const { token } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSavedPosts = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getSavedPosts(token);

        setPosts(data.posts || []);
      } catch (error) {
        console.error(error);
        setError(error.message || "Failed to load saved posts");
      } finally {
        setLoading(false);
      }
    };

    loadSavedPosts();
  }, [token]);

  if (!token) {
    return (
      <main className="page-container">
        <Link to="/" className="back-button">
          ← Back
        </Link>

        <div className="empty-state">
          <div className="empty-icon">🔖</div>

          <h1>Saved Posts</h1>

          <p>
            Please log in to view your saved posts.
          </p>

          <Link to="/login" className="primary-button">
            Login
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page-container">
        <Link to="/" className="back-button">
          ← Back
        </Link>

        <h1 className="page-title">Saved Posts</h1>

        <div className="loading-state">
          Loading saved posts...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <Link to="/" className="back-button">
          ← Back
        </Link>

        <h1 className="page-title">Saved Posts</h1>

        <div className="error-state">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <Link to="/" className="back-button">
        ← Back
      </Link>

      <div className="page-heading">
        <div>
          <h1 className="page-title">
            Saved Posts
          </h1>

          <p className="page-subtitle">
            Posts you've saved for later.
          </p>
        </div>

        <span className="post-count">
          {posts.length}{" "}
          {posts.length === 1 ? "post" : "posts"}
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔖</div>

          <h2>No saved posts yet</h2>

          <p>
            Save interesting posts and they'll
            appear here.
          </p>

          <Link to="/" className="primary-button">
            Browse Posts
          </Link>
        </div>
      ) : (
        <section className="posts-list">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={{
                ...post,
                saved: true,
              }}
              onSavedChange={(postId, isSaved) => {
                if (!isSaved) {
                  setPosts((prev) =>
                    prev.filter(
                      (item) =>
                        item._id !== postId
                    )
                  );
                }
              }}
            />
          ))}
        </section>
      )}
    </main>
  );
};

export default SavedPosts;
