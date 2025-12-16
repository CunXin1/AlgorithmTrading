import { useState } from "react";
import "../styles/registerpage.css";

const API_BASE = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetchJSON(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      const resMe = await fetchJSON(`${API_BASE}/api/auth/me/`, {
        credentials: "include",
      });
      const me = await resMe.json();

      window.location.href = `/dashboard/${me.username}`;

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
