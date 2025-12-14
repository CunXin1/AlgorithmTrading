import { useEffect, useState } from "react";
import "../styles/registerpage.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");

  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

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
      const res = await fetch("/api/auth/send-code/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");

      setCountdown(60);
    } catch (e) {
      setError(e.message);
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

    try {
      const res = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          username,
          password,
          confirm_password: confirm,
          code,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Register failed");

      // ✅ 注册成功 → Dashboard
      window.location.href = `/dashboard/${username}`;
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleRegister}>
        <h1 className="auth-title">Create account</h1>
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
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Confirm Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <div className="code-row">
          <input
            className="auth-input"
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            type="button"
            className="code-btn"
            onClick={handleSendCode}
            disabled={sending || countdown > 0}
          >
            {countdown > 0 ? `${countdown}s` : "Send Code"}
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-primary" type="submit">
          Create Account
        </button>

        <div
          className="auth-link"
          onClick={() => (window.location.href = "/login")}
        >
          Already have an account?
        </div>
      </form>
    </div>
  );
}
