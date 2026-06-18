import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { FESTIVALS, TYPE_COLORS } from "../data/festivals";
import { getTamilMonthName } from "../utils/tamilDate";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { user } = useAuth();
  const today = new Date();
  const [view, setView] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [sel, setSel] = useState(null);

  const y = view.getFullYear();
  const m = view.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const label = view.toLocaleString("default", { month: "long" });
  const taMonth = getTamilMonthName(new Date(y, m, 15));

  const fmap = {};
  FESTIVALS.forEach((f) => {
    const fd = new Date(f.date);
    if (fd.getFullYear() === y && fd.getMonth() === m) {
      const k = fd.getDate();
      (fmap[k] = fmap[k] || []).push(f);
    }
  });

  const selFests = sel ? fmap[sel] || [] : [];

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
          const has = !!fmap[day];
          const isToday =
            day === today.getDate() &&
            m === today.getMonth() &&
            y === today.getFullYear();
          const isSel = day === sel;
          const dot = has
            ? TYPE_COLORS[fmap[day][0].type]?.dot || "#8B0000"
            : null;
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
                background: isSel
                  ? "#8B0000"
                  : has
                    ? TYPE_COLORS[fmap[day][0].type]?.bg || "#FFF0F0"
                    : "transparent",
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
                  {fmap[day].slice(0, 3).map((f) => (
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
                </div>
              )}
            </div>
          );
        })}
      </div>

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
            {selFests.length === 0 ? (
              <p style={{ color: "#888", fontSize: "13px" }}>
                No festivals on this day.
              </p>
            ) : (
              selFests.map((f) => (
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "12px", color: "#999" }}>{user?.email}</span>
        <button
          onClick={() => signOut(auth)}
          style={{
            fontSize: "12px",
            color: "#666",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "4px 10px",
            cursor: "pointer",
            background: "none",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
