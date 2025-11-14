import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Calculate matching score between driver and campaign
 * Score is based on: driver verification, vehicle verification, driver rating, active status
 * Maximum score: 100 points
 */
const calculateMatchingScore = async (
  driverId: string,
  campaignId: string
): Promise<number> => {
  let score = 0;

  // Get driver's vehicle and campaign details
  const driver = await prisma.driver.findUnique({
    where: { driverId: driverId },
    include: { vehicles: true },
  });

  const campaign = await prisma.campaign.findUnique({
    where: { campaignId: campaignId },
    select: {
      targetAreas: true,
    },
  });

  if (!driver || !campaign) {
    return 0;
  }

  // Score based on driver verification (0-25 points)
  if (driver.isVerified) {
    score += 25;
  }

  // Score based on vehicle verification (0-25 points)
  // Get first verified vehicle
  const vehicle = driver.vehicles.find((v) => v.isVerified);
  if (vehicle) {
    score += 25; // Vehicle exists and is verified
  }

  // Score based on driver rating (0-30 points)
  // Assuming rating is 0-5, normalize to 0-30
  const rating = Number(driver.averageRating);
  if (rating > 0) {
    score += (rating / 5) * 30;
  } else {
    score += 15; // Default score for new drivers (50% of max)
  }

  // Base score for active driver (20 points)
  // Check if driver has completed campaigns successfully
  if (driver.totalCampaignsCompleted > 0) {
    score += 20;
  } else {
    score += 10; // New drivers get half points
  }

  // TODO: Add location-based scoring when target areas are implemented
  // This would replace or augment totalCampaignsCompleted score

  return Math.round(score);
};

/**
 * Apply to a campaign
 * POST /api/campaigns/:campaignId/apply
 */
