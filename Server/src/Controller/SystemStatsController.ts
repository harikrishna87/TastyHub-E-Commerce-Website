import { Request, Response } from 'express';
import mongoose from 'mongoose';
import os from 'os';
import { metricsTracker } from '../Utils/MetricsTracker';
import User from '../Models/Users';
import Product from '../Models/Products';
import Order from '../Models/Orders';
import Restaurant from '../Models/Restaurant';

export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Gather API stats
    const apiStats = metricsTracker.getStats();

    // 2. Measure Database latency (Ping)
    const dbStart = process.hrtime();
    let dbHealthy = false;
    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        dbHealthy = true;
      }
    } catch (dbErr) {
      console.error('Database health ping failed:', dbErr);
    }
    const dbDiff = process.hrtime(dbStart);
    const dbLatencyMs = dbDiff[0] * 1e3 + dbDiff[1] * 1e-6;

    // 3. Database Stats (size, collections count, indexes)
    let dbStats = null;
    if (mongoose.connection.db) {
      try {
        dbStats = await mongoose.connection.db.stats();
      } catch (statsErr) {
        console.error('Failed to retrieve db stats:', statsErr);
      }
    }

    // 4. Collection Document Counts
    let collectionsCount = {
      users: 0,
      products: 0,
      orders: 0,
      restaurants: 0,
    };
    try {
      const [users, products, orders, restaurants] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Restaurant.countDocuments(),
      ]);
      collectionsCount = { users, products, orders, restaurants };
    } catch (countErr) {
      console.error('Failed to count documents in collections:', countErr);
    }

    // 5. System Metrics (Memory, CPU, Uptime)
    const memoryUsage = process.memoryUsage();
    const serverUptime = process.uptime();
    const systemInfo = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpus: os.cpus().length,
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      nodeVersion: process.version,
    };

    res.status(200).json({
      success: true,
      data: {
        health: {
          api: 'healthy',
          database: dbHealthy ? 'healthy' : 'unhealthy',
          overall: dbHealthy ? 'healthy' : 'degraded',
        },
        apiStats,
        databaseStats: {
          connectionState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
          latencyMs: dbLatencyMs,
          dbName: mongoose.connection.name || 'Unknown',
          stats: dbStats ? {
            collections: dbStats.collections,
            objects: dbStats.objects,
            dataSize: dbStats.dataSize,
            storageSize: dbStats.storageSize,
            indexSize: dbStats.indexSize,
            avgObjSize: dbStats.avgObjSize,
          } : null,
          collectionsCount,
        },
        systemStats: {
          processMemory: {
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external,
          },
          uptimeSeconds: serverUptime,
          systemInfo,
        },
      },
    });
  } catch (err: any) {
    console.error('Error fetching system stats:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system statistics',
      error: err.message,
    });
  }
};
