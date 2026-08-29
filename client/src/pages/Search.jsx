import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchAll } from "../services/searchService";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await searchAll(query);

        setResults(data.results);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (loading) {
    return (
      <main className="search-page">
        <div className="search-container">
          <Link to="/" className="back-button">
            ← Back
          </Link>

          <div className="search-state">
            <div className="search-state-icon">🔍</div>
            <h2>Searching...</h2>
            <p>Looking across Threadly.</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="search-page">
        <div className="search-container">
          <Link to="/" className="back-button">
            ← Back
          </Link>

          <div className="search-state search-error">
            <div className="search-state-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!results) {
    return (
      <main className="search-page">
        <div className="search-container">
          <Link to="/" className="back-button">
            ← Back
          </Link>

          <div className="search-state">
            <div className="search-state-icon">🔎</div>
            <h2>Search Threadly</h2>
            <p>Enter something to search.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="search-page">
      <div className="search-container">

        {/* HEADER */}

        <div className="search-header">

          <Link to="/" className="back-button">
            ← Back
          </Link>

          <div className="search-heading">
            <h1>Search results</h1>

            <p>
              Results for{" "}
              <strong>"{query}"</strong>
            </p>
          </div>

        </div>

        {/* USERS */}

        <section className="search-section">

          <div className="search-section-header">
            <h2>👤 Users</h2>

            <span>
              {results.users.count}
            </span>
          </div>

          {results.users.items.length === 0 ? (
            <div className="search-empty">
              No users found.
            </div>
          ) : (
            <div className="search-results-list">

              {results.users.items.map((user) => (
                <Link
                  key={user._id}
                  to={`/profile/${user.username}`}
                  className="search-user-card"
                >
                  <div className="search-user-avatar">
                    {user.username
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div className="search-result-info">

                    <strong>
                      @{user.username}
                    </strong>

                    {user.bio && (
                      <p>{user.bio}</p>
                    )}

                  </div>

                  <span className="search-arrow">
                    →
                  </span>
                </Link>
              ))}

            </div>
          )}

        </section>

        {/* COMMUNITIES */}

        <section className="search-section">

          <div className="search-section-header">
            <h2>🏘 Communities</h2>

            <span>
              {results.communities.count}
            </span>
          </div>

          {results.communities.items.length === 0 ? (
            <div className="search-empty">
              No communities found.
            </div>
          ) : (
            <div className="search-results-list">

              {results.communities.items.map(
                (community) => (
                  <Link
                    key={community._id}
                    to={`/communities/${community.name}`}
                    className="search-community-card"
                  >
                    <div className="search-community-icon">
                      🏘
                    </div>

                    <div className="search-result-info">

                      <strong>
                        {community.displayName}
                      </strong>

                      {community.description && (
                        <p>
                          {community.description}
                        </p>
                      )}

                    </div>

                    <span className="search-arrow">
                      →
                    </span>
                  </Link>
                )
              )}

            </div>
          )}

        </section>

        {/* POSTS */}

        <section className="search-section">

          <div className="search-section-header">
            <h2>📝 Posts</h2>

            <span>
              {results.posts.count}
            </span>
          </div>

          {results.posts.items.length === 0 ? (
            <div className="search-empty">
              No posts found.
            </div>
          ) : (
            <div className="search-results-list">

              {results.posts.items.map((post) => (
                <article
                  key={post._id}
                  className="search-post-card"
                >
                  <Link
                    to={`/posts/${post._id}`}
                    className="search-post-title"
                  >
                    {post.title}
                  </Link>

                  {post.content && (
                    <p className="search-post-content">
                      {post.content}
                    </p>
                  )}

                  {post.author && (
                    <div className="search-post-author">
                      Posted by{" "}

                      <Link
                        to={`/profile/${post.author.username}`}
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        @{post.author.username}
                      </Link>
                    </div>
                  )}

                </article>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
};

export default Search;