export const applyToCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Check if driver profile exists
    const driver = await prisma.driver.findUnique({
      where: { userId: userId },
      include: { vehicles: true },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message:
          "Driver profile not found. Please create your driver profile first.",
      });
    }

    // Check if driver has a vehicle
    if (!driver.vehicles || driver.vehicles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "You must have a registered vehicle to apply to campaigns.",
      });
    }

    // Check if driver is verified
    if (!driver.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Your driver profile must be verified before applying to campaigns. Please contact support.",
      });
    }

    // Check if at least one vehicle is verified
    const hasVerifiedVehicle = driver.vehicles.some((v) => v.isVerified);
    if (!hasVerifiedVehicle) {
      return res.status(400).json({
        success: false,
        message:
          "You must have at least one verified vehicle before applying to campaigns.",
      });
    }

    // Check if campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { campaignId: campaignId },
      include: { advertiser: true },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (campaign.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Cannot apply to ${campaign.status} campaign. Campaign must be active.`,
      });
    }

    // Check if campaign has ended (allow applications before start date)
    const now = new Date();
    if (campaign.endDate < now) {
      return res.status(400).json({
        success: false,
        message: "Campaign has already ended.",
      });
    }

    // Check if driver already applied
    const existingApplication = await prisma.driverCampaign.findUnique({
      where: {
        driverId_campaignId: {
          campaignId,
          driverId: driver.driverId,
        },
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: `You have already applied to this campaign. Current status: ${existingApplication.status}`,
      });
    }

    // Calculate matching score
    const matchingScore = await calculateMatchingScore(
      driver.driverId,
      campaignId
    );

    // Create application
    const application = await prisma.driverCampaign.create({
      data: {
        campaignId,
        driverId: driver.driverId,
        status: "pending",
        matchScore: matchingScore,
      },
      include: {
        campaign: {
          include: {
            advertiser: {
              select: {
                advertiserId: true,
                companyName: true,
              },
            },
          },
        },
        driver: {
          include: {
            vehicles: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error applying to campaign:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply to campaign",
    });
  }
};

/**
 * Get driver's applications
 * GET /api/campaigns/applications/my
 */
export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId: userId },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    // Get query parameters for filtering
    const { status } = req.query;

    // Build where clause
    const where: any = {
      driverId: driver.driverId,
    };

    if (status && typeof status === "string") {
      where.status = status;
    }

    // Get applications
    const applications = await prisma.driverCampaign.findMany({
      where,
      include: {
        campaign: {
          include: {
            advertiser: {
              select: {
                advertiserId: true,
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get statistics
    const stats = await prisma.driverCampaign.groupBy({
      by: ["status"],
      where: { driverId: driver.driverId },
      _count: true,
    });

    const statistics = {
      total: applications.length,
      pending: stats.find((s: any) => s.status === "pending")?._count || 0,
      approved: stats.find((s: any) => s.status === "approved")?._count || 0,
      rejected: stats.find((s: any) => s.status === "rejected")?._count || 0,
    };

    res.json({
      success: true,
      data: applications,
      statistics,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

/**
 * Get applications for a campaign (advertiser only)
 * GET /api/campaigns/:campaignId/applications
 */
export const getCampaignApplications = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get advertiser profile
    const advertiser = await prisma.advertiser.findUnique({
      where: { userId },
    });

    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: "Advertiser profile not found",
      });
    }

    // Check if campaign exists and belongs to advertiser
    const campaign = await prisma.campaign.findUnique({
      where: { campaignId: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (campaign.advertiserId !== advertiser.advertiserId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view applications for this campaign",
      });
    }

    // Get query parameters for filtering
    const { status } = req.query;

    // Build where clause
    const where: any = {
      campaignId,
    };

    if (status && typeof status === "string") {
      where.status = status;
    }

    // Get applications
    const applications = await prisma.driverCampaign.findMany({
      where,
      include: {
        driver: {
          include: {
            vehicles: true,
            user: {
              select: {
                userId: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: "asc" }, // pending first
        { matchScore: "desc" }, // then by matching score
        { createdAt: "desc" },
      ],
    });

    // Get statistics
    const stats = await prisma.driverCampaign.groupBy({
      by: ["status"],
      where: { campaignId },
      _count: true,
    });

    const statistics = {
      total: applications.length,
      pending: stats.find((s: any) => s.status === "pending")?._count || 0,
      approved: stats.find((s: any) => s.status === "approved")?._count || 0,
      rejected: stats.find((s: any) => s.status === "rejected")?._count || 0,
    };

    res.json({
      success: true,
      data: applications,
      statistics,
    });
  } catch (error) {
    console.error("Error fetching campaign applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaign applications",
    });
  }
};

/**
 * Approve application
 * PATCH /api/campaigns/:campaignId/applications/:driverId/approve
 */
export const approveApplication = async (req: Request, res: Response) => {
  try {
    const { campaignId, driverId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get advertiser profile
    const advertiser = await prisma.advertiser.findUnique({
      where: { userId },
    });

    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: "Advertiser profile not found",
      });
    }

    // Check if campaign exists and belongs to advertiser
    const campaign = await prisma.campaign.findUnique({
      where: { campaignId: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (campaign.advertiserId !== advertiser.advertiserId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to manage applications for this campaign",
      });
    }

    // Check if application exists
    const application = await prisma.driverCampaign.findUnique({
      where: {
        driverId_campaignId: {
          campaignId,
          driverId,
        },
      },
      include: {
        driver: {
          include: {
            vehicles: true,
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

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve application with status: ${application.status}`,
      });
    }

    // Update application status
    const updatedApplication = await prisma.driverCampaign.update({
      where: {
        driverId_campaignId: {
          campaignId,
          driverId,
        },
      },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
      include: {
        campaign: true,
        driver: {
          include: {
            vehicles: true,
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

    res.json({
      success: true,
      message: "Application approved successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve application",
    });
  }
};

/**
 * Reject application
 * PATCH /api/campaigns/:campaignId/applications/:driverId/reject
 */
export const rejectApplication = async (req: Request, res: Response) => {
  try {
    const { campaignId, driverId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get advertiser profile
    const advertiser = await prisma.advertiser.findUnique({
      where: { userId },
    });

    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: "Advertiser profile not found",
      });
    }

    // Check if campaign exists and belongs to advertiser
    const campaign = await prisma.campaign.findUnique({
      where: { campaignId: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (campaign.advertiserId !== advertiser.advertiserId) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to manage applications for this campaign",
      });
    }

    // Check if application exists
    const application = await prisma.driverCampaign.findUnique({
      where: {
        driverId_campaignId: {
          campaignId,
          driverId,
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject application with status: ${application.status}`,
      });
    }

    // Update application status
    const updatedApplication = await prisma.driverCampaign.update({
      where: {
        driverId_campaignId: {
          campaignId,
          driverId,
        },
      },
      data: {
        status: "rejected",
        rejectionReason: reason,
      },
      include: {
        campaign: true,
        driver: {
          include: {
            vehicles: true,
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

    res.json({
      success: true,
      message: "Application rejected",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject application",
    });
  }
};

/**
 * Cancel application (driver only)
 * DELETE /api/campaigns/:campaignId/apply
 */
export const cancelApplication = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId: userId },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    // Check if application exists
    const application = await prisma.driverCampaign.findUnique({
      where: {
        driverId_campaignId: {
          campaignId,
          driverId: driver.driverId,
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Only allow cancellation if application is pending
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel application with status: ${application.status}`,
      });
    }

    // Delete application
    await prisma.driverCampaign.delete({
      where: {
        driverId_campaignId: {
          campaignId,
          driverId: driver.driverId,
        },
      },
    });

    res.json({
      success: true,
      message: "Application cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel application",
    });
  }
};
