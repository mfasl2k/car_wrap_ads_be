import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError, asyncHandler } from "../middleware/errorHandler";

const prisma = new PrismaClient();

/**
 * Create advertiser profile
 * POST /api/advertisers
 */
export const createAdvertiser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      companyName,
      contactPerson,
      phoneNumber,
      businessAddress,
      city,
      industry,
    } = req.body;

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Check if user is an advertiser
    if (req.user.userType !== "advertiser") {
      throw new AppError(
        "Only advertisers can create advertiser profiles",
        403
      );
    }

    // Check if advertiser profile already exists
    const existingAdvertiser = await prisma.advertiser.findUnique({
      where: { userId: req.user.userId },
    });

    if (existingAdvertiser) {
      throw new AppError("Advertiser profile already exists", 400);
    }

    // Create advertiser profile
    const advertiser = await prisma.advertiser.create({
      data: {
        userId: req.user.userId,
        companyName,
        contactPerson,
        phoneNumber,
        businessAddress,
        city,
        industry,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Advertiser profile created successfully",
      data: { advertiser },
    });
  }
);

/**
 * Get advertiser profile
 * GET /api/advertisers/me
 */
export const getMyAdvertiserProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const advertiser = await prisma.advertiser.findUnique({
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
        campaigns: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!advertiser) {
      throw new AppError("Advertiser profile not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: { advertiser },
    });
  }
);

/**
 * Get advertiser by ID
 * GET /api/advertisers/:advertiserId
 */
export const getAdvertiserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { advertiserId } = req.params;

    const advertiser = await prisma.advertiser.findUnique({
      where: { advertiserId },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            userType: true,
            isActive: true,
          },
        },
        campaigns: {
          select: {
            campaignId: true,
            campaignName: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!advertiser) {
      throw new AppError("Advertiser not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: { advertiser },
    });
  }
);

/**
 * Update advertiser profile
 * PUT /api/advertisers/me
 */
export const updateAdvertiserProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const {
      companyName,
      contactPerson,
      phoneNumber,
      businessAddress,
      city,
      industry,
    } = req.body;

    // Find advertiser by userId
    const existingAdvertiser = await prisma.advertiser.findUnique({
      where: { userId: req.user.userId },
    });

    if (!existingAdvertiser) {
      throw new AppError("Advertiser profile not found", 404);
    }

    // Update advertiser profile
    const advertiser = await prisma.advertiser.update({
      where: { advertiserId: existingAdvertiser.advertiserId },
      data: {
        companyName,
        contactPerson,
        phoneNumber,
        businessAddress,
        city,
        industry,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Advertiser profile updated successfully",
      data: { advertiser },
    });
  }
);

/**
 * Delete advertiser profile
 * DELETE /api/advertisers/me
 */
export const deleteAdvertiserProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Find advertiser by userId
    const existingAdvertiser = await prisma.advertiser.findUnique({
      where: { userId: req.user.userId },
    });

    if (!existingAdvertiser) {
      throw new AppError("Advertiser profile not found", 404);
    }

    // Delete advertiser profile
    await prisma.advertiser.delete({
      where: { advertiserId: existingAdvertiser.advertiserId },
    });

    res.status(200).json({
      status: "success",
      message: "Advertiser profile deleted successfully",
    });
  }
);

/**
 * Get all advertisers (Admin)
 * GET /api/advertisers
 */
export const getAllAdvertisers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, city, industry, isVerified } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build filter
    const where: any = {};
    if (city) where.city = city;
    if (industry) where.industry = industry;
    if (isVerified !== undefined) where.isVerified = isVerified === "true";

    const [advertisers, total] = await Promise.all([
      prisma.advertiser.findMany({
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
          campaigns: {
            select: {
              campaignId: true,
              campaignName: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.advertiser.count({ where }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        advertisers,
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
 * Verify advertiser (Admin only)
 * PATCH /api/advertisers/:advertiserId/verify
 */
export const verifyAdvertiser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { advertiserId } = req.params;

    // Check if advertiser exists
    const advertiser = await prisma.advertiser.findUnique({
      where: { advertiserId },
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

    if (!advertiser) {
      throw new AppError("Advertiser not found", 404);
    }

    // Update advertiser verification status
    const updatedAdvertiser = await prisma.advertiser.update({
      where: { advertiserId },
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
        campaigns: {
          select: {
            campaignId: true,
            campaignName: true,
            status: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Advertiser verified successfully",
      data: { advertiser: updatedAdvertiser },
    });
  }
);

/**
 * Unverify advertiser (Admin only)
 * PATCH /api/advertisers/:advertiserId/unverify
 */
export const unverifyAdvertiser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { advertiserId } = req.params;

    // Check if advertiser exists
    const advertiser = await prisma.advertiser.findUnique({
      where: { advertiserId },
    });

    if (!advertiser) {
      throw new AppError("Advertiser not found", 404);
    }

    // Update advertiser verification status
    const updatedAdvertiser = await prisma.advertiser.update({
      where: { advertiserId },
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
        campaigns: {
          select: {
            campaignId: true,
            campaignName: true,
            status: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Advertiser verification revoked successfully",
      data: { advertiser: updatedAdvertiser },
    });
  }
);
