// src/components/SignOutButton.jsx
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { COLORS } from "../theme/colors";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut(auth)}
      style={{
        fontSize: "13px",
        border: `1px solid ${COLORS.border}`,
        borderRadius: "8px",
        padding: "6px 12px",
        cursor: "pointer",
        background: "none",
        color: COLORS.textMuted,
      }}
    >
      Sign out
    </button>
  );
}
