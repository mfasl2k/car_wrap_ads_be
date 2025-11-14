import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Comprehensive Auckland suburbs seed script
 * Covers all major Auckland areas with realistic boundaries
 * Run with: npx ts-node prisma/seed-auckland-comprehensive.ts
 */

const aucklandSuburbs = [
  // Central Auckland
  {
    name: "Auckland CBD",
    region: "Auckland Central",
    pop: 55000,
    area: 2.5,
    lat: -36.8485,
    lng: 174.7633,
    size: 0.02,
  },
  {
    name: "Parnell",
    region: "Auckland Central",
    pop: 18000,
    area: 3.2,
    lat: -36.8575,
    lng: 174.781,
    size: 0.025,
  },
  {
    name: "Newmarket",
    region: "Auckland Central",
    pop: 8500,
    area: 1.8,
    lat: -36.87,
    lng: 174.777,
    size: 0.018,
  },
  {
    name: "Grafton",
    region: "Auckland Central",
    pop: 6500,
    area: 1.5,
    lat: -36.864,
    lng: 174.77,
    size: 0.015,
  },
  {
    name: "Eden Terrace",
    region: "Auckland Central",
    pop: 4200,
    area: 0.9,
    lat: -36.868,
    lng: 174.758,
    size: 0.012,
  },

  // Western Central
  {
    name: "Ponsonby",
    region: "Auckland Central",
    pop: 12000,
    area: 2.1,
    lat: -36.856,
    lng: 174.748,
    size: 0.02,
  },
  {
    name: "Grey Lynn",
    region: "Auckland Central",
    pop: 9500,
    area: 1.6,
    lat: -36.865,
    lng: 174.742,
    size: 0.018,
  },
  {
    name: "Herne Bay",
    region: "Auckland Central",
    pop: 6800,
    area: 1.4,
    lat: -36.842,
    lng: 174.738,
    size: 0.016,
  },
  {
    name: "Westmere",
    region: "Auckland Central",
    pop: 7200,
    area: 1.5,
    lat: -36.853,
    lng: 174.732,
    size: 0.017,
  },
  {
    name: "St Marys Bay",
    region: "Auckland Central",
    pop: 3500,
    area: 0.8,
    lat: -36.848,
    lng: 174.752,
    size: 0.012,
  },
  {
    name: "Freemans Bay",
    region: "Auckland Central",
    pop: 4100,
    area: 0.7,
    lat: -36.852,
    lng: 174.759,
    size: 0.011,
  },

  // Eastern Central
  {
    name: "Mission Bay",
    region: "Auckland Central",
    pop: 5500,
    area: 1.2,
    lat: -36.852,
    lng: 174.828,
    size: 0.015,
  },
  {
    name: "St Heliers",
    region: "Auckland Central",
    pop: 8000,
    area: 2.4,
    lat: -36.858,
    lng: 174.854,
    size: 0.022,
  },
  {
    name: "Kohimarama",
    region: "Auckland Central",
    pop: 5800,
    area: 1.6,
    lat: -36.854,
    lng: 174.838,
    size: 0.017,
  },
  {
    name: "Glendowie",
    region: "Auckland Central",
    pop: 7200,
    area: 2.8,
    lat: -36.868,
    lng: 174.868,
    size: 0.024,
  },
  {
    name: "St Johns",
    region: "Auckland Central",
    pop: 9500,
    area: 3.2,
    lat: -36.878,
    lng: 174.842,
    size: 0.025,
  },

  // Southern Central
  {
    name: "Remuera",
    region: "Auckland Central",
    pop: 23000,
    area: 7.8,
    lat: -36.878,
    lng: 174.798,
    size: 0.035,
  },
  {
    name: "Epsom",
    region: "Auckland Central",
    pop: 16000,
    area: 5.2,
    lat: -36.892,
    lng: 174.772,
    size: 0.028,
  },
  {
    name: "Mount Eden",
    region: "Auckland Central",
    pop: 15000,
    area: 4.5,
    lat: -36.882,
    lng: 174.76,
    size: 0.026,
  },
  {
    name: "Mount Albert",
    region: "Auckland Central",
    pop: 14500,
    area: 4.2,
    lat: -36.892,
    lng: 174.728,
    size: 0.025,
  },
  {
    name: "Sandringham",
    region: "Auckland Central",
    pop: 12000,
    area: 3.5,
    lat: -36.912,
    lng: 174.748,
    size: 0.023,
  },
  {
    name: "Kingsland",
    region: "Auckland Central",
    pop: 7500,
    area: 1.8,
    lat: -36.872,
    lng: 174.748,
    size: 0.018,
  },
  {
    name: "Morningside",
    region: "Auckland Central",
    pop: 8200,
    area: 2.1,
    lat: -36.878,
    lng: 174.738,
    size: 0.02,
  },

  // North Shore - Devonport
  {
    name: "Devonport",
    region: "North Shore",
    pop: 5800,
    area: 1.9,
    lat: -36.828,
    lng: 174.798,
    size: 0.019,
  },
  {
    name: "Narrow Neck",
    region: "North Shore",
    pop: 3200,
    area: 0.9,
    lat: -36.818,
    lng: 174.802,
    size: 0.013,
  },
  {
    name: "Cheltenham",
    region: "North Shore",
    pop: 4500,
    area: 1.2,
    lat: -36.812,
    lng: 174.788,
    size: 0.015,
  },
  {
    name: "Hauraki",
    region: "North Shore",
    pop: 4800,
    area: 1.4,
    lat: -36.808,
    lng: 174.772,
    size: 0.016,
  },
  {
    name: "Takapuna",
    region: "North Shore",
    pop: 11000,
    area: 3.1,
    lat: -36.788,
    lng: 174.778,
    size: 0.024,
  },
  {
    name: "Milford",
    region: "North Shore",
    pop: 7800,
    area: 2.2,
    lat: -36.768,
    lng: 174.782,
    size: 0.021,
  },
  {
    name: "Forrest Hill",
    region: "North Shore",
    pop: 9200,
    area: 2.8,
    lat: -36.758,
    lng: 174.752,
    size: 0.023,
  },
  {
    name: "Sunnynook",
    region: "North Shore",
    pop: 8500,
    area: 2.5,
    lat: -36.742,
    lng: 174.742,
    size: 0.022,
  },

  // North Shore - Glenfield/Birkenhead
  {
    name: "Birkenhead",
    region: "North Shore",
    pop: 12500,
    area: 3.8,
    lat: -36.812,
    lng: 174.738,
    size: 0.026,
  },
  {
    name: "Northcote",
    region: "North Shore",
    pop: 11200,
    area: 3.2,
    lat: -36.802,
    lng: 174.748,
    size: 0.024,
  },
  {
    name: "Birkdale",
    region: "North Shore",
    pop: 9800,
    area: 3.0,
    lat: -36.788,
    lng: 174.728,
    size: 0.023,
  },
  {
    name: "Beach Haven",
    region: "North Shore",
    pop: 8200,
    area: 2.4,
    lat: -36.772,
    lng: 174.712,
    size: 0.022,
  },
  {
    name: "Glenfield",
    region: "North Shore",
    pop: 18500,
    area: 5.6,
    lat: -36.778,
    lng: 174.718,
    size: 0.03,
  },
  {
    name: "Browns Bay",
    region: "North Shore",
    pop: 15200,
    area: 4.2,
    lat: -36.712,
    lng: 174.748,
    size: 0.028,
  },
  {
    name: "Rothesay Bay",
    region: "North Shore",
    pop: 6800,
    area: 1.8,
    lat: -36.722,
    lng: 174.738,
    size: 0.019,
  },
  {
    name: "Murrays Bay",
    region: "North Shore",
    pop: 7200,
    area: 2.0,
    lat: -36.718,
    lng: 174.752,
    size: 0.02,
  },
  {
    name: "Mairangi Bay",
    region: "North Shore",
    pop: 10500,
    area: 2.9,
    lat: -36.738,
    lng: 174.758,
    size: 0.023,
  },

  // North Shore - Albany/Upper Harbour
  {
    name: "Albany",
    region: "North Shore",
    pop: 35000,
    area: 12.5,
    lat: -36.732,
    lng: 174.698,
    size: 0.045,
  },
  {
    name: "Rosedale",
    region: "North Shore",
    pop: 12500,
    area: 4.5,
    lat: -36.742,
    lng: 174.712,
    size: 0.027,
  },
  {
    name: "Greenhithe",
    region: "North Shore",
    pop: 9200,
    area: 3.8,
    lat: -36.768,
    lng: 174.682,
    size: 0.025,
  },
  {
    name: "Pinehill",
    region: "North Shore",
    pop: 14800,
    area: 4.8,
    lat: -36.752,
    lng: 174.722,
    size: 0.028,
  },
  {
    name: "Unsworth Heights",
    region: "North Shore",
    pop: 8500,
    area: 2.6,
    lat: -36.762,
    lng: 174.708,
    size: 0.022,
  },

  // Eastern Suburbs
  {
    name: "Ellerslie",
    region: "Eastern Suburbs",
    pop: 12500,
    area: 4.2,
    lat: -36.902,
    lng: 174.798,
    size: 0.026,
  },
  {
    name: "Panmure",
    region: "Eastern Suburbs",
    pop: 13200,
    area: 4.8,
    lat: -36.912,
    lng: 174.852,
    size: 0.028,
  },
  {
    name: "Mount Wellington",
    region: "Eastern Suburbs",
    pop: 16500,
    area: 6.2,
    lat: -36.918,
    lng: 174.838,
    size: 0.031,
  },
  {
    name: "Glen Innes",
    region: "Eastern Suburbs",
    pop: 18200,
    area: 5.8,
    lat: -36.892,
    lng: 174.858,
    size: 0.03,
  },
  {
    name: "Point England",
    region: "Eastern Suburbs",
    pop: 14800,
    area: 4.5,
    lat: -36.898,
    lng: 174.872,
    size: 0.027,
  },
  {
    name: "Tamaki",
    region: "Eastern Suburbs",
    pop: 16500,
    area: 5.2,
    lat: -36.888,
    lng: 174.882,
    size: 0.029,
  },
  {
    name: "Half Moon Bay",
    region: "Eastern Suburbs",
    pop: 8500,
    area: 2.8,
    lat: -36.888,
    lng: 174.922,
    size: 0.023,
  },
  {
    name: "Bucklands Beach",
    region: "Eastern Suburbs",
    pop: 11200,
    area: 3.5,
    lat: -36.898,
    lng: 174.908,
    size: 0.025,
  },
  {
    name: "Eastern Beach",
    region: "Eastern Suburbs",
    pop: 7800,
    area: 2.2,
    lat: -36.912,
    lng: 174.918,
    size: 0.021,
  },
  {
    name: "Howick",
    region: "Eastern Suburbs",
    pop: 32000,
    area: 11.6,
    lat: -36.992,
    lng: 174.928,
    size: 0.043,
  },
  {
    name: "Pakuranga",
    region: "Eastern Suburbs",
    pop: 28500,
    area: 9.8,
    lat: -36.918,
    lng: 174.902,
    size: 0.039,
  },
  {
    name: "Highland Park",
    region: "Eastern Suburbs",
    pop: 15200,
    area: 5.2,
    lat: -36.932,
    lng: 174.892,
    size: 0.028,
  },
  {
    name: "Botany Downs",
    region: "Eastern Suburbs",
    pop: 28000,
    area: 8.7,
    lat: -36.938,
    lng: 174.922,
    size: 0.037,
  },
  {
    name: "Dannemora",
    region: "Eastern Suburbs",
    pop: 18500,
    area: 6.5,
    lat: -36.952,
    lng: 174.938,
    size: 0.032,
  },

  // South Auckland - Manukau
  {
    name: "Manukau City Centre",
    region: "South Auckland",
    pop: 25000,
    area: 7.5,
    lat: -37.002,
    lng: 174.882,
    size: 0.035,
  },
  {
    name: "Manukau Heights",
    region: "South Auckland",
    pop: 12500,
    area: 4.2,
    lat: -37.012,
    lng: 174.868,
    size: 0.026,
  },
  {
    name: "Mangere",
    region: "South Auckland",
    pop: 42000,
    area: 15.8,
    lat: -37.008,
    lng: 174.802,
    size: 0.05,
  },
  {
    name: "Mangere East",
    region: "South Auckland",
    pop: 18500,
    area: 6.2,
    lat: -37.002,
    lng: 174.818,
    size: 0.031,
  },
  {
    name: "Mangere Bridge",
    region: "South Auckland",
    pop: 8200,
    area: 2.8,
    lat: -36.988,
    lng: 174.778,
    size: 0.023,
  },
  {
    name: "Favona",
    region: "South Auckland",
    pop: 14500,
    area: 4.8,
    lat: -37.018,
    lng: 174.812,
    size: 0.028,
  },
  {
    name: "Papatoetoe",
    region: "South Auckland",
    pop: 42500,
    area: 14.2,
    lat: -37.012,
    lng: 174.852,
    size: 0.047,
  },
  {
    name: "Otahuhu",
    region: "South Auckland",
    pop: 16000,
    area: 5.3,
    lat: -36.952,
    lng: 174.842,
    size: 0.029,
  },
  {
    name: "Otara",
    region: "South Auckland",
    pop: 38000,
    area: 12.5,
    lat: -37.002,
    lng: 174.892,
    size: 0.044,
  },
  {
    name: "Flat Bush",
    region: "South Auckland",
    pop: 45000,
    area: 18.2,
    lat: -36.978,
    lng: 174.932,
    size: 0.054,
  },
  {
    name: "Clover Park",
    region: "South Auckland",
    pop: 18200,
    area: 6.8,
    lat: -37.018,
    lng: 174.892,
    size: 0.033,
  },

  // South Auckland - Papakura/Pukekohe
  {
    name: "Papakura",
    region: "South Auckland",
    pop: 52000,
    area: 14.2,
    lat: -37.068,
    lng: 174.942,
    size: 0.047,
  },
  {
    name: "Takanini",
    region: "South Auckland",
    pop: 22500,
    area: 8.5,
    lat: -37.048,
    lng: 174.912,
    size: 0.037,
  },
  {
    name: "Conifer Grove",
    region: "South Auckland",
    pop: 8500,
    area: 3.2,
    lat: -37.058,
    lng: 174.928,
    size: 0.024,
  },
  {
    name: "Karaka",
    region: "South Auckland",
    pop: 5200,
    area: 22.5,
    lat: -37.098,
    lng: 174.882,
    size: 0.06,
  },
  {
    name: "Pukekohe",
    region: "South Auckland",
    pop: 28500,
    area: 16.8,
    lat: -37.202,
    lng: 174.902,
    size: 0.052,
  },

  // Western Suburbs
  {
    name: "New Lynn",
    region: "Western Suburbs",
    pop: 14000,
    area: 4.9,
    lat: -36.908,
    lng: 174.688,
    size: 0.028,
  },
  {
    name: "Avondale",
    region: "Western Suburbs",
    pop: 18500,
    area: 6.2,
    lat: -36.902,
    lng: 174.702,
    size: 0.031,
  },
  {
    name: "Blockhouse Bay",
    region: "Western Suburbs",
    pop: 11200,
    area: 3.8,
    lat: -36.912,
    lng: 174.718,
    size: 0.025,
  },
  {
    name: "Lynfield",
    region: "Western Suburbs",
    pop: 9800,
    area: 3.2,
    lat: -36.922,
    lng: 174.728,
    size: 0.024,
  },
  {
    name: "New Windsor",
    region: "Western Suburbs",
    pop: 10500,
    area: 3.5,
    lat: -36.918,
    lng: 174.742,
    size: 0.025,
  },
  {
    name: "Hillsborough",
    region: "Western Suburbs",
    pop: 8200,
    area: 2.8,
    lat: -36.922,
    lng: 174.758,
    size: 0.023,
  },
  {
    name: "Three Kings",
    region: "Western Suburbs",
    pop: 7500,
    area: 2.2,
    lat: -36.912,
    lng: 174.772,
    size: 0.021,
  },
  {
    name: "Royal Oak",
    region: "Western Suburbs",
    pop: 9500,
    area: 2.8,
    lat: -36.928,
    lng: 174.782,
    size: 0.023,
  },
  {
    name: "Onehunga",
    region: "Western Suburbs",
    pop: 15200,
    area: 5.2,
    lat: -36.928,
    lng: 174.782,
    size: 0.029,
  },
  {
    name: "Penrose",
    region: "Western Suburbs",
    pop: 12500,
    area: 6.8,
    lat: -36.922,
    lng: 174.808,
    size: 0.033,
  },
  {
    name: "Glen Eden",
    region: "Western Suburbs",
    pop: 16500,
    area: 6.5,
    lat: -36.912,
    lng: 174.652,
    size: 0.032,
  },
  {
    name: "Kelston",
    region: "Western Suburbs",
    pop: 13200,
    area: 4.8,
    lat: -36.908,
    lng: 174.672,
    size: 0.028,
  },
  {
    name: "Glendene",
    region: "Western Suburbs",
    pop: 11800,
    area: 3.8,
    lat: -36.888,
    lng: 174.682,
    size: 0.025,
  },
  {
    name: "Te Atatu South",
    region: "Western Suburbs",
    pop: 14200,
    area: 4.5,
    lat: -36.872,
    lng: 174.672,
    size: 0.027,
  },
  {
    name: "Te Atatu Peninsula",
    region: "Western Suburbs",
    pop: 12800,
    area: 3.8,
    lat: -36.858,
    lng: 174.658,
    size: 0.025,
  },
  {
    name: "Henderson",
    region: "Western Suburbs",
    pop: 17000,
    area: 6.4,
    lat: -36.878,
    lng: 174.638,
    size: 0.032,
  },
  {
    name: "Sunnyvale",
    region: "Western Suburbs",
    pop: 8500,
    area: 2.8,
    lat: -36.868,
    lng: 174.628,
    size: 0.023,
  },
  {
    name: "Ranui",
    region: "Western Suburbs",
    pop: 18500,
    area: 7.2,
    lat: -36.898,
    lng: 174.618,
    size: 0.034,
  },
  {
    name: "Massey",
    region: "Western Suburbs",
    pop: 22500,
    area: 9.5,
    lat: -36.838,
    lng: 174.618,
    size: 0.039,
  },
  {
    name: "Swanson",
    region: "Western Suburbs",
    pop: 6200,
    area: 8.5,
    lat: -36.878,
    lng: 174.578,
    size: 0.037,
  },

  // Additional Central Auckland
  {
    name: "Mount Roskill",
    region: "Central Auckland",
    pop: 24500,
    area: 7.8,
    lat: -36.918,
    lng: 174.742,
    size: 0.035,
  },
  {
    name: "Wesley",
    region: "Central Auckland",
    pop: 8500,
    area: 2.5,
    lat: -36.928,
    lng: 174.722,
    size: 0.022,
  },
  {
    name: "Owairaka",
    region: "Central Auckland",
    pop: 7200,
    area: 2.1,
    lat: -36.908,
    lng: 174.718,
    size: 0.02,
  },
  {
    name: "Waterview",
    region: "Central Auckland",
    pop: 5800,
    area: 1.8,
    lat: -36.878,
    lng: 174.718,
    size: 0.019,
  },
  {
    name: "Point Chevalier",
    region: "Central Auckland",
    pop: 11500,
    area: 3.5,
    lat: -36.868,
    lng: 174.708,
    size: 0.025,
  },
];

