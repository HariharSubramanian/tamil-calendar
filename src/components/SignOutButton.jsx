// src/components/SignOutButton.jsx
// The ONE sign-out button used on every page. Same design, same behavior.

import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut(auth)}
      style={{
        fontSize: "12px",
        color: "#666",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "6px 12px",
        cursor: "pointer",
        background: "none",
        fontFamily: "inherit",
      }}
    >
      Sign out
    </button>
  );
}
