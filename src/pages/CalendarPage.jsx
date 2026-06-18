import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";

export default function CalendarPage() {
  const { user } = useAuth();
  return (
    <div style={{ padding: "20px" }}>
      <h1>Tamil Calendar</h1>
      <p>Signed in as {user?.email}</p>
      <button onClick={() => signOut(auth)}>Sign out</button>
    </div>
  );
}
