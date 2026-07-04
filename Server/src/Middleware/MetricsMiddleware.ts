import { Request, Response, NextFunction } from 'express';
import { metricsTracker } from '../Utils/MetricsTracker';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime();
  metricsTracker.incrementActive();

  res.on('finish', () => {
    metricsTracker.decrementActive();

    // Skip tracking stats and notification polling requests to prevent stats pollute from auto-polling
    if (
      req.originalUrl &&
      (req.originalUrl.includes('/api/admin/system-stats') ||
       req.originalUrl.includes('/api/admin/notifications'))
    ) {
      return;
    }

    const diff = process.hrtime(start);
    const responseTimeMs = diff[0] * 1e3 + diff[1] * 1e-6;

    // Determine IP address safely
    const ip = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '';

    // Normalize path to prevent high cardinality
    let routePattern = req.path;
    
    // Safely check if a route matched
    const expressReq = req as any;
    if (expressReq.route && expressReq.route.path) {
      routePattern = (expressReq.baseUrl || '') + expressReq.route.path;
    }

    metricsTracker.recordRequest(
      req.method,
      req.path,
      routePattern,
      res.statusCode,
      responseTimeMs,
      ip
    );
  });

  next();
};
