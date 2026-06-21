// ===========================================================================
// src/components/RenameNotice.jsx  — TEST MODE
// Currently shows a TEST banner to confirm installed-PWA detection works.
// Browser-tab visitors should NOT see it; only the installed (home-screen) app.
// Once detection is confirmed, replace the test text with the real rename notice.
// ===========================================================================

import { useState, useEffect } from "react";
import { COLORS } from "../theme/colors";

const DISMISS_KEY = "pwa-test-banner-dismissed-v1";

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
      dismissed = true;
    }
    if (isInstalledPWA() && !dismissed) setShow(true);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
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
          lineHeight: 1.45,
        }}
      >
        ✅ <strong>Test banner:</strong> you’re viewing the installed app (PWA
        standalone mode). If you only see this in the home-screen app and NOT in
        a browser tab, detection works.
      </div>
      <button
        onClick={dismiss}
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
