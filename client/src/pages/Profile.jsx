import { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
const avatarModules = import.meta.glob(
  "../assets/avatars/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const AVATARS = Object.values(avatarModules);
import PostCard from "../components/PostCard";

import {
  followUser,
  unfollowUser,
  updateProfile,
} from "../services/userService";

const API_URL = "https://threadly-server.vercel.app/api";


const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const {
    token,
    user: currentUser,
  } = useAuth();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [following, setFollowing] =
    useState(false);

  const [followLoading, setFollowLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================
  // EDIT PROFILE STATE
  // =========================

  const [editing, setEditing] =
    useState(false);

  const [editUsername, setEditUsername] =
    useState("");

  const [editBio, setEditBio] =
    useState("");

  const [editAvatar, setEditAvatar] =
    useState("");

  const [savingProfile, setSavingProfile] =
    useState(false);

  // =========================
  // LOAD PROFILE
  // =========================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        // -------------------------
        // Load user profile
        // -------------------------

        const userResponse = await fetch(
          `${API_URL}/users/${username}`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        const userData =
          await userResponse.json();

        if (!userResponse.ok) {
          throw new Error(
            userData.message ||
              "Failed to load profile"
          );
        }

        setUser(userData.user);

        setFollowing(
          userData.user.isFollowing || false
        );

        // -------------------------
        // Load user's posts
        // -------------------------

        const postsResponse =
          await fetch(
            `${API_URL}/users/${username}/posts`
          );

        const postsData =
          await postsResponse.json();

        if (!postsResponse.ok) {
          throw new Error(
            postsData.message ||
              "Failed to load posts"
          );
        }

        setPosts(postsData.posts || []);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, token]);

  // =========================
  // IS OWN PROFILE
  // =========================

  const isOwnProfile =
    currentUser &&
    user &&
    currentUser._id?.toString() ===
      user._id?.toString();

  // =========================
  // START EDITING
  // =========================

  const handleEditProfile = () => {
    setEditUsername(user.username || "");
    setEditBio(user.bio || "");
    setEditAvatar(user.avatar || "");

    setError("");
    setEditing(true);
  };

  // =========================
  // SAVE PROFILE
  // =========================

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("You must be logged in");
      return;
    }

    if (!editUsername.trim()) {
      setError("Username cannot be empty");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");

      const data = await updateProfile(
        {
          username: editUsername.trim(),
          bio: editBio.trim(),
          avatar: editAvatar,
        },
        token
      );

      const updatedUser =
        data.user || data.updatedUser;

      if (updatedUser) {
        /*
          Merge returned data with existing
          profile so follower/following
          counts don't disappear.
        */
        setUser((prev) => ({
          ...prev,
          ...updatedUser,
        }));
      } else {
        setUser((prev) => ({
          ...prev,
          username: editUsername.trim(),
          bio: editBio.trim(),
          avatar: editAvatar,
        }));
      }

      setEditing(false);

      /*
        If username changed, move to the
        new profile URL.
      */
      if (
        updatedUser?.username &&
        updatedUser.username !== username
      ) {
        navigate(
          `/profile/${updatedUser.username}`
        );
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================
  // FOLLOW
  // =========================

  const handleFollow = async () => {
    if (!token || followLoading) return;

    try {
      setFollowLoading(true);
      setError("");

      await followUser(
        user._id,
        token
      );

      setFollowing(true);

      setUser((prev) => ({
        ...prev,
        followerCount:
          (prev.followerCount || 0) + 1,
      }));
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setFollowLoading(false);
    }
  };

  // =========================
  // UNFOLLOW
  // =========================

  const handleUnfollow = async () => {
    if (!token || followLoading) return;

    try {
      setFollowLoading(true);
      setError("");

      await unfollowUser(
        user._id,
        token
      );

      setFollowing(false);

      setUser((prev) => ({
        ...prev,
        followerCount: Math.max(
          0,
          (prev.followerCount || 0) - 1
        ),
      }));
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setFollowLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="profile-page">
        <p>Loading profile...</p>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !user) {
    return (
      <main className="profile-page">
        <Link
          to="/"
          className="back-button"
        >
          ← Back
        </Link>

        <p className="profile-error">
          {error}
        </p>
      </main>
    );
  }

  // =========================
  // USER NOT FOUND
  // =========================

  if (!user) {
    return (
      <main className="profile-page">
        <Link
          to="/"
          className="back-button"
        >
          ← Back
        </Link>

        <p>User not found.</p>
      </main>
    );
  }

  // =========================
  // RENDER
  // =========================

  return (
    <main className="profile-page">

      {/* =========================
          BACK
      ========================= */}

      <Link
        to="/"
        className="back-button"
      >
        ← Back
      </Link>

      {/* =========================
          PROFILE CARD
      ========================= */}

      <section className="profile-card">

        {/* AVATAR */}

        <div className="profile-avatar-container">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {user.username
                ?.charAt(0)
                ?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* USERNAME */}

        <h1 className="profile-username">
          {user.username}
        </h1>

        <p className="profile-handle">
          @{user.username}
        </p>

        {/* STATS */}

        <div className="profile-stats">

          <div>
            <strong>
              {user.followerCount || 0}
            </strong>

            <span>Followers</span>
          </div>

          <div>
            <strong>
              {user.followingCount || 0}
            </strong>

            <span>Following</span>
          </div>

          <div>
            <strong>
              {posts.length}
            </strong>

            <span>Posts</span>
          </div>

        </div>

        {/* BIO */}

        {user.bio && (
          <p className="profile-bio">
            {user.bio}
          </p>
        )}

        {/* JOIN DATE */}

        <p className="profile-joined">
          Joined{" "}
          {new Date(
            user.createdAt
          ).toLocaleDateString()}
        </p>

        {/* =========================
            PROFILE ACTIONS
        ========================= */}

        <div className="profile-actions">

          {isOwnProfile ? (
            <button
              type="button"
              className="profile-edit-button"
              onClick={handleEditProfile}
            >
              Edit Profile
            </button>
          ) : (
            <>
              {!following ? (
                <button
                  type="button"
                  className="profile-follow-button"
                  onClick={handleFollow}
                  disabled={
                    !token ||
                    followLoading
                  }
                >
                  {followLoading
                    ? "Following..."
                    : "Follow"}
                </button>
              ) : (
                <button
                  type="button"
                  className="profile-unfollow-button"
                  onClick={handleUnfollow}
                  disabled={followLoading}
                >
                  {followLoading
                    ? "Loading..."
                    : "Unfollow"}
                </button>
              )}
            </>
          )}

        </div>

        {/* ERROR */}

        {error && (
          <p className="profile-error">
            {error}
          </p>
        )}

      </section>

      {/* =========================
          EDIT PROFILE
      ========================= */}

      {editing && (
        <section className="edit-profile-card">

          {/* HEADER */}

          <div className="edit-profile-header">

            <div>
              <h2>Edit Profile</h2>

              <p>
                Update your Threadly profile
              </p>
            </div>

            <button
              type="button"
              className="edit-close-button"
              onClick={() => {
                setEditing(false);
                setError("");
              }}
            >
              ✕
            </button>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleSaveProfile}
            className="edit-profile-form"
          >

            {/* USERNAME */}

            <div className="profile-form-group">

              <label>
                Username
              </label>

              <input
                type="text"
                value={editUsername}
                onChange={(e) =>
                  setEditUsername(
                    e.target.value
                  )
                }
                maxLength={30}
                required
              />

            </div>

            {/* BIO */}

            <div className="profile-form-group">

              <label>
                Bio
              </label>

              <textarea
                value={editBio}
                onChange={(e) =>
                  setEditBio(
                    e.target.value
                  )
                }
                placeholder="Tell people about yourself..."
                maxLength={300}
                rows={4}
              />

              <small>
                {editBio.length}/300
              </small>

            </div>

            {/* AVATAR */}

            <div className="profile-form-group">

              <label>
                Choose Avatar
              </label>

              <div className="avatar-grid">

                {AVATARS.map(
                  (avatar, index) => (
                    <button
                      type="button"
                      key={avatar}
                      className={`avatar-option ${
                        editAvatar === avatar
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setEditAvatar(
                          avatar
                        )
                      }
                    >
                      <img
                        src={avatar}
                        alt={`Avatar ${
                          index + 1
                        }`}
                      />
                    </button>
                  )
                )}

              </div>

            </div>

            {/* AVATAR PREVIEW */}

            {editAvatar && (
              <div className="avatar-preview">

                <span>
                  Preview
                </span>

                <img
                  src={editAvatar}
                  alt="Selected avatar"
                />

              </div>
            )}

            {/* =========================
                FORM ACTIONS
            ========================= */}

            <div className="edit-profile-actions">

              <button
                type="button"
                className="edit-cancel-button"
                onClick={() => {
                  setEditing(false);
                  setError("");
                }}
                disabled={savingProfile}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="edit-save-button"
                disabled={savingProfile}
              >
                {savingProfile
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </section>
      )}

      {/* =========================
          POSTS
      ========================= */}

      <section className="profile-posts">

        <h2>
          Posts ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <div className="empty-profile-posts">

            <p>
              This user hasn't posted
              anything yet.
            </p>

          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
            />
          ))
        )}

      </section>

    </main>
  );
};

export default Profile;
