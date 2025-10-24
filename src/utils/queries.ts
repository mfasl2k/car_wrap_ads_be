import prisma from '../db';

/**
 * Query Builder Utilities
 * Common database queries for the Car Wrap Ads application
 */

// User Queries
export const userQueries = {
  // Find user by email
  findByEmail: async (email: string) => {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        driver: true,
        advertiser: true,
      },
    });
  },

  // Find user with profile
  findWithProfile: async (userId: string, userType: 'driver' | 'advertiser') => {
    return await prisma.user.findUnique({
      where: { userId },
      include: {
        driver: userType === 'driver',
        advertiser: userType === 'advertiser',
      },
    });
  },

  // Get active users
  getActiveUsers: async (userType?: 'driver' | 'advertiser') => {
    return await prisma.user.findMany({
      where: {
        isActive: true,
        ...(userType && { userType }),
      },
    });
  },
};

// Driver Queries
export const driverQueries = {
  // Find driver with vehicles
  findWithVehicles: async (driverId: string) => {
    return await prisma.driver.findUnique({
      where: { driverId },
      include: {
        user: true,
        vehicles: true,
      },
    });
  },

  // Get verified drivers
  getVerifiedDrivers: async (city?: string) => {
    return await prisma.driver.findMany({
      where: {
        isVerified: true,
        ...(city && { city }),
      },
      include: {
        vehicles: true,
      },
    });
  },

  // Get drivers by rating
  getDriversByRating: async (minRating: number) => {
    return await prisma.driver.findMany({
      where: {
        averageRating: {
          gte: minRating,
        },
      },
      orderBy: {
        averageRating: 'desc',
      },
    });
  },

  // Get drivers near location (PostGIS query)
  getDriversNearLocation: async (
    latitude: number,
    longitude: number,
    radiusMeters: number
  ) => {
    return await prisma.$queryRaw`
      SELECT d.*, 
             ST_Distance(
               d.current_location,
               ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
             ) as distance_meters
      FROM driver d
      WHERE ST_DWithin(
        d.current_location,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusMeters}
      )
      AND d.is_verified = true
      ORDER BY distance_meters ASC
    `;
  },
};

// Campaign Queries
export const campaignQueries = {
  // Get active campaigns
  getActiveCampaigns: async () => {
    return await prisma.campaign.findMany({
      where: {
        status: 'active',
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        advertiser: {
          include: {
            user: true,
          },
        },
        targetAreas: true,
      },
    });
  },

  // Get campaigns by advertiser
  getCampaignsByAdvertiser: async (advertiserId: string) => {
    return await prisma.campaign.findMany({
      where: { advertiserId },
      include: {
        targetAreas: true,
        driverCampaigns: {
          include: {
            driver: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Get campaign with full details
  getCampaignDetails: async (campaignId: string) => {
    return await prisma.campaign.findUnique({
      where: { campaignId },
      include: {
        advertiser: {
          include: {
            user: true,
          },
        },
        targetAreas: true,
        driverCampaigns: {
          include: {
            driver: {
              include: {
                user: true,
                vehicles: true,
              },
            },
          },
        },
        campaignAnalytics: {
          orderBy: {
            analyticsDate: 'desc',
          },
          take: 30, // Last 30 days
        },
      },
    });
  },
};

// Driver Campaign Queries
export const driverCampaignQueries = {
  // Get driver's active campaigns
  getDriverActiveCampaigns: async (driverId: string) => {
    return await prisma.driverCampaign.findMany({
      where: {
        driverId,
        status: {
          in: ['approved', 'active'],
        },
      },
      include: {
        campaign: {
          include: {
            advertiser: true,
            targetAreas: true,
          },
        },
      },
    });
  },

  // Get pending applications
  getPendingApplications: async (campaignId: string) => {
    return await prisma.driverCampaign.findMany({
      where: {
        campaignId,
        status: 'pending',
      },
      include: {
        driver: {
          include: {
            user: true,
            vehicles: true,
          },
        },
      },
      orderBy: {
        matchScore: 'desc',
      },
    });
  },
};

// Location Tracking Queries
export const locationQueries = {
  // Get driver's tracks for date range
  getDriverTracks: async (
    driverId: string,
    startDate: Date,
    endDate: Date
  ) => {
    return await prisma.locationTrack.findMany({
      where: {
        driverId,
        trackDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        driverCampaign: {
          include: {
            campaign: true,
          },
        },
      },
      orderBy: {
        trackDate: 'desc',
      },
    });
  },

  // Get unsynced tracks
  getUnsyncedTracks: async (driverId: string) => {
    return await prisma.locationTrack.findMany({
      where: {
        driverId,
        isSynced: false,
      },
      include: {
        locationPoints: {
          where: {
            isSynced: false,
          },
        },
      },
    });
  },

  // Get route points
  getRoutePoints: async (trackId: string) => {
    return await prisma.locationPoint.findMany({
      where: { trackId },
      orderBy: {
        recordedAt: 'asc',
      },
    });
  },

  // Check if route intersects with campaign area (PostGIS)
  checkRouteIntersection: async (trackId: string, campaignId: string) => {
    return await prisma.$queryRaw`
      SELECT 
        lt.track_id,
        ca.target_area_id,
        ca.area_name,
        ST_Intersects(lt.route_line, ca.polygon) as intersects,
        ST_Length(ST_Intersection(lt.route_line, ca.polygon)::geography) as intersection_length_meters
      FROM location_track lt
      CROSS JOIN campaign_target_area ca
      WHERE lt.track_id = ${trackId}
        AND ca.campaign_id = ${campaignId}
        AND ST_Intersects(lt.route_line, ca.polygon)
    `;
  },
};

// Analytics Queries
export const analyticsQueries = {
  // Get campaign analytics summary
  getCampaignAnalyticsSummary: async (
    campaignId: string,
    startDate: Date,
    endDate: Date
  ) => {
    return await prisma.campaignAnalytics.findMany({
      where: {
        campaignId,
        analyticsDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        analyticsDate: 'asc',
      },
    });
  },

  // Get driver performance stats
  getDriverStats: async (driverId: string) => {
    const stats = await prisma.locationTrack.aggregate({
      where: {
        driverId,
      },
      _sum: {
        distanceKm: true,
        durationHours: true,
        estimatedImpressions: true,
      },
      _count: {
        trackId: true,
      },
    });

    return {
      totalDistance: stats._sum.distanceKm || 0,
      totalHours: stats._sum.durationHours || 0,
      totalImpressions: stats._sum.estimatedImpressions || 0,
      totalTracks: stats._count.trackId || 0,
    };
  },
};

// Vehicle Queries
export const vehicleQueries = {
  // Get driver's vehicles
  getDriverVehicles: async (driverId: string) => {
    return await prisma.vehicle.findMany({
      where: { driverId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Get verified vehicles
  getVerifiedVehicles: async (driverId: string) => {
    return await prisma.vehicle.findMany({
      where: {
        driverId,
        isVerified: true,
      },
    });
  },
};

export default {
  userQueries,
  driverQueries,
  campaignQueries,
  driverCampaignQueries,
  locationQueries,
  analyticsQueries,
  vehicleQueries,
};
