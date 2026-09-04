// ===========================================================================
// src/pages/Settings.jsx
// Account-level preferences. Currently just the email notification toggle,
// which Phase 2's scheduled function reads to decide who gets the daily
// digest. Per-reminder opt-out is planned for v1.5.
// ===========================================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile, setNotifyByEmail } from "../firebase/userProfile";
import SignOutButton from "../components/SignOutButton";
import LoadingScreen from "../components/LoadingScreen";
import { COLORS } from "../theme/colors";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid)
      .then((p) => {
        // A missing profile shouldn't happen (AuthContext creates one on
        // sign-in) but default to the same value upsert would have written.
        setEnabled(p?.notifyByEmail !== false);
      })
      .catch((e) => {
        console.error(e);
        setError("Could not load your settings.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function toggle() {
    const next = !enabled;
    setEnabled(next); // optimistic — the switch responds immediately
    setSaving(true);
    setError("");
    try {
      await setNotifyByEmail(user.uid, next);
    } catch (e) {
      console.error(e);
      setEnabled(!next); // roll back so the UI never lies about what's saved
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen message="Loading settings…" />;

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "16px",
        fontFamily: "Noto Sans Tamil, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <button
          onClick={() => navigate("/reminders/list")}
          style={{
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "6px 12px",
            cursor: "pointer",
            background: "none",
          }}
        >
          ✕ Close
        </button>
        <SignOutButton />
      </div>

      <h2 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "16px" }}>
        Settings
      </h2>

      <div
        style={{
          border: `1px solid ${COLORS.borderSoft}`,
          borderRadius: "10px",
          padding: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>
            Email reminders
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "3px" }}>
            A single morning email listing anything happening that day, sent to{" "}
            {user?.email}.
          </div>
        </div>

        <button
          onClick={toggle}
          disabled={saving}
          aria-pressed={enabled}
          style={{
            width: "48px",
            height: "28px",
            flexShrink: 0,
            borderRadius: "999px",
            border: "none",
            cursor: saving ? "default" : "pointer",
            background: enabled ? COLORS.primary : "#ccc",
            position: "relative",
            transition: "background 0.15s",
            opacity: saving ? 0.6 : 1,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "3px",
              left: enabled ? "23px" : "3px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#fff",
              transition: "left 0.15s",
            }}
          />
        </button>
      </div>

      {error && (
        <p style={{ color: "#c00", fontSize: "13px", marginTop: "10px" }}>
          {error}
        </p>
      )}

      <p style={{ fontSize: "12px", color: "#999", marginTop: "14px" }}>
        Turning this off stops all reminder emails. Your reminders and the
        in-app calendar are unaffected.
      </p>
    </div>
  );
}
