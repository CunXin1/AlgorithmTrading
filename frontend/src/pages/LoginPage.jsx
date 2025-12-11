import { useState } from "react";
import AuthCard from "../components/AuthCard";
import { login } from "../services/authService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function handleLogin() {
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.token);
      window.location.href = "/"; // 登录成功跳转首页
    } catch (e) {
      setErr("Invalid email or password");
    }
  }

  return (
    <AuthCard title="Sign in" subtitle="to AlgorithmTrading">
      <input
        className="auth-input"
        placeholder="Email"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="auth-input"
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      {err && <div style={{ color: "red", marginBottom: 10 }}>{err}</div>}

      <button className="auth-button" onClick={handleLogin}>
        Sign In
      </button>

      <div
        className="auth-link"
        onClick={() => (window.location.href = "/register")}
      >
        Create account
      </div>
    </AuthCard>
  );
}
