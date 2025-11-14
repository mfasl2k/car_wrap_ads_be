import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const prisma = new PrismaClient();

/**
 * Helper function to convert WKT POLYGON to coordinates array
 */
const wktToCoordinates = (wkt: string): number[][] => {
  const coordString = wkt.replace("POLYGON((", "").replace("))", "");

  return coordString.split(",").map((point) => {
    const [lng, lat] = point.trim().split(/\s+/).map(Number);
    return [lng, lat];
  });
};

/**
 * Get all available districts
 * GET /api/districts
 */
export const getAllDistricts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { city, region, isActive } = req.query;

    // Build where clause
    const where: any = {};

    if (city && typeof city === "string") {
      where.city = city;
    }

    if (region && typeof region === "string") {
      where.region = region;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    // Fetch districts with geometry
    const districts = await prisma.$queryRaw<any[]>`
      SELECT 
        district_id as "districtId",
        district_name as "districtName",
        city,
        region,
        population,
        area_km2 as "areaKm2",
        is_active as "isActive",
        ST_AsText(polygon) as wkt,
        created_at as "createdAt"
      FROM location_district
      WHERE 
        (${where.city !== undefined}::boolean = false OR city = ${where.city})
        AND (${where.region !== undefined}::boolean = false OR region = ${
      where.region
    })
        AND (${where.isActive !== undefined}::boolean = false OR is_active = ${
      where.isActive
    })
      ORDER BY district_name ASC
    `;

    // Convert WKT to coordinates and GeoJSON
    const districtsWithGeometry = districts.map((district) => {
      const coordinates = wktToCoordinates(district.wkt);
      return {
        ...district,
        coordinates,
        geoJson: {
          type: "Polygon",
          coordinates: [coordinates],
        },
      };
    });

    // Remove WKT from response
    districtsWithGeometry.forEach((d) => delete d.wkt);

    res.status(200).json({
      status: "success",
      data: {
        districts: districtsWithGeometry,
        count: districtsWithGeometry.length,
      },
    });
  }
);

/**
 * Get single district by ID
 * GET /api/districts/:districtId
 */
export const getDistrictById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { districtId } = req.params;

    const districts = await prisma.$queryRaw<any[]>`
      SELECT 
        district_id as "districtId",
        district_name as "districtName",
        city,
        region,
        population,
        area_km2 as "areaKm2",
        is_active as "isActive",
        ST_AsText(polygon) as wkt,
        created_at as "createdAt"
      FROM location_district
      WHERE district_id = ${districtId}::uuid
    `;

    if (!districts || districts.length === 0) {
      throw new AppError("District not found", 404);
    }

    const district = districts[0];
    const coordinates = wktToCoordinates(district.wkt);

    const responseData = {
      ...district,
      coordinates,
      geoJson: {
        type: "Polygon",
        coordinates: [coordinates],
      },
    };

    delete responseData.wkt;

    res.status(200).json({
      status: "success",
      data: { district: responseData },
    });
  }
);

/**
 * Get districts by city (grouped)
 * GET /api/districts/by-city
 */
export const getDistrictsByCity = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const districts = await prisma.$queryRaw<any[]>`
      SELECT 
        city,
        COUNT(*)::int as "districtCount",
        SUM(population)::int as "totalPopulation",
        SUM(area_km2)::decimal as "totalArea"
      FROM location_district
      WHERE is_active = true
      GROUP BY city
      ORDER BY city ASC
    `;

    res.status(200).json({
      status: "success",
      data: { cities: districts },
    });
  }
);

/**
 * Check if a point is within any district
 * POST /api/districts/check-point
 */
export const checkPointInDistrict = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      throw new AppError("Latitude and longitude are required", 400);
    }

    // Find which district contains this point
    const results = await prisma.$queryRaw<any[]>`
      SELECT 
        district_id as "districtId",
        district_name as "districtName",
        city,
        population,
        ST_Within(
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
          polygon
        ) as "isInside"
      FROM location_district
      WHERE is_active = true
        AND ST_Within(
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
          polygon
        ) = true
      LIMIT 1
    `;

    res.status(200).json({
      status: "success",
      data: {
        found: results.length > 0,
        district: results[0] || null,
        point: { latitude, longitude },
      },
    });
  }
);
