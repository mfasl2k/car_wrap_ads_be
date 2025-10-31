import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const prisma = new PrismaClient();

/**
 * Create vehicle
 * POST /api/vehicles
 */
export const createVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      make,
      model,
      year,
      color,
      registrationNumber,
      vehicleType,
      sizeCategory,
      photoUrl,
    } = req.body;

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Get driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.userId },
    });

    if (!driver) {
      throw new AppError(
        "Driver profile not found. Please create a driver profile first.",
        404
      );
    }

    // Check if registration number already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registrationNumber },
    });

    if (existingVehicle) {
      throw new AppError(
        "Vehicle with this registration number already exists",
        400
      );
    }

    // Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        driverId: driver.driverId,
        make,
        model,
        year,
        color,
        registrationNumber,
        vehicleType,
        sizeCategory,
        photoUrl,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Vehicle created successfully",
      data: { vehicle },
    });
  }
);

/**
 * Get all vehicles for current driver
 * GET /api/vehicles/my
 */
export const getMyVehicles = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Get driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.userId },
    });

    if (!driver) {
      throw new AppError("Driver profile not found", 404);
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { driverId: driver.driverId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: { vehicles },
    });
  }
);

/**
 * Get vehicle by ID
 * GET /api/vehicles/:vehicleId
 */
export const getVehicleById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleId } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { vehicleId },
      include: {
        driver: {
          include: {
            user: {
              select: {
                userId: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: { vehicle },
    });
  }
);

/**
 * Update vehicle
 * PUT /api/vehicles/:vehicleId
 */
export const updateVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleId } = req.params;
    const {
      make,
      model,
      year,
      color,
      registrationNumber,
      vehicleType,
      sizeCategory,
      photoUrl,
    } = req.body;

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Get driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.userId },
    });

    if (!driver) {
      throw new AppError("Driver profile not found", 404);
    }

    // Check if vehicle exists and belongs to driver
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vehicleId },
    });

    if (!existingVehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    if (existingVehicle.driverId !== driver.driverId) {
      throw new AppError(
        "You do not have permission to update this vehicle",
        403
      );
    }

    // If registration number is being updated, check if it's unique
    if (
      registrationNumber &&
      registrationNumber !== existingVehicle.registrationNumber
    ) {
      const duplicateVehicle = await prisma.vehicle.findUnique({
        where: { registrationNumber },
      });

      if (duplicateVehicle) {
        throw new AppError(
          "Vehicle with this registration number already exists",
          400
        );
      }
    }

    // Update vehicle
    const vehicle = await prisma.vehicle.update({
      where: { vehicleId },
      data: {
        make,
        model,
        year,
        color,
        registrationNumber,
        vehicleType,
        sizeCategory,
        photoUrl,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Vehicle updated successfully",
      data: { vehicle },
    });
  }
);

/**
 * Delete vehicle
 * DELETE /api/vehicles/:vehicleId
 */
export const deleteVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleId } = req.params;

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Get driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.userId },
    });

    if (!driver) {
      throw new AppError("Driver profile not found", 404);
    }

    // Check if vehicle exists and belongs to driver
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vehicleId },
    });

    if (!existingVehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    if (existingVehicle.driverId !== driver.driverId) {
      throw new AppError(
        "You do not have permission to delete this vehicle",
        403
      );
    }

    // Delete vehicle
    await prisma.vehicle.delete({
      where: { vehicleId },
    });

    res.status(200).json({
      status: "success",
      message: "Vehicle deleted successfully",
    });
  }
);

/**
 * Get all vehicles (Admin/Advertiser)
 * GET /api/vehicles
 */
export const getAllVehicles = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      vehicleType,
      sizeCategory,
      isVerified,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build filter
    const where: any = {};
    if (vehicleType) where.vehicleType = vehicleType;
    if (sizeCategory) where.sizeCategory = sizeCategory;
    if (isVerified !== undefined) where.isVerified = isVerified === "true";

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        include: {
          driver: {
            include: {
              user: {
                select: {
                  userId: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        vehicles,
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
