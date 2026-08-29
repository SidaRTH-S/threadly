import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
const navigate = useNavigate();
const { login } = useAuth();

const [formData, setFormData] = useState({
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
  await login(
    formData.email,
    formData.password
  );

  navigate("/");
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

    <h1>Welcome back</h1>

    <p className="auth-subtitle">
      Log in to continue to Threadly
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
        <label htmlFor="login-email">
          Email
        </label>

        <input
          id="login-email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="auth-field">
        <label htmlFor="login-password">
          Password
        </label>

        <input
          id="login-password"
          type="password"
          name="password"
          placeholder="Enter your password"
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
          ? "Logging in..."
          : "Login"}
      </button>
    </form>

    <div className="auth-divider">
      <span>OR</span>
    </div>

    <p className="auth-switch">
      Don't have an account?
      <button
        type="button"
        onClick={() =>
          navigate("/register")
        }
      >
        Create one
      </button>
    </p>

  </div>
</main>

);
}

export default Login;
