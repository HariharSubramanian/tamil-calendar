import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/config";

export default function LoginPage() {
  const [error, setError] = useState("");
  const signIn = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      setError("Sign-in failed: " + e.message);
    }
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "16px",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: 500 }}>
        Tamil Calendar Alerts
      </h1>
      <p style={{ color: "#666" }}>Sign in to manage your festival alerts</p>
      <button
        onClick={signIn}
        style={{
          padding: "12px 24px",
          fontSize: "15px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          cursor: "pointer",
          background: "#fff",
          fontWeight: 500,
        }}
      >
        Sign in with Google
      </button>
      {error && <p style={{ color: "#c00", fontSize: "13px" }}>{error}</p>}
    </div>
  );
}
