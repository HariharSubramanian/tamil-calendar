// ===========================================================================
// src/pages/AddReminder.jsx
// UI ONLY — add a reminder of type DOB or Tamil (star) birthday.
//   DOB:   day + month mandatory, year optional (shows age).
//   Tamil: Tamil month + star mandatory.
// Stores the DEFINITION so it recurs every year forever.
// ===========================================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { NAKSHATRAS, NAK_TAMIL_TO_SCRIPT } from "../data/nakshatras";
import { TAMIL_MONTHS, MONTH_TAMIL_TO_SCRIPT } from "../data/tamilMonths";
import {
  addReminder,
  listReminders,
  deleteReminder,
} from "../firebase/reminders";
import { resolveReminderDate } from "../utils/reminderDates";
import SignOutButton from "../components/SignOutButton";

const input = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "14px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  marginTop: "4px",
  fontFamily: "Noto Sans Tamil, system-ui, sans-serif",
};
const label = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#444",
  marginTop: "12px",
  display: "block",
};

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AddReminder() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState("dob"); // "dob" | "tamil"
  const [label_, setLabel] = useState("");
  // DOB fields
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("1");
  const [year, setYear] = useState("");
  // Tamil fields
  const [tamilMonth, setTamilMonth] = useState(TAMIL_MONTHS[0].tamil);
  const [tamilStar, setTamilStar] = useState(NAKSHATRAS[0].tamil);
  // Common
  const [alertMessage, setAlertMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [list, setList] = useState([]);

  async function refresh() {
    if (!user) return;
    try {
      setList(await listReminders(user.uid));
    } catch (e) {
      console.error(e);
    }
  }
  useEffect(() => {
    refresh();
  }, [user]);

  async function handleSave() {
    setError("");
    if (!label_.trim()) {
      setError("Please enter a label / name.");
      return;
    }

    let payload;
    if (type === "dob") {
      const d = parseInt(day, 10);
      const m = parseInt(month, 10);
      if (!d || d < 1 || d > 31) {
        setError("Please enter a valid day (1–31).");
        return;
      }
      if (!m || m < 1 || m > 12) {
        setError("Please choose a month.");
        return;
      }
      payload = {
        type: "dob",
        label: label_.trim(),
        day: d,
        month: m,
        year: year ? parseInt(year, 10) : null,
        alertMessage: alertMessage.trim() || `${label_.trim()}'s birthday!`,
      };
    } else {
      if (!tamilMonth || !tamilStar) {
        setError("Please choose Tamil month and star.");
        return;
      }
      payload = {
        type: "tamil",
        label: label_.trim(),
        tamilMonth,
        tamilStar,
        alertMessage:
          alertMessage.trim() || `${label_.trim()}'s star birthday!`,
      };
    }

    setSaving(true);
    try {
      await addReminder(user.uid, payload);
      // reset
      setLabel("");
      setDay("");
      setMonth("1");
      setYear("");
      setAlertMessage("");
      await refresh();
    } catch (e) {
      console.error(e);
      setError("Could not save. " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteReminder(user.uid, id);
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  // Show this year's resolved date in the saved list.
  function describeDate(r) {
    const iso = resolveReminderDate(r, new Date().getFullYear());
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
    });
  }

  const typeBtn = (val, text) => (
    <button
      onClick={() => setType(val)}
      style={{
        flex: 1,
        padding: "10px",
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        border: type === val ? "2px solid #8B0000" : "1px solid #ddd",
        background: type === val ? "#fff0f0" : "#fff",
        color: type === val ? "#8B0000" : "#666",
        borderRadius: "8px",
      }}
    >
      {text}
    </button>
  );

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "16px",
        fontFamily: "Noto Sans Tamil, system-ui, sans-serif",
      }}
    >
      {/* Header bar: Close + Sign out (consistent across pages) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <button
          onClick={() => navigate("/calendar")}
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

      <h2 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "12px" }}>
        Add a Reminder
      </h2>

      {/* Type chooser */}
      <div style={{ display: "flex", gap: "8px" }}>
        {typeBtn("dob", "Date of Birth")}
        {typeBtn("tamil", "Tamil (Star) Birthday")}
      </div>

      <label style={label}>Name / Label</label>
      <input
        style={input}
        value={label_}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g. Amma"
      />

      {type === "dob" ? (
        <>
          <label style={label}>Day & Month (required)</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              style={{ ...input, flex: 1 }}
              type="number"
              min="1"
              max="31"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="Day"
            />
            <select
              style={{ ...input, flex: 2 }}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {MONTHS_EN.map((mn, i) => (
                <option key={mn} value={i + 1}>
                  {mn}
                </option>
              ))}
            </select>
          </div>
          <label style={label}>Birth Year (optional — shows age)</label>
          <input
            style={input}
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 1990"
          />
        </>
      ) : (
        <>
          <label style={label}>Tamil Month (required)</label>
          <select
            style={input}
            value={tamilMonth}
            onChange={(e) => setTamilMonth(e.target.value)}
          >
            {TAMIL_MONTHS.map((m) => (
              <option key={m.tamil} value={m.tamil}>
                {m.tamil} / {MONTH_TAMIL_TO_SCRIPT[m.tamil]}
              </option>
            ))}
          </select>
          <label style={label}>Star / Nakshatram (required)</label>
          <select
            style={input}
            value={tamilStar}
            onChange={(e) => setTamilStar(e.target.value)}
          >
            {NAKSHATRAS.map((n) => (
              <option key={n.tamil} value={n.tamil}>
                {n.tamil} / {NAK_TAMIL_TO_SCRIPT[n.tamil]}
              </option>
            ))}
          </select>
        </>
      )}

      <label style={label}>Alert Message (optional)</label>
      <input
        style={input}
        value={alertMessage}
        onChange={(e) => setAlertMessage(e.target.value)}
        placeholder="e.g. Wish Amma!"
      />

      {error && (
        <p style={{ color: "#c00", fontSize: "13px", marginTop: "10px" }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: "16px",
          width: "100%",
          background: "#8B0000",
          color: "#fff",
          border: "none",
          padding: "12px",
          borderRadius: "10px",
          fontSize: "15px",
          fontWeight: 500,
          cursor: saving ? "default" : "pointer",
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? "Saving…" : "Save Reminder"}
      </button>

      <h3
        style={{
          fontSize: "15px",
          fontWeight: 500,
          marginTop: "28px",
          marginBottom: "8px",
        }}
      >
        Saved Reminders
      </h3>
      {list.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#999" }}>
          None yet. Add one above.
        </p>
      ) : (
        list.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: "14px" }}>{r.label}</div>
              <div
                style={{ fontSize: "13px", color: "#8B0000", marginTop: "2px" }}
              >
                {r.type === "tamil"
                  ? `${MONTH_TAMIL_TO_SCRIPT[r.tamilMonth] || r.tamilMonth} · ${NAK_TAMIL_TO_SCRIPT[r.tamilStar] || r.tamilStar}`
                  : "Date of Birth"}
              </div>
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "3px" }}
              >
                This year: {describeDate(r)}
                {r.type === "dob" && r.year
                  ? ` (turning ${new Date().getFullYear() - r.year})`
                  : ""}
              </div>
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              style={{
                fontSize: "12px",
                color: "#999",
                border: "1px solid #eee",
                borderRadius: "6px",
                padding: "4px 8px",
                cursor: "pointer",
                background: "none",
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
