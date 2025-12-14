import React, { useEffect, useState } from "react";

const LS_PROFILE_KEY = "dashboard_profile_v1";
const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&s=160";

export default function ProfileCard() {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("User");
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);

  const [draftName, setDraftName] = useState("");
  const [draftAvatar, setDraftAvatar] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_PROFILE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.displayName) setDisplayName(String(parsed.displayName));
      if (parsed?.avatarUrl) setAvatarUrl(String(parsed.avatarUrl));
    } catch {
      // ignore
    }
  }, []);

  function startEdit() {
    setDraftName(displayName);
    setDraftAvatar(avatarUrl);
    setEditing(true);
  }

  function save() {
    const name = String(draftName || "").trim() || "User";
    const avatar = String(draftAvatar || "").trim() || DEFAULT_AVATAR;

    setDisplayName(name);
    setAvatarUrl(avatar);

    try {
      localStorage.setItem(
        LS_PROFILE_KEY,
        JSON.stringify({ displayName: name, avatarUrl: avatar })
      );
    } catch {
      // ignore
    }

    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">Profile</h3>
        {!editing ? (
          <button className="dash-btn" onClick={startEdit} type="button">
            Edit
          </button>
        ) : (
          <div className="dash-btn-row">
            <button className="dash-btn primary" onClick={save} type="button">
              Save
            </button>
            <button className="dash-btn" onClick={cancel} type="button">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="profile-body">
        <img className="profile-avatar" src={avatarUrl} alt="avatar" />
        <div className="profile-info">
          {!editing ? (
            <>
              <div className="profile-name">{displayName}</div>
              <div className="profile-sub">Default avatar & name (UI-only for now)</div>
            </>
          ) : (
            <div className="profile-edit">
              <label className="dash-label">
                Username
                <input
                  className="dash-input"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Your username"
                />
              </label>

              <label className="dash-label">
                Avatar URL
                <input
                  className="dash-input"
                  value={draftAvatar}
                  onChange={(e) => setDraftAvatar(e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <div className="dash-hint">
                后面接后端时：这里改成 PATCH /api/profile/me/
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
