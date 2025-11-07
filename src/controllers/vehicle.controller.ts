import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { deleteImageFromCloudinary } from "../middleware/upload";

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

/**
 * Upload vehicle photo
 * POST /api/vehicles/:vehicleId/upload-photo
 */
export const uploadVehiclePhoto = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleId } = req.params;

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Check if file was uploaded
    if (!req.file) {
      throw new AppError("Please upload an image", 400);
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

    // Delete old image if exists
    if (existingVehicle.photoUrl) {
      try {
        await deleteImageFromCloudinary(existingVehicle.photoUrl);
      } catch (error) {
        console.error("Error deleting old image:", error);
        // Continue even if deletion fails
      }
    }

    // Update vehicle with new photo URL
    const vehicle = await prisma.vehicle.update({
      where: { vehicleId },
      data: {
        photoUrl: req.file.path, // Cloudinary URL
      },
    });

    res.status(200).json({
      status: "success",
      message: "Vehicle photo uploaded successfully",
      data: { 
        vehicle,
        imageUrl: req.file.path,
      },
    });
  }
);

/**
 * Delete vehicle photo
 * DELETE /api/vehicles/:vehicleId/photo
 */
export const deleteVehiclePhoto = asyncHandler(
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
        "You do not have permission to update this vehicle",
        403
      );
    }

    if (!existingVehicle.photoUrl) {
      throw new AppError("Vehicle has no photo to delete", 400);
    }

    // Delete image from Cloudinary
    await deleteImageFromCloudinary(existingVehicle.photoUrl);

    // Update vehicle to remove photo URL
    const vehicle = await prisma.vehicle.update({
      where: { vehicleId },
      data: {
        photoUrl: null,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Vehicle photo deleted successfully",
      data: { vehicle },
    });
  }
);

/**
 * Verify vehicle (Admin only)
 * PATCH /api/vehicles/:vehicleId/verify
 */
export const verifyVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleId } = req.params;

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
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

    if (!existingVehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    if (existingVehicle.isVerified) {
      throw new AppError("Vehicle is already verified", 400);
    }

    // Update vehicle verification status
    const vehicle = await prisma.vehicle.update({
      where: { vehicleId },
      data: {
        isVerified: true,
      },
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

    res.status(200).json({
      status: "success",
      message: "Vehicle verified successfully",
      data: { vehicle },
    });
  }
);

/**
 * Unverify vehicle (Admin only)
 * PATCH /api/vehicles/:vehicleId/unverify
 */
export const unverifyVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { vehicleId } = req.params;

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
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

    if (!existingVehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    if (!existingVehicle.isVerified) {
      throw new AppError("Vehicle is already unverified", 400);
    }

    // Update vehicle verification status
    const vehicle = await prisma.vehicle.update({
      where: { vehicleId },
      data: {
        isVerified: false,
      },
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

    res.status(200).json({
      status: "success",
      message: "Vehicle unverified successfully",
      data: { vehicle },
    });
  }
);
