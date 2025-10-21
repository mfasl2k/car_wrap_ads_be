/**
 * PostGIS Utility Functions
 * Helper functions for working with PostGIS geometry types
 */

/**
 * Create a Point geometry from latitude and longitude
 * @param lat Latitude
 * @param lng Longitude
 * @returns WKT (Well-Known Text) format string for PostGIS
 */
export function createPoint(lat: number, lng: number): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

/**
 * Create a LineString geometry from an array of coordinates
 * @param coordinates Array of [lat, lng] pairs
 * @returns WKT format string for PostGIS
 */
export function createLineString(coordinates: [number, number][]): string {
  const points = coordinates.map(([lat, lng]) => `${lng} ${lat}`).join(", ");
  return `SRID=4326;LINESTRING(${points})`;
}

/**
 * Create a Polygon geometry from an array of coordinates
 * @param coordinates Array of [lat, lng] pairs (first and last point must be the same)
 * @returns WKT format string for PostGIS
 */
export function createPolygon(coordinates: [number, number][]): string {
  // Ensure the polygon is closed (first point = last point)
  if (
    coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
    coordinates[0][1] !== coordinates[coordinates.length - 1][1]
  ) {
    coordinates.push(coordinates[0]);
  }

  const points = coordinates.map(([lat, lng]) => `${lng} ${lat}`).join(", ");
  return `SRID=4326;POLYGON((${points}))`;
}

/**
 * Parse a PostGIS Point to lat/lng object
 * @param wkt WKT format string from PostGIS
 * @returns {lat, lng} object
 */
export function parsePoint(wkt: string): { lat: number; lng: number } | null {
  const match = wkt.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (match) {
    return {
      lng: parseFloat(match[1]),
      lat: parseFloat(match[2]),
    };
  }
  return null;
}

/**
 * Parse a PostGIS LineString to array of coordinates
 * @param wkt WKT format string from PostGIS
 * @returns Array of {lat, lng} objects
 */
export function parseLineString(wkt: string): { lat: number; lng: number }[] {
  const match = wkt.match(/LINESTRING\(([^)]+)\)/);
  if (match) {
    return match[1].split(",").map((point) => {
      const [lng, lat] = point.trim().split(" ");
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    });
  }
  return [];
}

/**
 * Parse a PostGIS Polygon to array of coordinates
 * @param wkt WKT format string from PostGIS
 * @returns Array of {lat, lng} objects
 */
export function parsePolygon(wkt: string): { lat: number; lng: number }[] {
  const match = wkt.match(/POLYGON\(\(([^)]+)\)\)/);
  if (match) {
    return match[1].split(",").map((point) => {
      const [lng, lat] = point.trim().split(" ");
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    });
  }
  return [];
}

/**
 * Example SQL queries for common PostGIS operations
 */
export const postgisQueries = {
  // Find drivers within X meters of a point
  findDriversNearPoint: (lat: number, lng: number, radiusMeters: number) => `
    SELECT * FROM driver 
    WHERE ST_DWithin(
      current_location,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
      ${radiusMeters}
    )
  `,

  // Check if a route intersects with a campaign area
  checkRouteIntersection: () => `
    SELECT dr.*, ca.* 
    FROM driver_route dr
    JOIN campaign_area ca ON ST_Intersects(dr.route_path, ca.target_area)
    WHERE dr.driver_id = $1 AND ca.advertiser_id = $2
  `,

  // Calculate distance between two points
  calculateDistance: () => `
    SELECT ST_Distance(
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
      ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
    ) as distance_meters
  `,
};