/**
 * Create a simple rectangular polygon from center point and size
 */
function createPolygon(lat: number, lng: number, size: number): string {
  const halfSize = size / 2;

  const minLng = lng - halfSize;
  const maxLng = lng + halfSize;
  const minLat = lat - halfSize;
  const maxLat = lat + halfSize;

  return `POLYGON((${minLng} ${minLat}, ${maxLng} ${minLat}, ${maxLng} ${maxLat}, ${minLng} ${maxLat}, ${minLng} ${minLat}))`;
}

/**
 * Main seed function
 */
async function main() {
  try {
    console.log("🗺️  Comprehensive Auckland Suburbs Seeder\n");
    console.log("=".repeat(60));

    // Clear existing districts
    console.log("\n🗑️  Clearing existing districts...");
    await prisma.$executeRaw`DELETE FROM location_district`;
    console.log("✅ Cleared existing data\n");

    // Insert all suburbs
    console.log("📍 Inserting Auckland suburbs...\n");
    let insertedCount = 0;

    for (const suburb of aucklandSuburbs) {
      const wkt = createPolygon(suburb.lat, suburb.lng, suburb.size);

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
            ${suburb.name},
            'Auckland',
            ${suburb.region},
            ST_SetSRID(ST_GeomFromText(${wkt}), 4326),
            ${suburb.pop},
            ${suburb.area},
            true,
            NOW()
          )
        `;

        insertedCount++;
        console.log(
          `✅ ${insertedCount.toString().padStart(3)}) ${suburb.name.padEnd(
            30
          )} | ${suburb.region.padEnd(20)} | ${suburb.pop
            .toLocaleString()
            .padStart(7)} pop | ${suburb.area.toFixed(1).padStart(6)} km²`
        );
      } catch (error: any) {
        console.error(`❌ Error inserting ${suburb.name}:`, error.message);
      }
    }

    // Verify final count
    const finalCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM location_district
    `;

    const regionStats = await prisma.$queryRaw<
      Array<{ region: string; count: bigint; total_pop: bigint }>
    >`
      SELECT 
        region,
        COUNT(*) as count,
        SUM(population) as total_pop
      FROM location_district
      GROUP BY region
      ORDER BY region
    `;

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Successfully imported ${insertedCount} Auckland suburbs!`);
    console.log(`📊 Total districts in database: ${finalCount[0].count}`);
    console.log("\n📈 By Region:");
    regionStats.forEach((stat) => {
      console.log(
        `   ${stat.region.padEnd(25)} : ${String(stat.count).padStart(
          3
        )} suburbs | ${Number(stat.total_pop)
          .toLocaleString()
          .padStart(10)} people`
      );
    });
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Error seeding districts:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
