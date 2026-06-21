// ===========================================================================
// src/components/LoadingScreen.jsx
// Branded loading state: app icon with a spinning ring (logo blue palette).
// If loading exceeds `timeoutMs`, shows a "Couldn't load — Retry" message.
// ===========================================================================

import { useState, useEffect } from "react";
import { COLORS } from "../theme/colors";

export default function LoadingScreen({
  onRetry,
  timeoutMs = 12000,
  message = "Loading…",
}) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(t);
  }, [timeoutMs]);

  const wrap = {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    fontFamily: "Noto Sans Tamil, system-ui, sans-serif",
    padding: "24px",
    textAlign: "center",
  };

  if (timedOut) {
    return (
      <div style={wrap}>
        <div style={{ fontSize: "15px", fontWeight: 500, color: COLORS.text }}>
          Couldn’t load your reminders
        </div>
        <div
          style={{
            fontSize: "13px",
            color: COLORS.textMuted,
            maxWidth: "260px",
          }}
        >
          This is taking longer than usual. Please check your connection and try
          again.
        </div>
        <button
          onClick={() => (onRetry ? onRetry() : window.location.reload())}
          style={{
            marginTop: "4px",
            fontSize: "14px",
            background: COLORS.primary,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ↻ Retry
        </button>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ position: "relative", width: "72px", height: "72px" }}>
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            animation: "tcSpin 1.1s linear infinite",
          }}
        >
          <circle
            cx="36"
            cy="36"
            r="32"
            fill="none"
            stroke={COLORS.primaryBg}
            strokeWidth="5"
          />
          <circle
            cx="36"
            cy="36"
            r="32"
            fill="none"
            stroke={COLORS.primary}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="50 200"
          />
        </svg>
        <img
          src="/icons/icon-192.png"
          alt="Tamil Calendar"
          width="44"
          height="44"
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            borderRadius: "10px",
          }}
        />
      </div>
      <div style={{ fontSize: "13px", color: COLORS.textMuted }}>{message}</div>
      <style>{`@keyframes tcSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
