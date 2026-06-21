// src/pages/CalendarPage.jsx
// Reminders-only calendar. Logo-derived blue/navy palette via theme/colors.
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getTamilMonthName } from "../utils/tamilDate";
import { listReminders } from "../firebase/reminders";
import { remindersForMonth, daysUntilNext } from "../utils/reminderDates";
import SignOutButton from "../components/SignOutButton";
import LoadingScreen from "../components/LoadingScreen";
import { COLORS, REMINDER, SELECTED } from "../theme/colors";
import RenameNotice from "../components/RenameNotice";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date();

  const focusIso = location.state?.focusDate || null;
  const focusDate = focusIso ? new Date(focusIso) : null;

  const [view, setView] = useState(
    focusDate
      ? new Date(focusDate.getFullYear(), focusDate.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [sel, setSel] = useState(
    focusDate ? focusDate.getDate() : today.getDate(),
  );
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function load() {
    if (!user) return;
    setLoading(true);
    setError(false);
    listReminders(user.uid)
      .then((data) => {
        setReminders(data);
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

  const y = view.getFullYear();
  const m = view.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const label = view.toLocaleString("default", { month: "long" });
  const taMonth = getTamilMonthName(new Date(y, m, 15));

  const rmap = useMemo(
    () => remindersForMonth(reminders, y, m),
    [reminders, y, m],
  );

  const upcoming = useMemo(() => {
    let best = null;
    reminders.forEach((r) => {
      const d = daysUntilNext(r, today);
      if (d == null) return;
      if (!best || d < best.days) best = { r, days: d };
    });
    return best;
  }, [reminders]);

  const selRems = sel ? rmap[sel] || [] : [];
  const isThisMonth = m === today.getMonth() && y === today.getFullYear();
  const onTodayExactly = isThisMonth && sel === today.getDate();
  const showToday = !isThisMonth || (sel !== null && !onTodayExactly);

  function goToday() {
    setView(new Date(today.getFullYear(), today.getMonth(), 1));
    setSel(today.getDate());
  }

  if (loading) return <LoadingScreen message="Loading your calendar…" />;
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
      <RenameNotice />
      {/* Header: Add + View all + Sign out */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigate("/reminders/add")}
            style={{
              fontSize: "13px",
              background: COLORS.primary,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            + Add
          </button>
          <button
            onClick={() => navigate("/reminders/list")}
            style={{
              fontSize: "13px",
              background: "none",
              color: COLORS.primary,
              border: `1px solid ${COLORS.primary}`,
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            View all
          </button>
        </div>
        <SignOutButton />
      </div>

      {upcoming && (
        <div
          style={{
            background: REMINDER.bg,
            border: `1px solid ${REMINDER.dot}33`,
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "12px",
          }}
        >
          <span style={{ color: REMINDER.text, fontWeight: 500 }}>
            {upcoming.r.label}
          </span>
          <span style={{ color: "#555", fontSize: "13px" }}>
            {" — "}
            {upcoming.days === 0
              ? "today!"
              : `in ${upcoming.days} day${upcoming.days === 1 ? "" : "s"}`}
          </span>
        </div>
      )}

      {/* Month navigation (Today button absolutely positioned) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        <button
          onClick={() => setView(new Date(y, m - 1, 1))}
          style={{
            border: "none",
            background: "none",
            fontSize: "20px",
            cursor: "pointer",
            padding: "4px 10px",
          }}
        >
          ‹
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 500, fontSize: "17px" }}>
            {label} {y}
          </div>
          <div style={{ fontSize: "13px", color: "#888" }}>{taMonth} மாதம்</div>
        </div>
        <button
          onClick={() => setView(new Date(y, m + 1, 1))}
          style={{
            border: "none",
            background: "none",
            fontSize: "20px",
            cursor: "pointer",
            padding: "4px 10px",
          }}
        >
          ›
        </button>

        {showToday && (
          <button
            onClick={goToday}
            style={{
              position: "absolute",
              right: "44px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "11px",
              background: COLORS.primary,
              color: "#fff",
              border: "none",
              borderRadius: "20px",
              padding: "4px 12px",
              cursor: "pointer",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              boxShadow: "0 1px 3px rgba(27,79,107,0.25)",
            }}
          >
            ↩ Today
          </button>
        )}
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "2px",
          marginTop: "12px",
        }}
      >
        {WD.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#999",
              padding: "4px 0",
              fontWeight: 500,
            }}
          >
            {d}
          </div>
        ))}
        {Array(first)
          .fill(null)
          .map((_, i) => (
            <div key={"e" + i} />
          ))}
        {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
          const hasRem = !!rmap[day];
          const isToday = day === today.getDate() && isThisMonth;
          const isSel = day === sel;
          const cellBg = isSel
            ? SELECTED
            : hasRem
              ? REMINDER.bg
              : "transparent";
          return (
            <div
              key={day}
              onClick={() => setSel(isSel ? null : day)}
              style={{
                minHeight: "46px",
                padding: "4px 2px",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "center",
                background: cellBg,
                border: isToday
                  ? `1.5px solid ${SELECTED}`
                  : "1px solid transparent",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: isToday ? 600 : 400,
                  color: isSel ? "#fff" : isToday ? SELECTED : "inherit",
                }}
              >
                {day}
              </div>
              {hasRem && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "2px",
                    marginTop: "2px",
                  }}
                >
                  {rmap[day].slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: isSel ? "#fff" : REMINDER.dot,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {sel && (
        <div
          style={{
            marginTop: "14px",
            borderRadius: "12px",
            border: `1px solid ${COLORS.primary}44`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: SELECTED,
              color: "#fff",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {label} {sel}, {y}
          </div>
          <div style={{ background: "#f4f8fc", padding: "12px 14px" }}>
            {selRems.length === 0 ? (
              <p style={{ color: "#888", fontSize: "13px" }}>
                No reminders on this day.
              </p>
            ) : (
              selRems.map((r) => (
                <div key={r.id} style={{ marginBottom: "12px" }}>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>
                    {r.label}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: REMINDER.text,
                      marginTop: "2px",
                    }}
                  >
                    {r.type === "tamil"
                      ? "Star Birthday"
                      : r.occasion === "anniversary"
                        ? "Anniversary"
                        : "Birthday"}
                    {r.type === "dob" && r.year
                      ? r.occasion === "anniversary"
                        ? ` (${y - r.year} years)`
                        : ` (turning ${y - r.year})`
                      : ""}
                  </div>
                  {r.alertMessage && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "3px",
                      }}
                    >
                      {r.alertMessage}
                    </div>
                  )}
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      fontSize: "10px",
                      padding: "2px 8px",
                      borderRadius: "20px",
                      fontWeight: 500,
                      background: REMINDER.bg,
                      color: REMINDER.text,
                    }}
                  >
                    Reminder
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          paddingTop: "12px",
          borderTop: "1px solid #eee",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "12px", color: "#999" }}>{user?.email}</span>
      </div>
    </div>
  );
}
