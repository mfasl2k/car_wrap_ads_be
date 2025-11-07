import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Create campaign
 * POST /api/campaigns
 */
export const createCampaign = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    campaignName,
    description,
    startDate,
    endDate,
    paymentPerDay,
    requiredDrivers,
    wrapDesignUrl,
  } = req.body;

  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  // Check if user is an advertiser
  if (req.user.userType !== 'advertiser') {
    throw new AppError('Only advertisers can create campaigns', 403);
  }

  // Get advertiser profile
  const advertiser = await prisma.advertiser.findUnique({
    where: { userId: req.user.userId },
  });

  if (!advertiser) {
    throw new AppError('Advertiser profile not found. Please create an advertiser profile first.', 404);
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    throw new AppError('End date must be after start date', 400);
  }

  if (start < new Date()) {
    throw new AppError('Start date cannot be in the past', 400);
  }

  // Create campaign
  const campaign = await prisma.campaign.create({
    data: {
      advertiserId: advertiser.advertiserId,
      campaignName,
      description,
      startDate: start,
      endDate: end,
      paymentPerDay: paymentPerDay ? parseFloat(paymentPerDay) : undefined,
      requiredDrivers: requiredDrivers ? parseInt(requiredDrivers) : 1,
      wrapDesignUrl,
      status: 'draft',
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Campaign created successfully',
    data: { campaign },
  });
});

/**
 * Get all campaigns for advertiser
 * GET /api/campaigns/my
 */
export const getMyCampaigns = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  // Get advertiser profile
  const advertiser = await prisma.advertiser.findUnique({
    where: { userId: req.user.userId },
  });

  if (!advertiser) {
    throw new AppError('Advertiser profile not found', 404);
  }

  const campaigns = await prisma.campaign.findMany({
    where: { advertiserId: advertiser.advertiserId },
    include: {
      driverCampaigns: {
        include: {
          driver: {
            select: {
              driverId: true,
              firstName: true,
              lastName: true,
              averageRating: true,
            },
          },
        },
      },
      _count: {
        select: {
          driverCampaigns: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    data: { campaigns },
  });
});

/**
 * Get campaign by ID
 * GET /api/campaigns/:campaignId
 */
export const getCampaignById = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { campaignId } = req.params;

  const campaign = await prisma.campaign.findUnique({
    where: { campaignId },
    include: {
      advertiser: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      driverCampaigns: {
        include: {
          driver: {
            select: {
              driverId: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
              averageRating: true,
              totalCampaignsCompleted: true,
            },
          },
        },
      },
      targetAreas: true,
    },
  });

  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { campaign },
  });
});

/**
 * Update campaign
 * PUT /api/campaigns/:campaignId
 */
export const updateCampaign = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { campaignId } = req.params;
  const {
    campaignName,
    description,
    startDate,
    endDate,
    paymentPerDay,
    requiredDrivers,
    wrapDesignUrl,
  } = req.body;

  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  // Get advertiser profile
  const advertiser = await prisma.advertiser.findUnique({
    where: { userId: req.user.userId },
  });

  if (!advertiser) {
    throw new AppError('Advertiser profile not found', 404);
  }

  // Check if campaign exists and belongs to advertiser
  const existingCampaign = await prisma.campaign.findUnique({
    where: { campaignId },
  });

  if (!existingCampaign) {
    throw new AppError('Campaign not found', 404);
  }

  if (existingCampaign.advertiserId !== advertiser.advertiserId) {
    throw new AppError('You do not have permission to update this campaign', 403);
  }

  // Validate dates if provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      throw new AppError('End date must be after start date', 400);
    }
  }

  // Update campaign
  const campaign = await prisma.campaign.update({
    where: { campaignId },
    data: {
      campaignName,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      paymentPerDay: paymentPerDay ? parseFloat(paymentPerDay) : undefined,
      requiredDrivers: requiredDrivers ? parseInt(requiredDrivers) : undefined,
      wrapDesignUrl,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Campaign updated successfully',
    data: { campaign },
  });
});

/**
 * Delete campaign
 * DELETE /api/campaigns/:campaignId
 */
export const deleteCampaign = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { campaignId } = req.params;

  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  // Get advertiser profile
  const advertiser = await prisma.advertiser.findUnique({
    where: { userId: req.user.userId },
  });

  if (!advertiser) {
    throw new AppError('Advertiser profile not found', 404);
  }

  // Check if campaign exists and belongs to advertiser
  const existingCampaign = await prisma.campaign.findUnique({
    where: { campaignId },
  });

  if (!existingCampaign) {
    throw new AppError('Campaign not found', 404);
  }

  if (existingCampaign.advertiserId !== advertiser.advertiserId) {
    throw new AppError('You do not have permission to delete this campaign', 403);
  }

  // Delete campaign
  await prisma.campaign.delete({
    where: { campaignId },
  });

  res.status(200).json({
    status: 'success',
    message: 'Campaign deleted successfully',
  });
});

/**
 * Update campaign status
 * PATCH /api/campaigns/:campaignId/status
 */
export const updateCampaignStatus = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { campaignId } = req.params;
  const { status } = req.body;

  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  // Validate status
  const validStatuses = ['draft', 'active', 'paused', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  // Get advertiser profile
  const advertiser = await prisma.advertiser.findUnique({
    where: { userId: req.user.userId },
  });

  if (!advertiser) {
    throw new AppError('Advertiser profile not found', 404);
  }

  // Check if campaign exists and belongs to advertiser
  const existingCampaign = await prisma.campaign.findUnique({
    where: { campaignId },
  });

  if (!existingCampaign) {
    throw new AppError('Campaign not found', 404);
  }

  if (existingCampaign.advertiserId !== advertiser.advertiserId) {
    throw new AppError('You do not have permission to update this campaign', 403);
  }

  // Update campaign status
  const campaign = await prisma.campaign.update({
    where: { campaignId },
    data: { status },
  });

  res.status(200).json({
    status: 'success',
    message: 'Campaign status updated successfully',
    data: { campaign },
  });
});

/**
 * Get all active campaigns (for drivers)
 * GET /api/campaigns
 */
export const getAllCampaigns = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page = 1, limit = 10, status, minPayment } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build filter
  const where: any = {};
  if (status) where.status = status;
  if (minPayment) where.paymentPerDay = { gte: parseFloat(minPayment as string) };

  // For drivers, show only active campaigns
  if (!status) {
    where.status = 'active';
  }

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      skip,
      take,
      include: {
        advertiser: {
          select: {
            advertiserId: true,
            companyName: true,
            city: true,
          },
        },
        _count: {
          select: {
            driverCampaigns: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.campaign.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      campaigns,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});
