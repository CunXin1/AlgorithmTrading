// ------------------------------------------------------------
// LoginPage.jsx
// ------------------------------------------------------------
// Login page using AuthContext for authentication
// ------------------------------------------------------------

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ensureCSRF } from "../api/authService";
import "../styles/registerpage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
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

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleLogin}>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">AlgorithmTrading</p>

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
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
        />

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-primary" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>

        <Link to="/register" className="auth-link">
          Create an account
        </Link>
      </form>
    </div>
  );
}
