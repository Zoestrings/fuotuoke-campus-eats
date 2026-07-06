import React from "react";
import { OUTLETS } from "../data";
import { Btn, Badge } from "../components/ui";

export default function DashHome({ isStaff, accent, outlet, setOutlet, setPage, addItem, menuItems = [] }) {
  const badgeColor = isStaff ? "gold" : "blue";

  const steps = [
    { icon: "bi-geo-alt-fill", num: "01", title: "Choose Outlet", desc: "Pick your nearest campus canteen or cafeteria." },
    { icon: "bi-grid", num: "02", title: "Select Meals", desc: "Browse the menu and add items to your cart." },
    { icon: "bi-truck", num: "03", title: "Pick Delivery", desc: "Choose pickup or delivery to your faculty." },
    { icon: "bi-emoji-smile-fill", num: "04", title: "Enjoy!", desc: "Your hot meal is ready or on its way to you." },
  ];

  return (
    <div className="dashhome-root">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`dashhome-hero${isStaff ? " staff" : ""}`}>
        <div>

          FUOTUOKE · Campus Food Ordering
        </div>

        <h1 className="dashhome-hero-title">
          Feeling Hungry on Campus?{" "}
          <span style={{ color: accent }}>Order in Minutes.</span>
        </h1>

        <p className="dashhome-hero-sub">
          Hot food from your favourite FUOTUOKE canteens  pickup or delivery right to your faculty.
        </p>

        <div className="dashhome-hero-cta">
          <Btn variant={isStaff ? "gold" : "primary"} onClick={() => setPage("menu")} style={{ padding: "13px 32px", fontSize: "1rem" }}>
            <i className="bi bi-grid" /> Browse Menu
          </Btn>
          <Btn variant="ghost" onClick={() => setPage("orders")} style={{ padding: "13px 32px", fontSize: "1rem" }}>
            <i className="bi bi-receipt" /> My Orders
          </Btn>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────── */}
      <div className="dashhome-section dashhome-section-white dashhome-section-center">
        <Badge color={badgeColor}>Simple steps</Badge>
        <h2 className="dashhome-section-title">How it works</h2>
        <div className="dashhome-steps-grid">
          {steps.map((s, i) => (
            <div key={i} className={`dashhome-step-card${isStaff ? " staff" : ""}`}>
              <div className={`dashhome-step-icon-wrap${isStaff ? " staff" : ""}`}>
                <i className={`bi ${s.icon}`} />
              </div>
              <div className="dashhome-step-num" style={{ color: accent }}>Step {s.num}</div>
              <h4 className="dashhome-step-title">{s.title}</h4>
              <p className="dashhome-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Canteens ─────────────────────────────────────── */}
      <div className="dashhome-section dashhome-section-tinted">
        <div className="dashhome-section-inner">
          <Badge color={badgeColor}>On campus</Badge>
          <h2 className="dashhome-section-title">Our Canteens &amp; Cafeterias</h2>
          <div className="dashhome-canteen-grid">
            {OUTLETS.map(o => (
              <div
                key={o.id}
                onClick={() => { setOutlet(o.id); setPage("menu"); }}
                className={`dashhome-canteen-card${outlet === o.id ? (isStaff ? " active-staff" : " active-student") : ""}`}
                style={{ borderColor: outlet === o.id ? accent : "var(--border)" }}
              >
                <i className={`bi ${o.biIcon || "bi-shop"} dashhome-canteen-icon`} style={{ color: outlet === o.id ? accent : "var(--text-muted)" }} />
                <h4 className="dashhome-canteen-name">{o.name}</h4>
                <p className="dashhome-canteen-loc">{o.loc}</p>
                <p className="dashhome-canteen-time" style={{ color: accent }}>
                  <i className="bi bi-clock" style={{ marginRight: 4 }} />
                  {o.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Popular items ─────────────────────────────────── */}
      <div className="dashhome-section dashhome-section-white">
        <div className="dashhome-section-inner">
          <Badge color={badgeColor}>Most ordered</Badge>
          <div className="dashhome-popular-header">
            <h2 className="dashhome-section-title" style={{ marginBottom: 0 }}>Popular Right Now</h2>
            <Btn sm variant={isStaff ? "gold" : "primary"} onClick={() => setPage("menu")}>
              View Full Menu <i className="bi bi-arrow-right" />
            </Btn>
          </div>

          {menuItems.filter(m => m.popular).length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 20px", background: "#f8fafc", borderRadius: 14, border: "1px dashed var(--border)" }}>
              <i className="bi bi-egg-fried" style={{ fontSize: "2.5rem", color: "var(--text-muted)", display: "block", marginBottom: 12 }} />
              <p style={{ color: "var(--text-light)", fontSize: ".88rem", margin: 0 }}>
                {menuItems.length === 0
                  ? "No meals added yet — Admin can add them from the Admin Panel."
                  : "Mark items as 'Popular' in the Admin Panel to feature them here."}
              </p>
            </div>
          ) : (
            <div className="dashhome-popular-grid">
              {menuItems.filter(m => m.popular).slice(0, 4).map(item => (
                <div key={item.id} className={`dashhome-popular-card${isStaff ? " staff" : ""}`}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="item-img-card" />
                  ) : (
                    <div className="item-emoji-card">{item.emoji}</div>
                  )}
                  <div className="dashhome-popular-name">{item.name}</div>
                  <div className="dashhome-popular-desc">{item.desc}</div>
                  <div className="dashhome-popular-footer">
                    <span className="dashhome-popular-price" style={{ color: accent }}>₦{item.price.toLocaleString()}</span>
                    <Btn sm variant={isStaff ? "gold" : "primary"} onClick={() => addItem(item)}>
                      <i className="bi bi-plus" /> Add
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
