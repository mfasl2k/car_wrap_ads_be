import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const prisma = new PrismaClient();

/**
 * Helper function to convert coordinates array to WKT POLYGON format
 * Input: [[lng1, lat1], [lng2, lat2], [lng3, lat3], [lng4, lat4], [lng1, lat1]]
 * Output: "POLYGON((lng1 lat1, lng2 lat2, lng3 lat3, lng4 lat4, lng1 lat1))"
 */
const coordinatesToWKT = (coordinates: number[][]): string => {
  if (!coordinates || coordinates.length < 4) {
    throw new Error(
      "Polygon must have at least 4 coordinates (including closing point)"
    );
  }

  // Ensure polygon is closed (first point === last point)
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    // Auto-close the polygon
    coordinates.push([first[0], first[1]]);
  }

  // Convert to WKT format: "lng lat, lng lat, ..."
  const wktPoints = coordinates
    .map((coord) => `${coord[0]} ${coord[1]}`)
    .join(", ");

  return `POLYGON((${wktPoints}))`;
};

/**
 * Helper function to convert WKT POLYGON to coordinates array
 * Input: "POLYGON((lng1 lat1, lng2 lat2, lng3 lat3, lng4 lat4, lng1 lat1))"
 * Output: [[lng1, lat1], [lng2, lat2], [lng3, lat3], [lng4, lat4], [lng1, lat1]]
 */
const wktToCoordinates = (wkt: string): number[][] => {
  // Extract coordinates from WKT format
  const coordString = wkt.replace("POLYGON((", "").replace("))", "");

  // Split by comma (with or without space after comma)
  return coordString.split(",").map((point) => {
    const [lng, lat] = point.trim().split(/\s+/).map(Number);
    return [lng, lat];
  });
};

/**
 * Add district to campaign target areas
 * POST /api/campaigns/:campaignId/target-areas
 */
export const createTargetArea = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId } = req.params;
    const { districtId, priorityLevel } = req.body;

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Get advertiser profile
    const advertiser = await prisma.advertiser.findUnique({
      where: { userId: req.user.userId },
    });

    if (!advertiser) {
      throw new AppError("Advertiser profile not found", 404);
    }

    // Check if campaign exists and belongs to this advertiser
    const campaign = await prisma.campaign.findUnique({
      where: { campaignId },
    });

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    if (campaign.advertiserId !== advertiser.advertiserId) {
      throw new AppError(
        "You can only add target areas to your own campaigns",
        403
      );
    }

    // Check if district exists
    const district = await prisma.locationDistrict.findUnique({
      where: { districtId },
    });

    if (!district) {
      throw new AppError("District not found", 404);
    }

    if (!district.isActive) {
      throw new AppError("This district is not currently available", 400);
    }

    // Check if district already added to campaign
    const existing = await prisma.campaignTargetArea.findUnique({
      where: {
        campaignId_districtId: {
          campaignId,
          districtId,
        },
      },
    });

    if (existing) {
      throw new AppError("This district is already added to the campaign", 400);
    }

    // Create target area
    const targetArea = await prisma.campaignTargetArea.create({
      data: {
        campaignId,
        districtId,
        priorityLevel: priorityLevel || 5,
      },
      include: {
        district: true,
      },
    });

    // Fetch district geometry
    const districtWithGeometry = await prisma.$queryRaw<any[]>`
      SELECT 
        ST_AsText(polygon) as wkt
      FROM location_district
      WHERE district_id = ${districtId}::uuid
    `;

    const coordinates = wktToCoordinates(districtWithGeometry[0].wkt);

    res.status(201).json({
      status: "success",
      message: "District added to campaign successfully",
      data: {
        targetArea: {
          targetAreaId: targetArea.targetAreaId,
          campaignId: targetArea.campaignId,
          districtId: targetArea.districtId,
          districtName: targetArea.district.districtName,
          city: targetArea.district.city,
          priorityLevel: targetArea.priorityLevel,
          createdAt: targetArea.createdAt,
          coordinates,
          geoJson: {
            type: "Polygon",
            coordinates: [coordinates],
          },
        },
      },
    });
  }
);

