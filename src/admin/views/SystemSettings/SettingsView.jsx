import React, { useState } from "react";
import { Btn } from "../../../shared/ui";

export default function SettingsView({ settings = {}, onSave, onReset }) {
  const [mMode, setMMode] = useState(!!settings.maintenanceMode);
  const [reg, setReg] = useState(!!settings.allowRegistration);
  const [del, setDel] = useState(!!settings.allowDeliveries);
  const [fee, setFee] = useState(settings.deliveryFee || 500);
  const [phone, setPhone] = useState(settings.supportPhone || "080-3333-4444");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      maintenanceMode: mMode,
      allowRegistration: reg,
      allowDeliveries: del,
      deliveryFee: Number(fee),
      supportPhone: phone
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
          Platform Settings &amp; Maintenance
        </h3>
        <p style={{ color: "var(--text-light)", fontSize: ".88rem", marginBottom: 24 }}>
          Adjust platform parameters, delivery fees, customer onboarding rules, or trigger database maintenance.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20, maxWidth: 500 }}>
          {/* Toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: ".86rem", fontWeight: 600 }}>
              <input type="checkbox" checked={mMode} onChange={e => setMMode(e.target.checked)} style={{ width: 16, height: 16 }} />
              Enable Platform Maintenance Mode (Lock Ordering)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: ".86rem", fontWeight: 600 }}>
              <input type="checkbox" checked={reg} onChange={e => setReg(e.target.checked)} style={{ width: 16, height: 16 }} />
              Allow New Customer Registrations
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: ".86rem", fontWeight: 600 }}>
              <input type="checkbox" checked={del} onChange={e => setDel(e.target.checked)} style={{ width: 16, height: 16 }} />
              Allow Canteen Faculty Deliveries
            </label>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border)" }} />

          {/* Value Inputs */}
          <div>
            <label className="form-label">Delivery Service Fee (₦)</label>
            <input
              type="number"
              className="form-input"
              value={fee}
              onChange={e => setFee(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label className="form-label">Customer Support Hotline</label>
            <input
              type="text"
              className="form-input"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <Btn type="submit" variant="primary" style={{ justifySelf: "start", marginTop: 10 }}>
            Save Platform Changes
          </Btn>
        </form>

        <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "24px 0" }} />

        {/* Danger zone */}
        <div style={{ background: "#fff5f5", border: "1px solid #feb2b2", borderRadius: 10, padding: 20 }}>
          <h4 style={{ color: "#c53030", fontWeight: 800, fontSize: ".9rem", marginBottom: 6 }}>System Reset &amp; Seeding</h4>
          <p style={{ color: "#742a2a", fontSize: ".8rem", marginBottom: 16 }}>
            Proceeding will reset all transactions, order logs, registered users, and custom dishes back to their seed values.
          </p>
          <Btn variant="danger" onClick={onReset}>
            Reset Platform Database
          </Btn>
        </div>
      </div>
    </div>
  );
}
