// ===========================================================================
// src/pages/RemindersList.jsx
// All reminders, split into "Upcoming this year" / "Earlier this year".
// Logo-derived blue/navy palette via theme/colors.
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
import LoadingScreen from "../components/LoadingScreen";
import { COLORS, REMINDER } from "../theme/colors";

export default function RemindersList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  function load() {
    if (!user) return;
    setLoading(true);
    setError(false);
    listReminders(user.uid)
      .then((data) => {
        setList(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError(true);
        setLoading(false);
      });
  }
  useEffect(() => {
    load();
  }, [user]);

  const { upcoming, earlier } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    const up = [];
    const past = [];
    list.forEach((r) => {
      const iso = resolveReminderDate(r, year);
      if (!iso) {
        past.push({ r, days: daysUntilNext(r, today) });
        return;
      }
      const d = new Date(iso);
      d.setHours(0, 0, 0, 0);
      const days = daysUntilNext(r, today);
      if (d >= today) up.push({ r, days });
      else past.push({ r, days });
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
      load();
    } catch (e) {
      console.error(e);
    }
  }

  const iconBtn = {
    border: `1px solid ${COLORS.borderSoft}`,
    borderRadius: "8px",
    background: "none",
    padding: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const card = ({ r, days }, faded) => (
    <div
      key={r.id}
      style={{
        border: `1px solid ${COLORS.borderSoft}`,
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
                  color: REMINDER.text,
                  background: REMINDER.bg,
                  borderRadius: "20px",
                  padding: "1px 8px",
                }}
              >
                {countdown(days)}
              </span>
            )}
          </div>
          <div
            style={{ fontSize: "13px", color: COLORS.navy, marginTop: "2px" }}
          >
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
            <Pencil size={16} color={COLORS.primary} />
          </button>
          <button
            style={iconBtn}
            title="Delete"
            onClick={() => setConfirmId(r.id)}
          >
            <Trash2 size={16} color={COLORS.danger} />
          </button>
        </div>
      </div>
      {confirmId === r.id && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            background: COLORS.dangerBg,
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
                background: COLORS.danger,
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

  if (loading) return <LoadingScreen message="Loading your reminders…" />;
  if (error) return <LoadingScreen onRetry={load} timeoutMs={0} />;

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
            background: COLORS.primary,
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

      {upcoming.length === 0 && earlier.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#999" }}>
          No reminders yet. Tap “+ Add” to create one.
        </p>
      ) : (
        <>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: COLORS.primary,
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
