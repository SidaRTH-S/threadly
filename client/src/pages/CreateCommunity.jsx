import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "https://threadly-server.vercel.app/api";

const CreateCommunity = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!name.trim() || !displayName.trim()) {
      setError("Community name and display name are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/communities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            displayName: displayName.trim(),
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create community"
        );
      }

      // Go directly to the new community
      navigate(`/communities/${data.community.name}`);

    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="create-community-page">
        <div className="create-community-container">

          <Link to="/communities" className="back-button">
            ← Back to Communities
          </Link>

          <div className="create-community-card">
            <h1>Login Required</h1>

            <p>
              You need to log in before creating a community.
            </p>

            <Link
              to="/login"
              className="create-community-button"
            >
              Login
            </Link>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="create-community-page">
      <div className="create-community-container">

        <Link to="/communities" className="back-button">
          ← Back to Communities
        </Link>

        <div className="create-community-card">

          <div className="create-community-heading">
            <h1>Create a Community</h1>

            <p>
              Start a new place for people to discuss
              things they care about.
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form
            className="create-community-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">
              <label htmlFor="community-name">
                Community Name
              </label>

              <input
                id="community-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="programming"
                maxLength={30}
                required
              />

              <span className="form-hint">
                This becomes r/{name || "yourcommunity"}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="community-display-name">
                Display Name
              </label>

              <input
                id="community-display-name"
                type="text"
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
                placeholder="Programming"
                maxLength={50}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="community-description">
                Description
              </label>

              <textarea
                id="community-description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="What is this community about?"
                rows={5}
                maxLength={300}
              />
            </div>

            <div className="create-community-actions">

              <Link
                to="/communities"
                className="comment-secondary-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="comment-primary-button"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "➕ Create Community"}
              </button>

            </div>

          </form>

        </div>
      </div>
    </main>
  );
};

export default CreateCommunity;