import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { upsertUserProfile } from "../firebase/userProfile";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);

      // Fire-and-forget: create or refresh the users/{uid} profile document.
      // Deliberately NOT awaited — the app must render immediately on sign-in,
      // and a slow or failed Firestore write should never block the UI.
      if (u) {
        upsertUserProfile(u).catch((err) =>
          console.error("upsertUserProfile failed:", err),
        );
      }
    });
    return () => unsub();
  }, []);
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
