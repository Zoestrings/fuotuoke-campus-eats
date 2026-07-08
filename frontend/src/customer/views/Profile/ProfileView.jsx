import React, { useState } from "react";
import { Btn, Field } from "../../../shared/ui";

export default function ProfileView({ user, accent }) {
  const [email, setEmail] = useState(user.email || "");
  const [successMsg, setSuccessMsg] = useState("");

  const handleUpdate = (e) => {
    e.preventDefault();
    setSuccessMsg("✅ Profile updated successfully! (Simulated)");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="page-bg animate-fade-in">
      <div className="page-content-small">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 900, color: "var(--text-dark)", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <i className="bi bi-person-circle" style={{ color: accent }} />
          User Profile &amp; Settings
        </h2>

        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <form onSubmit={handleUpdate}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 24, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary-light)", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                <i className="bi bi-person" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{user.name}</h3>
                <p style={{ margin: 0, fontSize: ".76rem", color: "var(--text-light)" }}>Role: {user.role.toUpperCase()}</p>
              </div>
            </div>

            <Field label="User ID (Matric / Staff ID)" value={user.id} onChange={() => {}} hint="User ID cannot be changed" />
            <Field label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />

            {successMsg && (
              <p style={{ color: "var(--green-text)", fontSize: ".8rem", margin: "10px 0 0", fontWeight: 600 }}>{successMsg}</p>
            )}

            <div style={{ marginTop: 20 }}>
              <Btn type="submit" variant="primary" full style={{ background: accent }}>
                Save Profile Changes
              </Btn>
            </div>
          </form>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "24px 0" }} />

          <div>
            <h4 style={{ fontSize: ".84rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 12 }}>
              System Preferences
            </h4>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: ".84rem", fontWeight: 600 }}>Notification Sounds</div>
                <div style={{ fontSize: ".74rem", color: "var(--text-muted)" }}>Play a chime when order status updates</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: 18, height: 18, cursor: "pointer" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              <div>
                <div style={{ fontSize: ".84rem", fontWeight: 600 }}>Email Receipts</div>
                <div style={{ fontSize: ".74rem", color: "var(--text-muted)" }}>Send receipts for orders to email</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: 18, height: 18, cursor: "pointer" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
