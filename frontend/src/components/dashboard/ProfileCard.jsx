// ------------------------------------------------------------
// ProfileCard.jsx
// ------------------------------------------------------------
// User profile display and editing component
// ------------------------------------------------------------

import React, { useEffect, useState } from "react";
import { ENDPOINTS } from "../../api/config";
import { getCSRFToken } from "../../utils/csrf";

export default function ProfileCard() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newAvatarBase64, setNewAvatarBase64] = useState(null);
  const [error, setError] = useState("");

  // Convert base64 to display URL
  function base64ToDataUrl(base64) {
    if (!base64) return "/assets/defaultprofile.png";
    return `data:image/png;base64,${base64}`;
  }

  // Convert file to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove data:image/xxx;base64, prefix
        const result = reader.result;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ------------------------------
     Load profile
     ------------------------------ */
  useEffect(() => {
    fetch(ENDPOINTS.PROFILE, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Not logged in");
        const data = await res.json();

        setUsername(data.username);
        setNewUsername(data.username);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setNewFirstName(data.first_name || "");
        setNewLastName(data.last_name || "");
        setAvatar(base64ToDataUrl(data.avatar));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  /* ------------------------------
     Save profile
     ------------------------------ */
  async function handleSave() {
    setError("");

    const body = {
      username: newUsername,
      first_name: newFirstName,
      last_name: newLastName,
    };
    if (newAvatarBase64) {
      body.avatar = newAvatarBase64;
    }

    try {
      const csrfToken = getCSRFToken();
      const res = await fetch(ENDPOINTS.PROFILE, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        await res.text(); // prevent HTML error
        throw new Error("Profile update failed");
      }

      const data = await res.json();

      setUsername(data.username);
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setNewFirstName(data.first_name || "");
      setNewLastName(data.last_name || "");
      setAvatar(base64ToDataUrl(data.avatar));
      setNewAvatarBase64(null);
      setEditing(false);

    } catch (e) {
      setError(e.message);
    }
  }


  if (loading) {
    return (
      <div className="dash-card">
        <div className="profile-loading">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">Profile</h3>

      </div>

      <div className="profile-body">
        <div className="profile-avatar-wrapper">
          <img
            src={avatar}
            alt="avatar"
            className="profile-avatar"
          />

          {editing && (
            <div
              className="profile-avatar-overlay"
              onClick={() =>
                document.getElementById("avatar-input").click()
              }
            >
              Change
            </div>
          )}
        </div>
        {/* Hidden file input */}
        {editing && (
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const base64 = await fileToBase64(file);
              setNewAvatarBase64(base64);
              setAvatar(`data:image/png;base64,${base64}`);
            }}
          />
        )}

        <div className="profile-info">
          {!editing ? (
            <>
              <div className="profile-name">
                {firstName || lastName
                  ? `${firstName} ${lastName}`.trim()
                  : username}
              </div>
              <div className="profile-username">@{username}</div>
            </>
          ) : (
            <div className="profile-edit">
              <div className="dash-name-row">
                <label className="dash-label">
                  First Name
                  <input
                    className="dash-input"
                    value={newFirstName}
                    onChange={(e) =>
                      setNewFirstName(e.target.value)
                    }
                  />
                </label>
                <label className="dash-label">
                  Last Name
                  <input
                    className="dash-input"
                    value={newLastName}
                    onChange={(e) =>
                      setNewLastName(e.target.value)
                    }
                  />
                </label>
              </div>
              <label className="dash-label">
                Username
                <input
                  className="dash-input"
                  value={newUsername}
                  onChange={(e) =>
                    setNewUsername(e.target.value)
                  }
                />
              </label>

              {error && (
                <div className="profile-error">
                  {error}
                </div>
              )}

              <div className="dash-btn-row">
                <button
                  className="dash-btn primary"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="dash-btn"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        {!editing && (<button className="dash-btn" onClick={() => setEditing(true)}>
          Edit</button>
        )}
      </div>
    </div>
  );
}
