import React from "react";

function Btn({ children, onClick, variant = "primary", full, sm, style: ex = {}, type = "button" }) {
  const variantClass = {
    primary: "btn-primary",
    gold:    "btn-gold",
    outline: "btn-outline",
    ghost:   "btn-ghost",
    danger:  "btn-danger",
    green:   "btn-primary",
    navy:    "btn-primary",
  }[variant] || "btn-primary";

  const classes = ["btn", variantClass, sm ? "btn-sm" : "", full ? "btn-full" : ""]
    .filter(Boolean).join(" ");

  return (
    <button type={type} onClick={onClick} className={classes} style={ex}>
      {children}
    </button>
  );
}

export default Btn;
