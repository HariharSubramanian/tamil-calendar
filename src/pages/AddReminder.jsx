// ===========================================================================
// src/pages/AddReminder.jsx
// Add OR edit a reminder. Logo-derived blue/navy palette via theme/colors.
//   Add:  /reminders/add        Edit: /reminders/add?edit=<id>
// On success -> /reminders/list.
// ===========================================================================

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { NAKSHATRAS, NAK_TAMIL_TO_SCRIPT } from "../data/nakshatras";
import { TAMIL_MONTHS, MONTH_TAMIL_TO_SCRIPT } from "../data/tamilMonths";
import {
  addReminder,
  getReminder,
  updateReminder,
} from "../firebase/reminders";
import { buildOccurrences } from "../utils/buildOccurrences";
import SignOutButton from "../components/SignOutButton";
import { COLORS } from "../theme/colors";

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
  const [params] = useSearchParams();
  const editId = params.get("edit");

  const [type, setType] = useState("dob");
  const [occasion, setOccasion] = useState("birthday");
  const [label_, setLabel] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("1");
  const [year, setYear] = useState("");
  const [tamilMonth, setTamilMonth] = useState(TAMIL_MONTHS[0].tamil);
  const [tamilStar, setTamilStar] = useState(NAKSHATRAS[0].tamil);
  const [alertMessage, setAlertMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (!editId || !user) return;
    setLoading(true);
    getReminder(user.uid, editId)
      .then((r) => {
        if (!r) {
          setError("Reminder not found.");
          return;
        }
        setType(r.type);
        setLabel(r.label || "");
        setAlertMessage(r.alertMessage || "");
        if (r.type === "dob") {
          setOccasion(r.occasion || "birthday");
          setDay(r.day != null ? String(r.day) : "");
          setMonth(r.month != null ? String(r.month) : "1");
          setYear(r.year != null ? String(r.year) : "");
        } else {
          setTamilMonth(r.tamilMonth || TAMIL_MONTHS[0].tamil);
          setTamilStar(r.tamilStar || NAKSHATRAS[0].tamil);
        }
      })
      .catch((e) => {
        console.error(e);
        setError("Could not load reminder.");
      })
      .finally(() => setLoading(false));
  }, [editId, user]);

  async function handleSave() {
    setError("");
    if (!label_.trim()) {
      setError("Please enter a label / name.");
      return;
    }

    let payload;
    if (type === "dob") {
      const d = parseInt(day, 10);
      const mo = parseInt(month, 10);
      if (!d || d < 1 || d > 31) {
        setError("Please enter a valid day (1–31).");
        return;
      }
      if (!mo || mo < 1 || mo > 12) {
        setError("Please choose a month.");
        return;
      }
      payload = {
        type: "dob",
        occasion,
        label: label_.trim(),
        day: d,
        month: mo,
        year: year ? parseInt(year, 10) : null,
        alertMessage:
          alertMessage.trim() ||
          `${label_.trim()}'s ${occasion === "anniversary" ? "anniversary" : "birthday"}!`,
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
      // Compute the next few occurrence dates and store them alongside the
      // reminder, so Phase 2's scheduled function can query by date without
      // running panchangam calculations server-side. Done inside the try block
      // so the button already reads "Saving…" while this runs — for a Tamil
      // reminder it scans ~a month of days per year, five years over.
      payload.occurrences = buildOccurrences(payload);

      if (editId) await updateReminder(user.uid, editId, payload);
      else await addReminder(user.uid, payload);
      navigate("/reminders/list");
    } catch (e) {
      console.error(e);
      setError("Could not save. " + e.message);
      setSaving(false);
    }
  }

  const typeBtn = (val, text) => (
    <button
      onClick={() => setType(val)}
      disabled={!!editId}
      style={{
        flex: 1,
        padding: "10px",
        fontSize: "13px",
        fontWeight: 500,
        cursor: editId ? "not-allowed" : "pointer",
        border: type === val ? `2px solid ${COLORS.primary}` : "1px solid #ddd",
        background: type === val ? COLORS.primaryBg : "#fff",
        color: type === val ? COLORS.primary : "#666",
        borderRadius: "8px",
        opacity: editId && type !== val ? 0.5 : 1,
      }}
    >
      {text}
    </button>
  );

  const occBtn = (val, text) => (
    <button
      onClick={() => setOccasion(val)}
      style={{
        flex: 1,
        padding: "8px",
        fontSize: "12.5px",
        fontWeight: 500,
        cursor: "pointer",
        border:
          occasion === val ? `2px solid ${COLORS.navy}` : "1px solid #ddd",
        background: occasion === val ? COLORS.navyBg : "#fff",
        color: occasion === val ? COLORS.navy : "#666",
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <button
          onClick={() => navigate(editId ? "/reminders/list" : "/calendar")}
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
        {editId ? "Edit Reminder" : "Add a Reminder"}
      </h2>

      {loading ? (
        <p style={{ fontSize: "13px", color: "#888" }}>Loading…</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: "8px" }}>
            {typeBtn("dob", "Date / Anniversary")}
            {typeBtn("tamil", "Tamil (Star) Birthday")}
          </div>

          <label style={label}>Name / Label</label>
          <input
            style={input}
            value={label_}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={
              type === "dob" ? "e.g. Amma / Wedding Day" : "e.g. Amma"
            }
          />

          {type === "dob" ? (
            <>
              <label style={label}>Occasion</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {occBtn("birthday", "🎂 Birthday")}
                {occBtn("anniversary", "💍 Anniversary")}
              </div>

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

              <label style={label}>
                {occasion === "anniversary"
                  ? "Year of the event (optional — shows Nth anniversary)"
                  : "Birth Year (optional — shows age)"}
              </label>
              <input
                style={input}
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder={
                  occasion === "anniversary" ? "e.g. 2010" : "e.g. 1990"
                }
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
                {TAMIL_MONTHS.map((mm) => (
                  <option key={mm.tamil} value={mm.tamil}>
                    {mm.tamil} / {MONTH_TAMIL_TO_SCRIPT[mm.tamil]}
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
              background: COLORS.primary,
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
            {saving ? "Saving…" : editId ? "Update Reminder" : "Save Reminder"}
          </button>
        </>
      )}
    </div>
  );
}
