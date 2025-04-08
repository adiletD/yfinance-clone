import express from 'express';
import { log } from './vite';
import { setupAuth } from './auth';
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import { spawn } from 'child_process';
import { Server } from 'http';

async function startServer() {
  // Start the FastAPI server in the background for API endpoints
  log("Starting FastAPI server in the background...");
  const fastapi = spawn("python", ["run.py"], {
    stdio: "pipe", // Capture output but don't interfere with main process
    detached: true // Run in background
  });
  
  fastapi.stdout?.on('data', (data) => {
    log(`FastAPI: ${data.toString().trim()}`, "fastapi");
  });
  
  fastapi.stderr?.on('data', (data) => {
    console.error(`FastAPI error: ${data.toString().trim()}`);
  });

  // If FastAPI fails to start, continue anyway to avoid blocking UI
  fastapi.on("error", (err) => {
    console.error("Failed to start FastAPI server:", err);
    // We don't exit to allow Express to still function
  });
  
  // Create Express app for frontend
  const app = express();
  
  // Setup Express middleware
  app.use(express.json());
  
  // Setup auth
  setupAuth(app);
  
  // Register API routes
  const server = await registerRoutes(app);

  // Setup Vite middleware
  await setupVite(app, server);
  
  // Start Express server
  const port = process.env.PORT || 5000;
  
  // We don't need to call server.listen() if it was already started by registerRoutes
  if (!server.listening) {
    server.listen(port, () => {
      log(`Express server is running at http://localhost:${port}`);
    });
  }
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});
