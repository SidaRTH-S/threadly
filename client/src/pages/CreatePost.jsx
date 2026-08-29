import { useState } from "react";
import {
useNavigate,
useSearchParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { createPost } from "../services/postService";

const CreatePost = () => {
const { token } = useAuth();
const navigate = useNavigate();
const [searchParams] = useSearchParams();

const communityFromUrl =
searchParams.get("community") || "";

const [formData, setFormData] = useState({
community: "",
title: "",
content: "",
postType: "text",
linkUrl: "",
imageUrl: "",
});

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleChange = (e) => {
const { name, value } = e.target;

setFormData((prev) => ({
  ...prev,
  [name]: value,
}));

};

const handleSubmit = async (e) => {
e.preventDefault();

setError("");

const communityName =
  communityFromUrl || formData.community;

if (!communityName.trim()) {
  setError("Community name is required");
  return;
}

if (!formData.title.trim()) {
  setError("Post title is required");
  return;
}

if (
  formData.postType === "link" &&
  !formData.linkUrl.trim()
) {
  setError("Link URL is required");
  return;
}

if (
  formData.postType === "image" &&
  !formData.imageUrl.trim()
) {
  setError("Image URL is required");
  return;
}

try {
  setLoading(true);

  const data = await createPost(
    {
      community: communityName.trim(),
      title: formData.title.trim(),
      content: formData.content.trim(),
      postType: formData.postType,
      linkUrl: formData.linkUrl.trim(),
      imageUrl: formData.imageUrl.trim(),
    },
    token
  );

  console.log("Post created:", data.post);

  navigate("/");
} catch (error) {
  console.error(error);
  setError(error.message);
} finally {
  setLoading(false);
}

};

return ( <main className="create-post-page">

  <div className="create-post-container">

  {/* BACK BUTTON */}

  <button
      type="button"
      className="back-button"
      onClick={() => navigate(-1)}

      >
      ← Back
    </button>
    {/* HEADER */}

    <div className="create-post-header">
      <h1>Create a post</h1>

      <p>
        Share something with the Threadly
        community.
      </p>
    </div>

    {/* ERROR */}

    {error && (
      <div className="create-post-error">
        ⚠️ {error}
      </div>
    )}

    {/* FORM CARD */}

    <form
      className="create-post-form"
      onSubmit={handleSubmit}
    >

      {/* COMMUNITY */}

      <div className="form-group">
        <label>Community</label>

        {communityFromUrl ? (
          <div className="community-selected">
            <span>🏘️</span>

            <div>
              <small>Posting in</small>

              <strong>
                r/{communityFromUrl}
              </strong>
            </div>
          </div>
        ) : (
          <input
            type="text"
            name="community"
            placeholder="e.g. programming"
            value={formData.community}
            onChange={handleChange}
          />
        )}
      </div>

      {/* POST TYPE */}

      <div className="form-group">
        <label>Post type</label>

        <div className="post-type-selector">

          <button
            type="button"
            className={
              formData.postType === "text"
                ? "type-option active"
                : "type-option"
            }
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                postType: "text",
              }))
            }
          >
            📝
            <span>Text</span>
          </button>

          <button
            type="button"
            className={
              formData.postType === "link"
                ? "type-option active"
                : "type-option"
            }
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                postType: "link",
              }))
            }
          >
            🔗
            <span>Link</span>
          </button>

          <button
            type="button"
            className={
              formData.postType === "image"
                ? "type-option active"
                : "type-option"
            }
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                postType: "image",
              }))
            }
          >
            🖼️
            <span>Image</span>
          </button>

        </div>
      </div>

      {/* TITLE */}

      <div className="form-group">
        <label htmlFor="post-title">
          Title
        </label>

        <input
          id="post-title"
          type="text"
          name="title"
          placeholder="Give your post a title"
          value={formData.title}
          onChange={handleChange}
        />
      </div>

      {/* CONTENT */}

      <div className="form-group">
        <label htmlFor="post-content">
          Content
        </label>

        <textarea
          id="post-content"
          name="content"
          placeholder="What's on your mind?"
          value={formData.content}
          onChange={handleChange}
          rows={8}
        />

        <span className="form-hint">
          You can add text, links, or images
          depending on the post type.
        </span>
      </div>

      {/* LINK */}

      {formData.postType === "link" && (
        <div className="form-group">
          <label htmlFor="link-url">
            Link URL
          </label>

          <input
            id="link-url"
            type="url"
            name="linkUrl"
            placeholder="https://example.com"
            value={formData.linkUrl}
            onChange={handleChange}
          />
        </div>
      )}

      {/* IMAGE */}

      {formData.postType === "image" && (
        <div className="form-group">
          <label htmlFor="image-url">
            Image URL
          </label>

          <input
            id="image-url"
            type="url"
            name="imageUrl"
            placeholder="https://example.com/image.jpg"
            value={formData.imageUrl}
            onChange={handleChange}
          />

          {formData.imageUrl && (
            <div className="image-preview">
              <img
                src={formData.imageUrl}
                alt="Preview"
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ACTIONS */}

      <div className="create-post-actions">

        <button
          type="button"
          className="cancel-post-button"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="submit-post-button"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "🚀 Create Post"}
        </button>

      </div>

    </form>

  </div>

</main>

);
};

export default CreatePost;
