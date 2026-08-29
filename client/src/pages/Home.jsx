import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getPosts } from "../services/postService";
import PostCard from "../components/PostCard";

const Home = () => {
  const { token } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPosts(token);

        setPosts(data.posts || []);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadPosts();
    }
  }, [token]);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>

      {posts.length === 0 ? (
        <p>
          No posts yet. Be the first to post!
        </p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
          />
        ))
      )}
    </main>
  );
};

export default Home;