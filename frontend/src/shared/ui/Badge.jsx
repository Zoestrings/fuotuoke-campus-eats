import React from "react";

function Badge({ children, color = "blue" }) {
  const cls = { blue: "badge-blue", gold: "badge-gold", green: "badge-green" }[color] || "badge-blue";
  return <span className={`badge ${cls}`}>{children}</span>;
}

export default Badge;