/**
 * Get all target areas for a campaign
 * GET /api/campaigns/:campaignId/target-areas
 */
export const getCampaignTargetAreas = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId } = req.params;

    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { campaignId },
    });

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    // Fetch target areas with district info and geometry
    const targetAreas = await prisma.$queryRaw<any[]>`
      SELECT 
        cta.target_area_id as "targetAreaId",
        cta.campaign_id as "campaignId",
        cta.district_id as "districtId",
        cta.priority_level as "priorityLevel",
        cta.created_at as "createdAt",
        ld.district_name as "districtName",
        ld.city,
        ld.region,
        ld.population,
        ld.area_km2 as "areaKm2",
        ST_AsText(ld.polygon) as wkt
      FROM campaign_target_area cta
      JOIN location_district ld ON cta.district_id = ld.district_id
      WHERE cta.campaign_id = ${campaignId}::uuid
      ORDER BY cta.priority_level DESC, cta.created_at DESC
    `;

    // Convert WKT to coordinates and GeoJSON for each area
    const areasWithCoordinates = targetAreas.map((area) => {
      const coordinates = wktToCoordinates(area.wkt);
      return {
        targetAreaId: area.targetAreaId,
        campaignId: area.campaignId,
        districtId: area.districtId,
        districtName: area.districtName,
        city: area.city,
        region: area.region,
        population: area.population,
        areaKm2: area.areaKm2,
        priorityLevel: area.priorityLevel,
        createdAt: area.createdAt,
        coordinates,
        geoJson: {
          type: "Polygon",
          coordinates: [coordinates],
        },
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        targetAreas: areasWithCoordinates,
        count: areasWithCoordinates.length,
      },
    });
  }
);

/**
 * Get single target area by ID
 * GET /api/target-areas/:areaId
 */
export const getTargetAreaById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { areaId } = req.params;

    // Fetch target area with district info and geometry
    const targetAreas = await prisma.$queryRaw<any[]>`
      SELECT 
        cta.target_area_id as "targetAreaId",
        cta.campaign_id as "campaignId",
        cta.district_id as "districtId",
        cta.priority_level as "priorityLevel",
        cta.created_at as "createdAt",
        ld.district_name as "districtName",
        ld.city,
        ld.region,
        ld.population,
        ld.area_km2 as "areaKm2",
        ST_AsText(ld.polygon) as wkt
      FROM campaign_target_area cta
      JOIN location_district ld ON cta.district_id = ld.district_id
      WHERE cta.target_area_id = ${areaId}::uuid
    `;

    if (!targetAreas || targetAreas.length === 0) {
      throw new AppError("Target area not found", 404);
    }

    const area = targetAreas[0];
    const coordinates = wktToCoordinates(area.wkt);

    const responseData = {
      targetAreaId: area.targetAreaId,
      campaignId: area.campaignId,
      districtId: area.districtId,
      districtName: area.districtName,
      city: area.city,
      region: area.region,
      population: area.population,
      areaKm2: area.areaKm2,
      priorityLevel: area.priorityLevel,
      createdAt: area.createdAt,
      coordinates,
      geoJson: {
        type: "Polygon",
        coordinates: [coordinates],
      },
    };

    res.status(200).json({
      status: "success",
      data: { targetArea: responseData },
    });
  }
);

/**
 * Update target area priority level
 * PUT /api/target-areas/:areaId
 */
