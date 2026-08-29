import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";

function Register() {
const navigate = useNavigate();

const [formData, setFormData] = useState({
username: "",
email: "",
password: "",
});

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value,
});
};

const handleSubmit = async (e) => {
e.preventDefault();


setError("");
setLoading(true);

try {
  await registerUser(formData);

  navigate("/verify-email", {
    state: {
      email: formData.email,
    },
  });
} catch (error) {
  setError(error.message);
} finally {
  setLoading(false);
}


};

return ( <main className="auth-page"> <div className="auth-card">


    <div className="auth-brand">
      <span>Threadly</span>
    </div>

    <h1>Create your account</h1>

    <p className="auth-subtitle">
      Join the conversation on Threadly
    </p>

    {error && (
      <div className="auth-error">
        {error}
      </div>
    )}

    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >
      <div className="auth-field">
        <label htmlFor="register-username">
          Username
        </label>

        <input
          id="register-username"
          type="text"
          name="username"
          placeholder="Choose a username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

      <div className="auth-field">
        <label htmlFor="register-email">
          Email
        </label>

        <input
          id="register-email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="auth-field">
        <label htmlFor="register-password">
          Password
        </label>

        <input
          id="register-password"
          type="password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <button
        className="auth-submit"
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Creating account..."
          : "Create account"}
      </button>
    </form>

    <div className="auth-divider">
      <span>OR</span>
    </div>

    <p className="auth-switch">
      Already have an account?
      <button
        type="button"
        onClick={() =>
          navigate("/login")
        }
      >
        Login
      </button>
    </p>

  </div>
</main>

);
}

export default Register;
