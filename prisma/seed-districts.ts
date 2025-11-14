import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed script for Auckland location districts
 * Run with: npx ts-node prisma/seed-districts.ts
 */

const aucklandDistricts = [
  {
    districtName: "Auckland CBD",
    city: "Auckland",
    region: "Auckland",
    population: 55000,
    areaKm2: 2.5,
    // Rough boundaries: Queen St to Waterfront, Victoria Park to University
    wkt: "POLYGON((174.7580 -36.8400, 174.7720 -36.8400, 174.7720 -36.8520, 174.7580 -36.8520, 174.7580 -36.8400))",
  },
  {
    districtName: "Parnell",
    city: "Auckland",
    region: "Auckland",
    population: 18000,
    areaKm2: 3.2,
    wkt: "POLYGON((174.7720 -36.8450, 174.7900 -36.8450, 174.7900 -36.8600, 174.7720 -36.8600, 174.7720 -36.8450))",
  },
  {
    districtName: "Newmarket",
    city: "Auckland",
    region: "Auckland",
    population: 8500,
    areaKm2: 1.8,
    wkt: "POLYGON((174.7750 -36.8650, 174.7900 -36.8650, 174.7900 -36.8750, 174.7750 -36.8750, 174.7750 -36.8650))",
  },
  {
    districtName: "Ponsonby",
    city: "Auckland",
    region: "Auckland",
    population: 12000,
    areaKm2: 2.1,
    wkt: "POLYGON((174.7400 -36.8500, 174.7550 -36.8500, 174.7550 -36.8620, 174.7400 -36.8620, 174.7400 -36.8500))",
  },
  {
    districtName: "Grey Lynn",
    city: "Auckland",
    region: "Auckland",
    population: 9500,
    areaKm2: 1.6,
    wkt: "POLYGON((174.7350 -36.8600, 174.7500 -36.8600, 174.7500 -36.8700, 174.7350 -36.8700, 174.7350 -36.8600))",
  },
  {
    districtName: "Mount Eden",
    city: "Auckland",
    region: "Auckland",
    population: 15000,
    areaKm2: 4.5,
    wkt: "POLYGON((174.7550 -36.8750, 174.7750 -36.8750, 174.7750 -36.8950, 174.7550 -36.8950, 174.7550 -36.8750))",
  },
  {
    districtName: "Epsom",
    city: "Auckland",
    region: "Auckland",
    population: 16000,
    areaKm2: 5.2,
    wkt: "POLYGON((174.7750 -36.8850, 174.7950 -36.8850, 174.7950 -36.9050, 174.7750 -36.9050, 174.7750 -36.8850))",
  },
  {
    districtName: "Remuera",
    city: "Auckland",
    region: "Auckland",
    population: 23000,
    areaKm2: 7.8,
    wkt: "POLYGON((174.7950 -36.8700, 174.8200 -36.8700, 174.8200 -36.8950, 174.7950 -36.8950, 174.7950 -36.8700))",
  },
  {
    districtName: "Mission Bay",
    city: "Auckland",
    region: "Auckland",
    population: 5500,
    areaKm2: 1.2,
    wkt: "POLYGON((174.8300 -36.8500, 174.8450 -36.8500, 174.8450 -36.8600, 174.8300 -36.8600, 174.8300 -36.8500))",
  },
  {
    districtName: "St Heliers",
    city: "Auckland",
    region: "Auckland",
    population: 8000,
    areaKm2: 2.4,
    wkt: "POLYGON((174.8450 -36.8500, 174.8650 -36.8500, 174.8650 -36.8650, 174.8450 -36.8650, 174.8450 -36.8500))",
  },
  {
    districtName: "Devonport",
    city: "Auckland",
    region: "Auckland",
    population: 5800,
    areaKm2: 1.9,
    wkt: "POLYGON((174.7900 -36.8250, 174.8050 -36.8250, 174.8050 -36.8350, 174.7900 -36.8350, 174.7900 -36.8250))",
  },
  {
    districtName: "Takapuna",
    city: "Auckland",
    region: "Auckland",
    population: 11000,
    areaKm2: 3.1,
    wkt: "POLYGON((174.7700 -36.7900, 174.7900 -36.7900, 174.7900 -36.8050, 174.7700 -36.8050, 174.7700 -36.7900))",
  },
  {
    districtName: "Albany",
    city: "Auckland",
    region: "Auckland",
    population: 35000,
    areaKm2: 12.5,
    wkt: "POLYGON((174.6900 -36.7200, 174.7300 -36.7200, 174.7300 -36.7500, 174.6900 -36.7500, 174.6900 -36.7200))",
  },
  {
    districtName: "Manukau",
    city: "Auckland",
    region: "Auckland",
    population: 75000,
    areaKm2: 18.3,
    wkt: "POLYGON((174.8600 -37.0000, 174.9000 -37.0000, 174.9000 -37.0300, 174.8600 -37.0300, 174.8600 -37.0000))",
  },
  {
    districtName: "Botany",
    city: "Auckland",
    region: "Auckland",
    population: 28000,
    areaKm2: 8.7,
    wkt: "POLYGON((174.9000 -36.9200, 174.9300 -36.9200, 174.9300 -36.9500, 174.9000 -36.9500, 174.9000 -36.9200))",
  },
  {
    districtName: "Henderson",
    city: "Auckland",
    region: "Auckland",
    population: 17000,
    areaKm2: 6.4,
    wkt: "POLYGON((174.6300 -36.8700, 174.6600 -36.8700, 174.6600 -36.8950, 174.6300 -36.8950, 174.6300 -36.8700))",
  },
  {
    districtName: "New Lynn",
    city: "Auckland",
    region: "Auckland",
    population: 14000,
    areaKm2: 4.9,
    wkt: "POLYGON((174.6800 -36.9000, 174.7000 -36.9000, 174.7000 -36.9200, 174.6800 -36.9200, 174.6800 -36.9000))",
  },
  {
    districtName: "Otahuhu",
    city: "Auckland",
    region: "Auckland",
    population: 16000,
    areaKm2: 5.3,
    wkt: "POLYGON((174.8400 -36.9500, 174.8650 -36.9500, 174.8650 -36.9700, 174.8400 -36.9700, 174.8400 -36.9500))",
  },
  {
    districtName: "Papakura",
    city: "Auckland",
    region: "Auckland",
    population: 52000,
    areaKm2: 14.2,
    wkt: "POLYGON((174.9300 -37.0500, 174.9800 -37.0500, 174.9800 -37.0850, 174.9300 -37.0850, 174.9300 -37.0500))",
  },
  {
    districtName: "Howick",
    city: "Auckland",
    region: "Auckland",
    population: 32000,
    areaKm2: 11.6,
    wkt: "POLYGON((174.9200 -36.9800, 174.9600 -36.9800, 174.9600 -37.0100, 174.9200 -37.0100, 174.9200 -36.9800))",
  },
];

async function seedDistricts() {
  console.log("🌱 Starting district seed...\n");

  try {
    // Clear existing districts
    console.log("🗑️  Clearing existing districts...");
    await prisma.locationDistrict.deleteMany({});
    console.log("✅ Existing districts cleared\n");

    // Insert districts using raw SQL for PostGIS geometry
    console.log("📍 Inserting Auckland districts...");

    for (const district of aucklandDistricts) {
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
        ) VALUES (
          gen_random_uuid(),
          ${district.districtName},
          ${district.city},
          ${district.region},
          ST_SetSRID(ST_GeomFromText(${district.wkt}), 4326),
          ${district.population},
          ${district.areaKm2},
          true,
          NOW()
        )
      `;
      console.log(
        `  ✓ ${
          district.districtName
        } (${district.population.toLocaleString()} pop, ${
          district.areaKm2
        } km²)`
      );
    }

    console.log(
      `\n✅ Successfully seeded ${aucklandDistricts.length} Auckland districts!`
    );

    // Verify
    const count = await prisma.locationDistrict.count();
    console.log(`\n📊 Total districts in database: ${count}`);
  } catch (error) {
    console.error("\n❌ Error seeding districts:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedDistricts().catch((e) => {
  console.error(e);
  process.exit(1);
});
