import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
verifyEmail,
resendOTP,
} from "../services/authService";

function VerifyEmail() {
const navigate = useNavigate();
const location = useLocation();

// Email passed from Register page
const email = location.state?.email || "";

const [otp, setOtp] = useState("");
const [error, setError] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

const handleVerify = async (e) => {
e.preventDefault();


setError("");
setMessage("");

if (otp.length !== 6) {
  setError("Please enter the 6-digit OTP");
  return;
}

setLoading(true);

try {
  await verifyEmail({
    email,
    otp,
  });

  setMessage("Email verified successfully!");

  setTimeout(() => {
    navigate("/login");
  }, 1000);
} catch (error) {
  setError(error.message);
} finally {
  setLoading(false);
}


};

const handleResend = async () => {
setError("");
setMessage("");


try {
  const data = await resendOTP({
    email,
  });

  setMessage(data.message);
} catch (error) {
  setError(error.message);
}


};

return ( <main className="auth-page"> <div className="auth-card verify-card">


    {/* BRAND */}
    <div className="auth-brand">
      <span>Threadly</span>
    </div>

    {/* ICON */}
    <div className="verify-icon">
      ✉️
    </div>

    <h1>Verify your email</h1>

    <p className="auth-subtitle">
      We've sent a 6-digit verification code
      to your email address.
    </p>

    {/* EMAIL */}
    <div className="verify-email-box">
      <span>Verification code sent to</span>

      <strong>
        {email || "your email"}
      </strong>
    </div>

    {/* ERROR */}
    {error && (
      <div className="auth-error">
        {error}
      </div>
    )}

    {/* SUCCESS */}
    {message && (
      <div className="auth-success">
        {message}
      </div>
    )}

    {/* OTP FORM */}
    <form
      className="auth-form"
      onSubmit={handleVerify}
    >
      <div className="auth-field">
        <label htmlFor="otp">
          Enter verification code
        </label>

        <input
          id="otp"
          className="otp-input"
          type="text"
          inputMode="numeric"
          maxLength="6"
          placeholder="000000"
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value.replace(/\D/g, "")
            )
          }
          autoComplete="one-time-code"
        />
      </div>

      <button
        className="auth-submit"
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Verifying..."
          : "Verify Email"}
      </button>
    </form>

    {/* RESEND */}
    <div className="verify-resend">
      <span>
        Didn't receive the code?
      </span>

      <button
        type="button"
        onClick={handleResend}
      >
        Resend OTP
      </button>
    </div>

    {/* BACK */}
    <button
      className="verify-back"
      type="button"
      onClick={() => navigate("/login")}
    >
      ← Back to Login
    </button>

  </div>
</main>


);
}

export default VerifyEmail;
