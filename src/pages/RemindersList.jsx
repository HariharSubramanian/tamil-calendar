// ===========================================================================
// src/pages/RemindersList.jsx
// View all reminders, split into two sections:
//   1. "Upcoming this year"  — date this year is today or later (soonest first)
//   2. "Earlier this year"   — date this year already passed (next-up first)
// Each row: click → calendar jumps to its date.
// Pencil → edit. Dustbin → delete (with confirm).
// ===========================================================================

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { MONTH_TAMIL_TO_SCRIPT } from "../data/tamilMonths";
import { NAK_TAMIL_TO_SCRIPT } from "../data/nakshatras";
import { listReminders, deleteReminder } from "../firebase/reminders";
import { resolveReminderDate, daysUntilNext } from "../utils/reminderDates";
import SignOutButton from "../components/SignOutButton";

export default function RemindersList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    try {
      setList(await listReminders(user.uid));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, [user]);

  // Split into "upcoming this year" vs "earlier this year", each sorted.
  const { upcoming, earlier } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();

    const up = [];
    const past = [];

    list.forEach((r) => {
      const iso = resolveReminderDate(r, year);
      if (!iso) {
        // Can't resolve a date for this year — drop into "earlier" so it's still visible.
        past.push({ r, days: daysUntilNext(r, today), thisYearPassed: true });
        return;
      }
      const d = new Date(iso);
      d.setHours(0, 0, 0, 0);
      const days = daysUntilNext(r, today);
      if (d >= today) {
        up.push({ r, days }); // still coming this calendar year
      } else {
        past.push({ r, days }); // already happened this year
      }
    });

    const bySoonest = (a, b) => {
      if (a.days == null) return 1;
      if (b.days == null) return -1;
      return a.days - b.days;
    };
    up.sort(bySoonest);
    past.sort(bySoonest);
    return { upcoming: up, earlier: past };
  }, [list]);

  function describeDate(r) {
    const iso = resolveReminderDate(r, new Date().getFullYear());
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
    });
  }

  function typeLabel(r) {
    if (r.type === "tamil") {
      return `${MONTH_TAMIL_TO_SCRIPT[r.tamilMonth] || r.tamilMonth} · ${NAK_TAMIL_TO_SCRIPT[r.tamilStar] || r.tamilStar}`;
    }
    return r.occasion === "anniversary" ? "Anniversary" : "Date of Birth";
  }

  function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }
  function yearsSuffix(r) {
    if (r.type !== "dob" || !r.year) return "";
    const n = new Date().getFullYear() - r.year;
    if (n < 0) return "";
    return r.occasion === "anniversary"
      ? ` · ${n}${ordinal(n)} anniversary`
      : ` · turning ${n}`;
  }

  function countdown(days) {
    if (days == null) return "";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `in ${days} days`;
  }

  function goToCalendar(r) {
    const iso = resolveReminderDate(r, new Date().getFullYear());
    if (!iso) {
      navigate("/calendar");
      return;
    }
    navigate("/calendar", { state: { focusDate: iso } });
  }

  async function doDelete(id) {
    try {
      await deleteReminder(user.uid, id);
      setConfirmId(null);
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  const iconBtn = {
    border: "1px solid #eee",
    borderRadius: "8px",
    background: "none",
    padding: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Renders one reminder card.
  const card = ({ r, days }, faded) => (
    <div
      key={r.id}
      style={{
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "8px",
        opacity: faded ? 0.7 : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{ cursor: "pointer", flex: 1 }}
          onClick={() => goToCalendar(r)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 500, fontSize: "14px" }}>{r.label}</span>
            {days != null && (
              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: 500,
                  color: "#0F6E56",
                  background: "#E1F5EE",
                  borderRadius: "20px",
                  padding: "1px 8px",
                }}
              >
                {countdown(days)}
              </span>
            )}
          </div>
          <div style={{ fontSize: "13px", color: "#8B0000", marginTop: "2px" }}>
            {typeLabel(r)}
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "3px" }}>
            {describeDate(r)}
            {yearsSuffix(r)}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", marginLeft: "8px" }}>
          <button
            style={iconBtn}
            title="Edit"
            onClick={() => navigate(`/reminders/add?edit=${r.id}`)}
          >
            <Pencil size={16} color="#0F6E56" />
          </button>
          <button
            style={iconBtn}
            title="Delete"
            onClick={() => setConfirmId(r.id)}
          >
            <Trash2 size={16} color="#c0392b" />
          </button>
        </div>
      </div>

      {confirmId === r.id && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            background: "#fff5f5",
            border: "1px solid #f3c0c0",
            borderRadius: "8px",
          }}
        >
          <div style={{ fontSize: "13px", color: "#a33", marginBottom: "8px" }}>
            Delete “{r.label}”? This can’t be undone.
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => doDelete(r.id)}
              style={{
                fontSize: "12px",
                background: "#c0392b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmId(null)}
              style={{
                fontSize: "12px",
                background: "none",
                color: "#666",
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
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
      {/* Header bar */}
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 500, margin: 0 }}>
          All Reminders
        </h2>
        <button
          onClick={() => navigate("/reminders/add")}
          style={{
            fontSize: "13px",
            background: "#0F6E56",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          + Add
        </button>
      </div>

      {loading ? (
        <p style={{ fontSize: "13px", color: "#888" }}>Loading…</p>
      ) : upcoming.length === 0 && earlier.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#999" }}>
          No reminders yet. Tap “+ Add” to create one.
        </p>
      ) : (
        <>
          {/* Section 1: upcoming this year */}
          <h3
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#0F6E56",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              margin: "4px 0 8px",
            }}
          >
            Upcoming this year
          </h3>
          {upcoming.length === 0 ? (
            <p
              style={{
                fontSize: "12.5px",
                color: "#999",
                marginBottom: "16px",
              }}
            >
              Nothing more this year.
            </p>
          ) : (
            upcoming.map((item) => card(item, false))
          )}

          {/* Section 2: earlier this year (already passed → next up next year) */}
          {earlier.length > 0 && (
            <>
              <h3
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  margin: "20px 0 8px",
                }}
              >
                Earlier this year · coming next year
              </h3>
              {earlier.map((item) => card(item, true))}
            </>
          )}
        </>
      )}
    </div>
  );
}
