import { getFlatLocations } from "../CampusLocations";

export class GeocodingService {
  /**
   * Finds the nearest FUO campus landmark to given coordinates.
   */
  static getNearestCampusLocation(lat, lng) {
    const locations = getFlatLocations();
    let closest = null;
    let minDistance = Infinity;

    locations.forEach(loc => {
      const dist = this.calculateDistance(lat, lng, loc.lat, loc.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = loc;
      }
    });

    return { location: closest, distanceKm: minDistance };
  }

  /**
   * Reverse geocodes coordinates (lat, lng) to a friendly campus address.
   * Uses local campus landmark matching first, with OpenStreetMap Nominatim enrichment.
   */
  static async reverseGeocode(lat, lng) {
    const nearest = this.getNearestCampusLocation(lat, lng);
    const distanceMeters = Math.round(nearest.distanceKm * 1000);

    let campusLabel = "";
    if (nearest.location && distanceMeters <= 400) {
      campusLabel = distanceMeters < 50
        ? `At ${nearest.location.name}`
        : `Near ${nearest.location.name} (~${distanceMeters}m away)`;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "FUOTUOKECampusEats/1.0"
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim API responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.display_name) {
        const shortName = data.display_name.split(",").slice(0, 3).join(",").trim();
        return campusLabel ? `${campusLabel} (${shortName})` : data.display_name;
      }

      return campusLabel || `FUO Campus spot (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    } catch (error) {
      console.warn("Reverse geocoding API fallback:", error);
      return campusLabel || `FUO Campus spot (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    }
  }

  /**
   * Calculates the straight-line distance between two GPS coordinates
   * using the Haversine formula.
   *
   * @param {number} lat1 - Origin latitude
   * @param {number} lng1 - Origin longitude
   * @param {number} lat2 - Destination latitude
   * @param {number} lng2 - Destination longitude
   * @returns {number} Distance in kilometres
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Estimates delivery time based on distance.
   * Assumes 25 km/h average rider speed + 3 minutes preparation buffer.
   *
   * @param {number} distanceKm - Distance in kilometres
   * @returns {string} Human-readable ETA string, e.g. "~5 min"
   */
  static estimateETA(distanceKm) {
    const speedKmh = 25;
    const prepMinutes = 3;
    const travelMinutes = (distanceKm / speedKmh) * 60;
    const total = Math.max(2, Math.ceil(travelMinutes + prepMinutes));
    return `~${total} min`;
  }

  /**
   * Returns a formatted distance string.
   * @param {number} distanceKm
   * @returns {string} e.g. "0.35 km" or "350 m"
   */
  static formatDistance(distanceKm) {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(2)} km`;
  }
}
