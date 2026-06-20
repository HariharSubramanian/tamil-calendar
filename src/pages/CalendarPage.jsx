// src/pages/CalendarPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FESTIVALS, TYPE_COLORS } from "../data/festivals";
import { getTamilMonthName } from "../utils/tamilDate";
import { listReminders } from "../firebase/reminders";
import { remindersForMonth, daysUntilNext } from "../utils/reminderDates";
import SignOutButton from "../components/SignOutButton";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const REM_COLOR = { bg: "#E1F5EE", dot: "#0F6E56", text: "#0F6E56" };

export default function CalendarPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date();
  const [view, setView] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [sel, setSel] = useState(null);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    if (!user) return;
    listReminders(user.uid)
      .then(setReminders)
      .catch((e) => console.error(e));
  }, [user]);

  const y = view.getFullYear();
  const m = view.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const label = view.toLocaleString("default", { month: "long" });
  const taMonth = getTamilMonthName(new Date(y, m, 15));

  // Festivals for this month.
  const fmap = {};
  FESTIVALS.forEach((f) => {
    const fd = new Date(f.date);
    if (fd.getFullYear() === y && fd.getMonth() === m) {
      const k = fd.getDate();
      (fmap[k] = fmap[k] || []).push(f);
    }
  });

  // Reminders for this month/year — recomputed when the viewed month or
  // reminders change. Tamil dates are recalculated for THIS year (cached).
  const rmap = useMemo(
    () => remindersForMonth(reminders, y, m),
    [reminders, y, m],
  );

  // Soonest upcoming reminder, for the banner.
  const upcoming = useMemo(() => {
    let best = null;
    reminders.forEach((r) => {
      const d = daysUntilNext(r, today);
      if (d == null) return;
      if (!best || d < best.days) best = { r, days: d };
    });
    return best;
  }, [reminders]);

  const selFests = sel ? fmap[sel] || [] : [];
  const selRems = sel ? rmap[sel] || [] : [];

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "16px",
        fontFamily: "Noto Sans Tamil, system-ui, sans-serif",
      }}
    >
      {/* Header bar: Add Reminder + Sign out */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <button
          onClick={() => navigate("/reminders")}
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
          + Add Reminder
        </button>
        <SignOutButton />
      </div>

      {/* Upcoming reminder banner (free in-app reminder) */}
      {upcoming && (
        <div
          style={{
            background: REM_COLOR.bg,
            border: `1px solid ${REM_COLOR.dot}33`,
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "12px",
          }}
        >
          <span style={{ color: REM_COLOR.text, fontWeight: 500 }}>
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

      {/* Month navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "2px",
          marginTop: "14px",
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
          const hasFest = !!fmap[day];
          const hasRem = !!rmap[day];
          const has = hasFest || hasRem;
          const isToday =
            day === today.getDate() &&
            m === today.getMonth() &&
            y === today.getFullYear();
          const isSel = day === sel;
          const cellBg = isSel
            ? "#8B0000"
            : hasFest
              ? TYPE_COLORS[fmap[day][0].type]?.bg || "#FFF0F0"
              : hasRem
                ? REM_COLOR.bg
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
                  ? "1.5px solid #8B0000"
                  : "1px solid transparent",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: isToday ? 600 : 400,
                  color: isSel ? "#fff" : isToday ? "#8B0000" : "inherit",
                }}
              >
                {day}
              </div>
              {has && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "2px",
                    marginTop: "2px",
                  }}
                >
                  {hasFest &&
                    fmap[day]
                      .slice(0, 2)
                      .map((f) => (
                        <div
                          key={f.id}
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: isSel
                              ? "#fff"
                              : TYPE_COLORS[f.type]?.dot || "#8B0000",
                          }}
                        />
                      ))}
                  {hasRem &&
                    rmap[day]
                      .slice(0, 2)
                      .map((r) => (
                        <div
                          key={r.id}
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: isSel ? "#fff" : REM_COLOR.dot,
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
            border: "1px solid #f5c4b3",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#8B0000",
              color: "#fff",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {label} {sel}, {y}
          </div>
          <div style={{ background: "#fff8f8", padding: "12px 14px" }}>
            {selFests.length === 0 && selRems.length === 0 ? (
              <p style={{ color: "#888", fontSize: "13px" }}>
                Nothing on this day.
              </p>
            ) : (
              <>
                {selFests.map((f) => (
                  <div key={f.id} style={{ marginBottom: "12px" }}>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>
                      {f.name_en}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        color: "#8B0000",
                        marginTop: "2px",
                      }}
                    >
                      {f.name_ta}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "3px",
                      }}
                    >
                      {f.desc}
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "6px",
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        fontWeight: 500,
                        background: TYPE_COLORS[f.type]?.bg || "#f0f0f0",
                        color: TYPE_COLORS[f.type]?.dot || "#333",
                      }}
                    >
                      {TYPE_COLORS[f.type]?.label || f.type}
                    </span>
                  </div>
                ))}
                {selRems.map((r) => (
                  <div key={r.id} style={{ marginBottom: "12px" }}>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>
                      {r.label}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: REM_COLOR.text,
                        marginTop: "2px",
                      }}
                    >
                      {r.type === "tamil" ? "Star Birthday" : "Birthday"}
                      {r.type === "dob" && r.year
                        ? ` (turning ${y - r.year})`
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
                        background: REM_COLOR.bg,
                        color: REM_COLOR.text,
                      }}
                    >
                      Reminder
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
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
