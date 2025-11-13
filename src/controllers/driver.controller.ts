import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const prisma = new PrismaClient();

/**
 * Create driver profile
 * POST /api/drivers
 */
export const createDriver = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      driversLicenseNumber,
      city,
      region,
    } = req.body;

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Check if user is a driver
    if (req.user.userType !== "driver") {
      throw new AppError("Only drivers can create driver profiles", 403);
    }

    // Check if driver profile already exists
    const existingDriver = await prisma.driver.findUnique({
      where: { userId: req.user.userId },
    });

    if (existingDriver) {
      throw new AppError("Driver profile already exists", 400);
    }

    // Create driver profile
    const driver = await prisma.driver.create({
      data: {
        userId: req.user.userId,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        driversLicenseNumber,
        city,
        region,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Driver profile created successfully",
      data: { driver },
    });
  }
);

/**
 * Get driver profile
 * GET /api/drivers/me
 */
export const getMyDriverProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            userType: true,
            isActive: true,
            isVerified: true,
          },
        },
        vehicles: true,
        driverCampaigns: {
          include: {
            campaign: true,
          },
        },
      },
    });

    if (!driver) {
      throw new AppError("Driver profile not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: { driver },
    });
  }
);

/**
 * Get driver by ID
 * GET /api/drivers/:driverId
 */
export const getDriverById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { driverId } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { driverId },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            userType: true,
            isActive: true,
          },
        },
        vehicles: true,
      },
    });

    if (!driver) {
      throw new AppError("Driver not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: { driver },
    });
  }
);

/**
 * Update driver profile
 * PUT /api/drivers/me
 */
export const updateDriverProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      driversLicenseNumber,
      city,
      region,
    } = req.body;

    // Find driver by userId
    const existingDriver = await prisma.driver.findUnique({
      where: { userId: req.user.userId },
    });

    if (!existingDriver) {
      throw new AppError("Driver profile not found", 404);
    }

    // Update driver profile
    const driver = await prisma.driver.update({
      where: { driverId: existingDriver.driverId },
      data: {
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        driversLicenseNumber,
        city,
        region,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Driver profile updated successfully",
      data: { driver },
    });
  }
);

/**
 * Delete driver profile
 * DELETE /api/drivers/me
 */
export const deleteDriverProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Find driver by userId
    const existingDriver = await prisma.driver.findUnique({
      where: { userId: req.user.userId },
    });

    if (!existingDriver) {
      throw new AppError("Driver profile not found", 404);
    }

    // Delete driver profile
    await prisma.driver.delete({
      where: { driverId: existingDriver.driverId },
    });

    res.status(200).json({
      status: "success",
      message: "Driver profile deleted successfully",
    });
  }
);

/**
 * Get all drivers (Admin/Advertiser)
 * GET /api/drivers
 */
export const getAllDrivers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, city, region, isVerified } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build filter
    const where: any = {};
    if (city) where.city = city;
    if (region) where.region = region;
    if (isVerified !== undefined) where.isVerified = isVerified === "true";

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              userId: true,
              email: true,
              isActive: true,
            },
          },
          vehicles: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.driver.count({ where }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        drivers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);

/**
 * Verify driver (Admin only)
 * PATCH /api/drivers/:driverId/verify
 */
export const verifyDriver = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { driverId } = req.params;

    // Check if driver exists
    const driver = await prisma.driver.findUnique({
      where: { driverId },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            userType: true,
          },
        },
      },
    });

    if (!driver) {
      throw new AppError("Driver not found", 404);
    }

    // Update driver verification status
    const updatedDriver = await prisma.driver.update({
      where: { driverId },
      data: { isVerified: true },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            userType: true,
            isActive: true,
          },
        },
        vehicles: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Driver verified successfully",
      data: { driver: updatedDriver },
    });
  }
);

/**
 * Unverify driver (Admin only)
 * PATCH /api/drivers/:driverId/unverify
 */
export const unverifyDriver = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { driverId } = req.params;

    // Check if driver exists
    const driver = await prisma.driver.findUnique({
      where: { driverId },
    });

    if (!driver) {
      throw new AppError("Driver not found", 404);
    }

    // Update driver verification status
    const updatedDriver = await prisma.driver.update({
      where: { driverId },
      data: { isVerified: false },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            userType: true,
            isActive: true,
          },
        },
        vehicles: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Driver verification revoked successfully",
      data: { driver: updatedDriver },
    });
  }
);
