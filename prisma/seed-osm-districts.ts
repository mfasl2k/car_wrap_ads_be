import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

/**
 * Seed script to import Auckland suburbs from OpenStreetMap
 * Run with: npx ts-node prisma/seed-osm-districts.ts
 */

interface OSMElement {
  type: string;
  id: number;
  tags?: {
    name?: string;
    "name:en"?: string;
    place?: string;
    population?: string;
    "addr:suburb"?: string;
  };
  bounds?: {
    minlat: number;
    minlon: number;
    maxlat: number;
    maxlon: number;
  };
  center?: {
    lat: number;
    lon: number;
  };
  geometry?: Array<{ lat: number; lon: number }>;
  members?: Array<{
    type: string;
    ref: number;
    role: string;
    lat?: number;
    lon?: number;
    geometry?: Array<{ lat: number; lon: number }>;
  }>;
}

interface OSMResponse {
  elements: OSMElement[];
}

/**
 * Fetch Auckland suburbs from OpenStreetMap Overpass API
 */
async function fetchAucklandSuburbs(): Promise<OSMElement[]> {
  const overpassUrl = "https://overpass-api.de/api/interpreter";

  // Overpass QL query to get all suburbs in Auckland region
  // This queries for places tagged as suburb or neighbourhood within Auckland's bounding box
  const query = `
    [out:json][timeout:60];
    (
      // Get suburbs in Auckland area (bounding box covers greater Auckland)
      node["place"~"suburb|neighbourhood"]["name"](around:50000,-36.8485,174.7633);
      way["place"~"suburb|neighbourhood"]["name"](around:50000,-36.8485,174.7633);
      relation["place"~"suburb|neighbourhood"]["name"](around:50000,-36.8485,174.7633);
    );
    out body;
    >;
    out skel qt;
  `;

  console.log("🌍 Fetching Auckland suburbs from OpenStreetMap...");
  console.log("⏳ This may take 30-60 seconds...\n");

  try {
    const response = await axios.post<OSMResponse>(
      overpassUrl,
      `data=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 90000, // 90 second timeout
      }
    );

    const suburbs = response.data.elements.filter(
      (el: OSMElement) => el.tags && el.tags.name && el.tags.place
    );

    console.log(`✅ Found ${suburbs.length} suburbs from OSM\n`);
    return suburbs;
  } catch (error: any) {
    console.error("❌ Error fetching from Overpass API:", error.message);
    throw error;
  }
}

/**
 * Convert OSM element to WKT polygon
 * For simple cases, creates a bounding box polygon
 */
function osmToWKT(element: OSMElement): string | null {
  try {
    // If it's a way with geometry
    if (element.geometry && element.geometry.length > 0) {
      const coords = element.geometry.map(
        (point) => `${point.lon} ${point.lat}`
      );
      // Close the polygon if not already closed
      if (
        element.geometry[0].lat !==
          element.geometry[element.geometry.length - 1].lat ||
        element.geometry[0].lon !==
          element.geometry[element.geometry.length - 1].lon
      ) {
        coords.push(`${element.geometry[0].lon} ${element.geometry[0].lat}`);
      }
      return `POLYGON((${coords.join(", ")}))`;
    }

    // If it has bounds, create a bounding box polygon
    if (element.bounds) {
      const { minlon, minlat, maxlon, maxlat } = element.bounds;
      return `POLYGON((${minlon} ${minlat}, ${maxlon} ${minlat}, ${maxlon} ${maxlat}, ${minlon} ${maxlat}, ${minlon} ${minlat}))`;
    }

    // If it's just a node with center, create a small square around it
    if (element.center) {
      const { lat, lon } = element.center;
      const offset = 0.01; // ~1km square
      return `POLYGON((${lon - offset} ${lat - offset}, ${lon + offset} ${
        lat - offset
      }, ${lon + offset} ${lat + offset}, ${lon - offset} ${lat + offset}, ${
        lon - offset
      } ${lat - offset}))`;
    }

    return null;
  } catch (error) {
    console.error(`Error converting element ${element.id} to WKT:`, error);
    return null;
  }
}

/**
 * Calculate approximate area in km² from bounds
 */
function calculateArea(bounds?: {
  minlat: number;
  minlon: number;
  maxlat: number;
  maxlon: number;
}): number {
  if (!bounds) return 1.0;

  const latDiff = bounds.maxlat - bounds.minlat;
  const lonDiff = bounds.maxlon - bounds.minlon;

  // Rough approximation: 1 degree lat ≈ 111km, 1 degree lon ≈ 88km at Auckland latitude
  const areaKm2 = Math.abs(latDiff * 111 * lonDiff * 88);
  return Math.max(0.5, Math.min(areaKm2, 100)); // Clamp between 0.5 and 100 km²
}

/**
 * Estimate population based on area (very rough approximation)
 */
function estimatePopulation(
  areaKm2: number,
  tags?: OSMElement["tags"]
): number {
  if (tags?.population) {
    const pop = parseInt(tags.population);
    if (!isNaN(pop)) return pop;
  }

  // Auckland average density ~1,200 per km²
  // Suburbs vary from 500-3000 per km²
  const avgDensity = 1200;
  return Math.round(areaKm2 * avgDensity);
}

/**
 * Main seed function
 */
async function main() {
  try {
    console.log("🗺️  Auckland Districts OSM Seeder\n");
    console.log("=".repeat(50));

    // Fetch suburbs from OSM
    const osmSuburbs = await fetchAucklandSuburbs();

    if (osmSuburbs.length === 0) {
      console.log(
        "⚠️  No suburbs found. Please check your internet connection."
      );
      return;
    }

    // Clear existing districts
    console.log("🗑️  Clearing existing districts...");
    await prisma.$executeRaw`DELETE FROM location_district`;
    console.log("✅ Cleared existing data\n");

    // Process and insert each suburb
    console.log("📍 Processing suburbs...\n");
    let insertedCount = 0;
    let skippedCount = 0;

    for (const suburb of osmSuburbs) {
      const name = suburb.tags?.name;
      if (!name) {
        skippedCount++;
        continue;
      }

      const wkt = osmToWKT(suburb);
      if (!wkt) {
        console.log(`⏭️  Skipping ${name} (no valid geometry)`);
        skippedCount++;
        continue;
      }

      const areaKm2 = calculateArea(suburb.bounds);
      const population = estimatePopulation(areaKm2, suburb.tags);

      try {
        await prisma.$executeRaw`
          INSERT INTO location_district (
            district_id,
            district_name,
            city,
            region,
            polygon,
            population,
            area_km2,
            is_active,
            created_at
          )
          VALUES (
            gen_random_uuid(),
            ${name},
            'Auckland',
            'Auckland',
            ST_SetSRID(ST_GeomFromText(${wkt}), 4326),
            ${population},
            ${areaKm2},
            true,
            NOW()
          )
        `;

        insertedCount++;
        console.log(
          `✅ ${insertedCount.toString().padStart(3)}) ${name.padEnd(
            30
          )} | ${population.toLocaleString().padStart(7)} pop | ${areaKm2
            .toFixed(1)
            .padStart(6)} km²`
        );
      } catch (error: any) {
        if (error.code === "23505") {
          // Duplicate key - skip
          console.log(`⏭️  Skipping ${name} (duplicate)`);
          skippedCount++;
        } else {
          console.error(`❌ Error inserting ${name}:`, error.message);
          skippedCount++;
        }
      }
    }

    // Verify final count
    const finalCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM location_district
    `;

    console.log("\n" + "=".repeat(50));
    console.log(
      `✅ Successfully imported ${insertedCount} Auckland districts!`
    );
    console.log(
      `⏭️  Skipped ${skippedCount} suburbs (no geometry or duplicates)`
    );
    console.log(`📊 Total districts in database: ${finalCount[0].count}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n❌ Error seeding districts:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
