import { useState, useEffect } from "react";
import "../styles/registerpage.css";
import { ENDPOINTS } from "../api/config";
import { getCSRFToken } from "../utils/csrf";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /* Fetch CSRF token on mount */
  useEffect(() => {
    fetch(ENDPOINTS.CSRF, { credentials: "include" }).catch(() => {});
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const csrfToken = getCSRFToken();
      const res = await fetch(ENDPOINTS.AUTH_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      const resMe = await fetch(ENDPOINTS.AUTH_ME, {
        credentials: "include",
      });
      const me = await resMe.json();

      window.location.href = "/dashboard";

    } catch (e) {
      setError(e.message);
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
        />

        <input
          className="auth-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-primary" type="submit">
          Login
        </button>

        <div
          className="auth-link"
          onClick={() => (window.location.href = "/register")}
        >
          Create an account
        </div>
      </form>
    </div>
  );
}
