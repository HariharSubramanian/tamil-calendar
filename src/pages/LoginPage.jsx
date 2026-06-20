import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/config";

const FEST = "#8B0000";
const REM = "#0F6E56";

const FEATURES = [
  {
    icon: "🎂",
    en: "Birthday & anniversary reminders",
    ta: "பிறந்தநாள் & ஆண்டுவிழா நினைவூட்டல்",
    desc: "Save any date of birth or anniversary — see the age or years each time",
  },
  {
    icon: "⭐",
    en: "Tamil star (Nakshatram) birthdays",
    ta: "நட்சத்திர பிறந்தநாள் நினைவூட்டல்",
    desc: "Enter the Tamil month & star — the English date is calculated for you",
  },
  {
    icon: "🔁",
    en: "Recurs every year, automatically",
    ta: "ஒவ்வொரு ஆண்டும் தானாக",
    desc: "Dates are recalculated automatically, year after year",
  },
];

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

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
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f4f9ff 0%, #ffffff 40%)",
        fontFamily: "Noto Sans Tamil, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* App identity — uses the real app icon */}
        <div style={{ textAlign: "center" }}>
          <img
            src="/icons/icon-192.png"
            alt="Tamil Calendar"
            width="50"
            height="50"
            style={{
              borderRadius: "16px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.12)",
              display: "block",
              margin: "0 auto",
            }}
          />
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: FEST,
              margin: "12px 0 0",
            }}
          >
            நினைவூட்டல்கள்
          </h1>
          <div
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "#333",
              marginTop: "2px",
            }}
          >
            Date of Birth, Tamil Star Birthday &amp; Anniversary Reminders
          </div>
          <p
            style={{
              fontSize: "13.5px",
              color: "#777",
              marginTop: "10px",
              lineHeight: 1.5,
            }}
          >
            பிறந்தநாள், நட்சத்திர பிறந்தநாள் & ஆண்டு விழா நினைவூட்டல்கள் —
            ஒவ்வொரு ஆண்டும்.
            <br />
            Never miss a date of birth, a star birthday or an Anniversary, year
            after year.
          </p>
        </div>

        {/* Features */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.en}
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                background: "#fff",
                border: "1px solid #eef0f2",
                borderRadius: "12px",
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: "22px", lineHeight: 1 }}>{f.icon}</div>
              <div>
                <div
                  style={{ fontSize: "14px", fontWeight: 600, color: "#222" }}
                >
                  {f.en}
                </div>
                <div style={{ fontSize: "13px", color: REM, marginTop: "1px" }}>
                  {f.ta}
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    color: "#888",
                    marginTop: "3px",
                    lineHeight: 1.4,
                  }}
                >
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sign in — official Google G */}
        <button
          onClick={signIn}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "13px",
            fontSize: "15px",
            borderRadius: "12px",
            border: "1px solid #dadce0",
            cursor: "pointer",
            background: "#fff",
            fontWeight: 500,
            color: "#3c4043",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <GoogleG />
          Sign in with Google
        </button>
        <p
          style={{
            fontSize: "11.5px",
            color: "#aaa",
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          உள்நுழைய Google கணக்கைப் பயன்படுத்தவும் · Uses your Google account
        </p>

        {error && (
          <p
            style={{
              color: "#c00",
              fontSize: "13px",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
