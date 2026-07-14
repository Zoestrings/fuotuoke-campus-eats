// ================================================================
// FUOTUOKE Campus Eats — Customer Geocoding Service
// ================================================================

export class GeocodingService {
  /**
   * Reverse geocodes coordinates (lat, lng) to a friendly street address.
   * Uses OpenStreetMap Nominatim by default (completely free, no API keys).
   *
   * Switch to Google Maps later:
   * Replace this method body with:
   * ```javascript
   * const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
   * const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
   * const response = await fetch(url);
   * const data = await response.json();
   * if (data.status === 'OK' && data.results[0]) {
   *   return data.results[0].formatted_address;
   * }
   * throw new Error(data.error_message || 'Geocoding failed');
   * ```
   */
  static async reverseGeocode(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

      const response = await fetch(url, {
        headers: { "Accept-Language": "en" }
      });

      if (!response.ok) {
        throw new Error(`Nominatim API responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.display_name) {
        return data.display_name;
      }

      return `Location at (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    } catch (error) {
      console.warn("Reverse geocoding failed, using coordinates fallback:", error);
      return `Location at (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
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
