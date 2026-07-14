// ================================================================
// FUOTUOKE Campus Eats — Official FUO Campus Delivery Locations
//
// GPS coordinates are approximate positions mapped across the
// Federal University Otuoke (FUO) campus, Ogbia, Bayelsa State.
// Canteen reference point: 4.9750°N, 6.2750°E
//
// To update coordinates: edit the lat/lng values below.
// ================================================================

/** Delivery origin: the main school canteen / restaurant hub */
export const CANTEEN_COORDS = { lat: 4.9750, lng: 6.2750 };

/** Category filter tabs shown in the location picker */
export const CAMPUS_CATEGORIES = [
  { id: "all",            label: "All Locations",   icon: "bi-grid-3x3-gap-fill" },
  { id: "Hostels",        label: "Hostels",          icon: "bi-house-door-fill"   },
  { id: "Faculties",      label: "Faculties",        icon: "bi-mortarboard-fill"  },
  { id: "Administrative", label: "Admin",            icon: "bi-building-fill"     },
  { id: "Facilities",     label: "Facilities",       icon: "bi-stars"             }
];

/**
 * All official FUO Otuoke campus delivery locations.
 * subLocations[] contains specific rooms/blocks within a building.
 */
export const CAMPUS_LOCATIONS = [
  // ─── Hostels ─────────────────────────────────────
  {
    id: "boys-hostel",
    name: "Boys Hostel",
    category: "Hostels",
    icon: "bi-house",
    lat: 4.9730,
    lng: 6.2740,
    subLocations: []
  },
  {
    id: "girls-hostel",
    name: "Girls Hostel",
    category: "Hostels",
    icon: "bi-house-heart",
    lat: 4.9725,
    lng: 6.2755,
    subLocations: []
  },

  // ─── Faculties ───────────────────────────────────
  {
    id: "faculty-science",
    name: "Faculty of Science",
    category: "Faculties",
    icon: "bi-beaker",
    lat: 4.9780,
    lng: 6.2770,
    subLocations: [
      { id: "fsnlt",  name: "FSNLT", lat: 4.9780, lng: 6.2770 },
      { id: "fb1",    name: "FB1",   lat: 4.9782, lng: 6.2775 },
      { id: "fb2",    name: "FB2",   lat: 4.9784, lng: 6.2778 }
    ]
  },
  {
    id: "faculty-humanities",
    name: "Faculty of Humanities",
    category: "Faculties",
    icon: "bi-book",
    lat: 4.9720,
    lng: 6.2730,
    subLocations: []
  },
  {
    id: "faculty-engineering",
    name: "Faculty of Engineering",
    category: "Faculties",
    icon: "bi-gear-fill",
    lat: 4.9790,
    lng: 6.2810,
    subLocations: [
      { id: "drawing-studio", name: "Drawing Studio", lat: 4.9792, lng: 6.2812 }
    ]
  },
  {
    id: "faculty-nursing",
    name: "Faculty of Nursing",
    category: "Faculties",
    icon: "bi-heart-pulse-fill",
    lat: 4.9770,
    lng: 6.2800,
    subLocations: []
  },

  // ─── Administrative ──────────────────────────────
  {
    id: "admin-block",
    name: "Administrative Block",
    category: "Administrative",
    icon: "bi-building",
    lat: 4.9760,
    lng: 6.2790,
    subLocations: []
  },
  {
    id: "fountain-block",
    name: "Fountain Block",
    category: "Administrative",
    icon: "bi-droplet-fill",
    lat: 4.9745,
    lng: 6.2765,
    subLocations: []
  },

  // ─── Facilities ──────────────────────────────────
  {
    id: "school-canteen",
    name: "School Canteen",
    category: "Facilities",
    icon: "bi-shop",
    lat: 4.9750,
    lng: 6.2750,
    subLocations: []
  },
  {
    id: "skill-pavilion",
    name: "Skill Pavilion",
    category: "Facilities",
    icon: "bi-tools",
    lat: 4.9760,
    lng: 6.2762,
    subLocations: []
  },
  {
    id: "auditorium",
    name: "Auditorium",
    category: "Facilities",
    icon: "bi-people-fill",
    lat: 4.9755,
    lng: 6.2780,
    subLocations: []
  }
];

/**
 * Returns a flat list of all selectable delivery spots, including sub-locations
 * as individual entries with parent context for display.
 *
 * Shape of each flat item:
 * {
 *   id, parentId, parentName,
 *   name (full label), displayName (short label),
 *   category, icon, lat, lng
 * }
 */
export function getFlatLocations() {
  const flat = [];
  CAMPUS_LOCATIONS.forEach(loc => {
    if (loc.subLocations.length > 0) {
      loc.subLocations.forEach(sub => {
        flat.push({
          id: `${loc.id}--${sub.id}`,
          parentId: loc.id,
          parentName: loc.name,
          name: `${loc.name} — ${sub.name}`,
          displayName: sub.name,
          category: loc.category,
          icon: loc.icon,
          lat: sub.lat,
          lng: sub.lng
        });
      });
    } else {
      flat.push({
        id: loc.id,
        parentId: null,
        parentName: null,
        name: loc.name,
        displayName: loc.name,
        category: loc.category,
        icon: loc.icon,
        lat: loc.lat,
        lng: loc.lng
      });
    }
  });
  return flat;
}

/**
 * Finds the best matching GPS coordinates for a given delivery location string.
 * Used by the Rider dashboard to look up coordinates for GPS simulation.
 *
 * @param {string} locationLabel - e.g. "Faculty of Science — FSNLT"
 * @returns {{ lat: number, lng: number }}
 */
export function getCoordsForLabel(locationLabel) {
  const flat = getFlatLocations();
  const label = (locationLabel || "").toLowerCase();
  const match = flat.find(loc => loc.name.toLowerCase() === label);
  if (match) return { lat: match.lat, lng: match.lng };

  // Fuzzy fallback — partial match
  const fuzzy = flat.find(loc => label.includes(loc.name.toLowerCase()) || loc.name.toLowerCase().includes(label));
  if (fuzzy) return { lat: fuzzy.lat, lng: fuzzy.lng };

  return CANTEEN_COORDS; // Default: canteen
}
