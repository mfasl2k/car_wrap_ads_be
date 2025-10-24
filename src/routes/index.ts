import { Router } from 'express';
import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../utils/database';
import prisma from '../db';

const router = Router();

// Health check route
router.get('/health', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await checkDatabaseHealth();
    
    // Get database stats
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.driver.count(),
      prisma.advertiser.count(),
      prisma.campaign.count(),
    ]);

    res.json({
      status: 'success',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbHealthy,
        stats: {
          users: stats[0],
          drivers: stats[1],
          advertisers: stats[2],
          campaigns: stats[3],
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Database test endpoint
router.get('/db-test', async (req: Request, res: Response) => {
  try {
    // Test basic query
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    
    // Test PostGIS
    const postgisVersion = await prisma.$queryRaw`SELECT PostGIS_version()`;
    
    res.json({
      status: 'success',
      message: 'Database test successful',
      data: {
        database: result,
        postgis: postgisVersion,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
