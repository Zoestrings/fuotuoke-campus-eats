import React from "react";

export default function NotificationsList({ list = [], onDismiss }) {
  if (list.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 320,
        width: "100%"
      }}
    >
      {list.map(notif => (
        <div
          key={notif.id}
          className="animate-fade-up"
          style={{
            background: "var(--bg-dark)",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 10,
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: ".84rem",
            border: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          <span>{notif.message}</span>
          <button
            onClick={() => onDismiss(notif.id)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: "1rem",
              paddingLeft: 10
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
