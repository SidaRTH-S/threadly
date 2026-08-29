
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/communities`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load communities"
          );
        }

        setCommunities(data.communities || []);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCommunities();
  }, []);

  if (loading) {
    return (
      <main className="communities-page">
        <div className="communities-container">
          <p>Loading communities...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="communities-page">
        <div className="communities-container">
          <Link to="/" className="back-button">
            ← Back
          </Link>

          <h1>Communities</h1>

          <div className="error-message">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="communities-page">
      <div className="communities-container">

        <Link to="/" className="back-button">
          ← Back
        </Link>

        <div className="communities-header">
          <div>
            <h1>Communities</h1>
            <p>
              Discover communities and join the
              conversations you care about.
            </p>
          </div>
        </div>

        {communities.length === 0 ? (
          <div className="empty-communities">
            <div className="empty-icon">🏘️</div>

            <h2>No communities yet</h2>

            <p>
              There are no communities available right now.
            </p>
          </div>
        ) : (
          <section className="communities-grid">
            {communities.map((community) => (
              <Link
                key={community._id}
                to={`/communities/${community.name}`}
                className="community-card"
              >
                <div className="community-card-top">
                  <div className="community-icon">
                    r/
                  </div>

                  <div>
                    <h2>
                      {community.displayName}
                    </h2>

                    <span>
                      r/{community.name}
                    </span>
                  </div>
                </div>

                <p className="community-description">
                  {community.description ||
                    "No description available."}
                </p>

                <div className="community-card-footer">
                  <span>
                    👥{" "}
                    {community.memberCount ??
                      community.members?.length ??
                      0}{" "}
                    members
                  </span>

                  <span className="community-view">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </section>
        )}

      </div>
    </main>
  );
};

export default Communities;

