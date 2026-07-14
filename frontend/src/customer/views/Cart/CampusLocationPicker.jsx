import React, { useState, useMemo } from "react";
import { CAMPUS_CATEGORIES, getFlatLocations } from "../../../CampusLocations";

/**
 * CampusLocationPicker
 * A searchable, categorised delivery location selector showing all
 * official FUO Otuoke campus buildings with quick-select cards.
 *
 * Props:
 *  selectedId   — ID of the currently selected flat location
 *  onSelect     — fn(flatLocation) called when a location is chosen
 *  onUseGPS     — fn() called when the GPS button is clicked
 *  gpsLoading   — bool, true while GPS is being detected
 *  isStaff      — bool, switches color scheme to gold
 */
export default function CampusLocationPicker({
  selectedId,
  onSelect,
  onUseGPS,
  gpsLoading,
  isStaff
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const accent = isStaff ? "var(--gold)" : "var(--primary)";
  const accentBg = isStaff ? "rgba(212,175,55,0.1)" : "rgba(15,81,50,0.08)";
  const accentSolid = isStaff ? "#D4AF37" : "#0F5132";

  const flatLocations = useMemo(() => getFlatLocations(), []);

  const filtered = useMemo(() => {
    return flatLocations.filter(loc => {
      const matchesCat = activeCategory === "all" || loc.category === activeCategory;
      const matchesSearch = !search.trim() || loc.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [flatLocations, activeCategory, search]);

  // Group filtered results by category for visual separation
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(loc => {
      if (!map[loc.category]) map[loc.category] = [];
      map[loc.category].push(loc);
    });
    return map;
  }, [filtered]);

  const categoryOrder = ["Hostels", "Faculties", "Administrative", "Facilities"];

  return (
    <div>
      {/* ── Category Tabs ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 6,
          marginBottom: 14,
          scrollbarWidth: "none"
        }}
      >
        {CAMPUS_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                flexShrink: 0,
                padding: "7px 14px",
                borderRadius: 20,
                border: `1.5px solid ${isActive ? accent : "var(--border)"}`,
                background: isActive ? accentBg : "#fff",
                color: isActive ? accentSolid : "var(--text-muted)",
                fontWeight: isActive ? 800 : 600,
                fontSize: "0.74rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
                whiteSpace: "nowrap"
              }}
            >
              <i className={`bi ${cat.icon}`} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Search Bar ────────────────────────────────────── */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <i
          className="bi bi-search"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            pointerEvents: "none"
          }}
        />
        <input
          className="form-input"
          placeholder="Search campus locations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36, fontSize: "0.84rem" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontSize: "1rem",
              lineHeight: 1,
              padding: 2
            }}
          >
            <i className="bi bi-x-circle-fill" />
          </button>
        )}
      </div>

      {/* ── Location List ─────────────────────────────────── */}
      <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 2 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text-muted)" }}>
            <i className="bi bi-geo-alt" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }} />
            <p style={{ fontSize: "0.82rem", fontWeight: 600, margin: 0 }}>
              No locations match "{search}"
            </p>
          </div>
        ) : (
          (activeCategory === "all" ? categoryOrder : [activeCategory]).map(category => {
            const locs = grouped[category];
            if (!locs || locs.length === 0) return null;
            return (
              <div key={category} style={{ marginBottom: 14 }}>
                {/* Category header (only shown in "All" view) */}
                {activeCategory === "all" && (
                  <div style={{
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "var(--text-muted)",
                    marginBottom: 8,
                    paddingLeft: 4
                  }}>
                    {category}
                  </div>
                )}

                {/* Location cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {locs.map(loc => {
                    const isSelected = selectedId === loc.id;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => onSelect(loc)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "11px 14px",
                          borderRadius: 10,
                          border: `1.5px solid ${isSelected ? accent : "var(--border)"}`,
                          background: isSelected ? accentBg : "#fafafa",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s",
                          width: "100%",
                          boxShadow: isSelected ? `0 0 0 2px ${accentBg}` : "none"
                        }}
                      >
                        {/* Icon bubble */}
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: 9,
                          background: isSelected ? accentSolid : "rgba(0,0,0,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s"
                        }}>
                          <i
                            className={`bi ${loc.icon}`}
                            style={{
                              color: isSelected ? "#fff" : "var(--text-muted)",
                              fontSize: "1rem"
                            }}
                          />
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {loc.parentName && (
                            <div style={{
                              fontSize: "0.68rem",
                              color: isSelected ? accentSolid : "var(--text-muted)",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              marginBottom: 1
                            }}>
                              {loc.parentName}
                            </div>
                          )}
                          <div style={{
                            fontWeight: 700,
                            fontSize: "0.86rem",
                            color: isSelected ? accentSolid : "var(--text-dark)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {loc.displayName}
                          </div>
                          <div style={{ fontSize: "0.71rem", color: "var(--text-muted)", marginTop: 1 }}>
                            <i className="bi bi-geo-alt" style={{ marginRight: 3 }} />
                            {loc.category}
                          </div>
                        </div>

                        {/* Checkmark when selected */}
                        {isSelected ? (
                          <div style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: accentSolid,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <i className="bi bi-check" style={{ color: "#fff", fontSize: "0.9rem" }} />
                          </div>
                        ) : (
                          <i className="bi bi-chevron-right" style={{ color: "var(--border)", fontSize: "0.75rem", flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── GPS Alternative ───────────────────────────────── */}
      <div style={{ borderTop: "1px dashed var(--border)", marginTop: 14, paddingTop: 12 }}>
        <button
          type="button"
          onClick={onUseGPS}
          disabled={gpsLoading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "11px 0",
            borderRadius: 9,
            border: `1.5px dashed ${accent}`,
            background: "transparent",
            color: accentSolid,
            fontWeight: 700,
            fontSize: "0.84rem",
            cursor: gpsLoading ? "wait" : "pointer",
            opacity: gpsLoading ? 0.8 : 1,
            transition: "all 0.15s"
          }}
        >
          {gpsLoading ? (
            <>
              <span style={{
                width: 14,
                height: 14,
                border: "2px solid",
                borderTopColor: accentSolid,
                borderRightColor: accentSolid,
                borderBottomColor: "transparent",
                borderLeftColor: "transparent",
                borderRadius: "50%",
                display: "inline-block",
                animation: "authSpin 0.75s linear infinite"
              }} />
              Detecting your GPS location...
            </>
          ) : (
            <>
              <i className="bi bi-crosshair2" />
              Use My Current GPS Location Instead
            </>
          )}
        </button>
      </div>
    </div>
  );
}
