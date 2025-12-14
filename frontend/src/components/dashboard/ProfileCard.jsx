// components/dashboard/ProfileCard.jsx

import React, { useEffect, useState } from "react";


export default function ProfileCard() {
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [newAvatar, setNewAvatar] = useState(null);
    const [error, setError] = useState("");


    const API_BASE = import.meta.env.VITE_API_URL;


    function getCSRFToken() {
        const name = "csrftoken=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(";");
        for (let c of cookies) {
            c = c.trim();
            if (c.startsWith(name)) {
                return c.substring(name.length);
            }
        }
        return null;
    }


    /* ------------------------------
       Load profile
       ------------------------------ */
    useEffect(() => {
        fetch("/api/auth/me/", {
            credentials: "include",
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Not logged in");
                const data = await res.json();

                setUsername(data.username);
                setNewUsername(data.username);
                setAvatar(
                    data.avatar_url || "/assets/defaultprofile.png"
                );
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    /* ------------------------------
       Save profile
       ------------------------------ */
    async function handleSave() {
        setError("");

        const form = new FormData();
        form.append("username", newUsername);
        if (newAvatar) {
            form.append("avatar", newAvatar);
        }

        try {
            const res = await fetch("/api/core/profile/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                },
                body: form,
            });

            // ❗先判断 res.ok
            if (!res.ok) {
                const text = await res.text(); // 防止 HTML 炸 json
                throw new Error("Profile update failed");
            }

            const data = await res.json();

            setUsername(data.username);
            setAvatar(
                data.avatar
                    ? `${API_BASE}${data.avatar}?t=${Date.now()}`
                    : "/assets/defaultprofile.png"
            );

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
                <img
                    src={avatar}
                    alt="avatar"
                    className="profile-avatar"
                />

                <div className="profile-info">
                    {!editing ? (
                        <>
                            <div className="profile-name">{username}</div>
                            <div className="profile-sub">
                                Personal profile
                            </div>
                        </>
                    ) : (
                        <div className="profile-edit">
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

                            <label className="dash-label">
                                Avatar
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setNewAvatar(e.target.files[0])
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
