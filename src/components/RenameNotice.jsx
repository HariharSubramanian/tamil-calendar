// ===========================================================================
// src/components/RenameNotice.jsx
// Shows a one-time banner ONLY to users running the installed (home-screen) PWA,
// telling them the app was renamed and how to refresh the name (remove + re-add).
// Browser-tab visitors never see it. Dismissed permanently once closed.
//
// TEMPORARY: only useful for users who installed BEFORE the rename.
// Plan to remove this component (and its <RenameNotice/> usage) a few weeks out.
// ===========================================================================

import { useState, useEffect } from "react";
import { COLORS } from "../theme/colors";

const APP_NAME = "நினைவூட்டல்கள் (Ninaivootal)";
const DISMISS_KEY = "rename-notice-dismissed-v1";

// Stop showing the notice after this date — by then existing users have
// had time to re-add, and new installs already have the correct name.
// Set this to ~3-4 weeks after you deploy the rename.
const SHOW_UNTIL = new Date("2026-07-31T23:59:59");

function isInstalledPWA() {
  const standalone =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    typeof window !== "undefined" && window.navigator.standalone === true;
  return Boolean(standalone || iosStandalone);
}

export default function RenameNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      dismissed = true; // localStorage unavailable — just don't show
    }
    if (isInstalledPWA() && !dismissed && new Date() < SHOW_UNTIL)
      setShow(true);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore — worst case it shows again next launch */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      style={{
        background: COLORS.primaryBg,
        borderBottom: `1px solid ${COLORS.primary}33`,
        padding: "10px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        fontFamily: "Noto Sans Tamil, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          flex: 1,
          fontSize: "12.5px",
          color: COLORS.navy,
          lineHeight: 1.5,
        }}
      >
        This app is now called <strong>{APP_NAME}</strong>. To update the name
        on your home screen, remove this app’s icon and add it again from the
        site.
        <span
          style={{
            display: "block",
            marginTop: "4px",
            color: COLORS.textMuted,
            fontSize: "11.5px",
          }}
        >
          Already showing the new name? You can ignore this.
        </span>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          fontSize: "12px",
          fontWeight: 600,
          color: COLORS.primary,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0 4px",
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
