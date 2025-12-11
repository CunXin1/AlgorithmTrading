import { useState } from "react";
import AuthCard from "../components/AuthCard";
import { register } from "../services/authService";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function handleRegister() {
    console.log("EMAIL_BEFORE_SEND:", email);
    console.log("PASSWORD_BEFORE_SEND:", password);
    try {
      await register(email, password);
      window.location.href = "/login"; // 注册成功跳转登录页
    } catch (e) {
      setErr("Email already exists");
    }
  }

  return (
    <AuthCard title="Create account" subtitle="for AlgorithmTrading">
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

      <button className="auth-button" onClick={handleRegister}>
        Create Account
      </button>

      <div
        className="auth-link"
        onClick={() => (window.location.href = "/login")}
      >
        Already have an account?
      </div>
    </AuthCard>
  );
}