export const updateTargetArea = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { areaId } = req.params;
    const { priorityLevel } = req.body;

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Get advertiser profile
    const advertiser = await prisma.advertiser.findUnique({
      where: { userId: req.user.userId },
    });

    if (!advertiser) {
      throw new AppError("Advertiser profile not found", 404);
    }

    // Check if target area exists and get campaign
    const existingArea = await prisma.$queryRaw<any[]>`
      SELECT cta.target_area_id, cta.campaign_id, c.advertiser_id
      FROM campaign_target_area cta
      JOIN campaign c ON c.campaign_id = cta.campaign_id
      WHERE cta.target_area_id = ${areaId}::uuid
    `;

    if (!existingArea || existingArea.length === 0) {
      throw new AppError("Target area not found", 404);
    }

    if (existingArea[0].advertiser_id !== advertiser.advertiserId) {
      throw new AppError(
        "You can only update target areas for your own campaigns",
        403
      );
    }

    // Update priority level
    await prisma.campaignTargetArea.update({
      where: { targetAreaId: areaId },
      data: { priorityLevel },
    });

    // Fetch updated target area with district info
    const updatedAreas = await prisma.$queryRaw<any[]>`
      SELECT 
        cta.target_area_id as "targetAreaId",
        cta.campaign_id as "campaignId",
        cta.district_id as "districtId",
        cta.priority_level as "priorityLevel",
        cta.created_at as "createdAt",
        ld.district_name as "districtName",
        ld.city,
        ld.region,
        ld.population,
        ld.area_km2 as "areaKm2",
        ST_AsText(ld.polygon) as wkt
      FROM campaign_target_area cta
      JOIN location_district ld ON cta.district_id = ld.district_id
      WHERE cta.target_area_id = ${areaId}::uuid
    `;

    const area = updatedAreas[0];
    const coords = wktToCoordinates(area.wkt);

    const responseData = {
      targetAreaId: area.targetAreaId,
      campaignId: area.campaignId,
      districtId: area.districtId,
      districtName: area.districtName,
      city: area.city,
      region: area.region,
      population: area.population,
      areaKm2: area.areaKm2,
      priorityLevel: area.priorityLevel,
      createdAt: area.createdAt,
      coordinates: coords,
      geoJson: {
        type: "Polygon",
        coordinates: [coords],
      },
    };

    res.status(200).json({
      status: "success",
      message: "Target area updated successfully",
      data: { targetArea: responseData },
    });
  }
);

/**
 * Delete target area
 * DELETE /api/target-areas/:areaId
 */
export const deleteTargetArea = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { areaId } = req.params;

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Get advertiser profile
    const advertiser = await prisma.advertiser.findUnique({
      where: { userId: req.user.userId },
    });

    if (!advertiser) {
      throw new AppError("Advertiser profile not found", 404);
    }

    // Check if target area exists and belongs to advertiser's campaign
    const existingArea = await prisma.$queryRaw<any[]>`
      SELECT cta.target_area_id, cta.campaign_id, cta."areaName", cta.priority_level, c.advertiser_id
      FROM campaign_target_area cta
      JOIN campaign c ON c.campaign_id = cta.campaign_id
      WHERE cta.target_area_id = ${areaId}::uuid
    `;

    if (!existingArea || existingArea.length === 0) {
      throw new AppError("Target area not found", 404);
    }

    if (existingArea[0].advertiser_id !== advertiser.advertiserId) {
      throw new AppError(
        "You can only delete target areas for your own campaigns",
        403
      );
    }

    // Delete target area
    await prisma.$executeRaw`
      DELETE FROM campaign_target_area
      WHERE target_area_id = ${areaId}::uuid
    `;

    res.status(200).json({
      status: "success",
      message: "Target area deleted successfully",
    });
  }
);

/**
 * Check if a point is within any target area of a campaign
 * POST /api/campaigns/:campaignId/target-areas/check-point
 */
export const checkPointInTargetArea = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      throw new AppError("Latitude and longitude are required", 400);
    }

    // Check which target areas contain this point
    const results = await prisma.$queryRaw<any[]>`
      SELECT 
        target_area_id as "targetAreaId",
        "areaName" as "areaName",
        priority_level as "priorityLevel",
        ST_Within(
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
          polygon
        ) as "isInside"
      FROM campaign_target_area
      WHERE campaign_id = ${campaignId}::uuid
        AND ST_Within(
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
          polygon
        ) = true
      ORDER BY priority_level DESC
    `;

    res.status(200).json({
      status: "success",
      data: {
        isInTargetArea: results.length > 0,
        matchedAreas: results,
        point: { latitude, longitude },
      },
    });
  }
);
