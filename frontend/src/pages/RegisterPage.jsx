// ------------------------------------------------------------
// RegisterPage.jsx
// ------------------------------------------------------------
// Registration page using authService for API calls
// ------------------------------------------------------------

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ensureCSRF, sendCode, register } from "../api/authService";
import "../styles/registerpage.css";

const DEFAULT_AVATAR = "/assets/defaultprofile.png";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  const [avatarBase64, setAvatarBase64] = useState("");
  const fileInputRef = useRef(null);

  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  const { refreshUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Fetch CSRF token on mount
  useEffect(() => {
    ensureCSRF().catch(() => {});
  }, []);

  /* -----------------------------
     Handle avatar upload
     ----------------------------- */
  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to 128x128
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");

        // Calculate crop to make it square
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        ctx.drawImage(img, x, y, size, size, 0, 0, 128, 128);

        // Get Base64 without data URI prefix
        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");

        setAvatarPreview(dataUrl);
        setAvatarBase64(base64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* -----------------------------
     Password validation
     ----------------------------- */
  function validPassword(pw) {
    if (pw.length < 6) return false;
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    return hasLetter && hasNumber;
  }

  /* -----------------------------
     Countdown timer
     ----------------------------- */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* -----------------------------
     Send verification code
     ----------------------------- */
  async function handleSendCode() {
    setError("");
    if (!email) {
      setError("Please enter email first");
      return;
    }

    setSending(true);
    try {
      await sendCode(email);
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  /* -----------------------------
     Register
     ----------------------------- */
  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!email || !username || !password || !confirm || !code) {
      setError("All fields are required");
      return;
    }

    if (!validPassword(password)) {
      setError("Password must be ≥6 characters and include letters + numbers");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email,
        username,
        firstName,
        lastName,
        password,
        confirmPassword: confirm,
        code,
        avatar: avatarBase64,
      });

      // Refresh user state after successful registration
      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleRegister}>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">AlgorithmTrading</p>

        {/* Avatar upload */}
        <div className="avatar-upload" onClick={handleAvatarClick}>
          <img
            src={avatarPreview}
            alt="Avatar"
            className="avatar-preview"
          />
          <div className="avatar-overlay">
            <span>📷</span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        <div className="name-row">
          <input
            className="auth-input"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={submitting}
          />
          <input
            className="auth-input"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={submitting}
          />
        </div>

        <input
          className="auth-input"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
        />

        <input
          className="auth-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={submitting}
        />

        <input
          className="auth-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
        />

        <input
          className="auth-input"
          placeholder="Confirm Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={submitting}
        />

        <div className="code-row">
          <input
            className="auth-input"
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={submitting}
          />
          <button
            type="button"
            className="code-btn"
            onClick={handleSendCode}
            disabled={sending || countdown > 0 || submitting}
          >
            {countdown > 0 ? `${countdown}s` : "Send Code"}
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Account"}
        </button>

        <Link to="/login" className="auth-link">
          Already have an account?
        </Link>
      </form>
    </div>
  );
}
