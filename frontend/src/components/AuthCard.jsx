import "../styles/auth.css";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-title">{title}</div>
        <div className="auth-subtitle">{subtitle}</div>

        {children}
      </div>
    </div>
  );
}
