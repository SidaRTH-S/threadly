import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/userService";

const AVATARS = [
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Oliver",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Milo",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Luna",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Max",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Charlie",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Rocky",
];

const EditProfile = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [username, setUsername] = useState(
    user?.username || ""
  );

  const [bio, setBio] = useState(
    user?.bio || ""
  );

  const [avatar, setAvatar] = useState(
    user?.avatar || AVATARS[0]
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      await updateProfile(
        {
          username,
          bio,
          avatar,
        },
        token
      );

      navigate(`/profile/${username}`);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="edit-profile-page">

      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <section className="edit-profile-card">

        <h1>Edit Profile</h1>

        <p className="edit-profile-subtitle">
          Customize your Threadly profile
        </p>

        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="profile-avatar-section">

            <div className="profile-avatar-preview">
              <img
                src={avatar}
                alt="Profile avatar"
              />
            </div>

            <h3>Choose your avatar</h3>

            <div className="avatar-grid">
              {AVATARS.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`avatar-option ${
                    avatar === item
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setAvatar(item)
                  }
                >
                  <img
                    src={item}
                    alt="Avatar option"
                  />
                </button>
              ))}
            </div>

          </div>

          <div className="profile-form-group">

            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              minLength={3}
              maxLength={30}
              required
            />

          </div>

          <div className="profile-form-group">

            <label>
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              placeholder="Tell people a little about yourself..."
              maxLength={300}
              rows={5}
            />

            <small>
              {bio.length}/300
            </small>

          </div>

          <div className="edit-profile-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
};

export default EditProfile;
