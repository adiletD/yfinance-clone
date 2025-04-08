import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { EarningsEstimate, RevenueEstimate, GrowthEstimate } from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes - temporary until FastAPI auth is working
  setupAuth(app);

  // Set up proxy to FastAPI server
  const apiProxy = createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    // Removed logLevel as it's not in the type definition
    pathRewrite: {
      '^/api': '/api' // no rewrite needed, but required for configuration
    },
    onProxyReq: (proxyReq: any, req: Request, res: Response) => {
      // you can modify headers here
      if (req.user) {
        // Pass user information from Express session to FastAPI
        const userId = (req.user as Express.User).id;
        proxyReq.setHeader('X-User-ID', userId.toString());
      }
      console.log(`Proxying request to: ${req.url}`);
    },
    onError: (err: Error, req: Request, res: Response) => {
      console.error('Proxy error:', err);
      res.status(500).json({ message: 'FastAPI server error or not running' });
    }
  });

  // Use the proxy for all API requests
  app.use('/api', apiProxy);
  
  // For now, we'll keep the original routes as fallbacks
  // These will be removed once the FastAPI server is fully implemented
  app.get('/_internal/api/estimates/:ticker/earnings', isAuthenticated, async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      const userId = (req.user as Express.User).id;
      
      const estimates = await storage.getEarningsEstimates(ticker, userId);
      if (!estimates) {
        return res.status(404).json({ message: "No custom earnings estimates found" });
      }
      
      res.json(estimates);
    } catch (error) {
      console.error(`Error fetching custom earnings estimates for ${req.params.ticker}:`, error);
      res.status(500).json({ message: "Failed to fetch custom earnings estimates" });
    }
  });

  // Similar internal fallback endpoints for other routes...
  // We'll gradually remove these as we implement and test the FastAPI equivalents

  const httpServer = createServer(app);
  return httpServer;
}
