import { log } from "./vite";
import { spawn } from "child_process";

// Migration notice 
log("=== MIGRATION NOTICE ===");
log("The Express server has been deprecated in favor of the FastAPI server.");
log("Please run 'python run.py' to start the application.");
log("========================");

// Start the FastAPI server directly
log("Starting FastAPI server...");
const fastapi = spawn("python", ["run.py"], {
  stdio: "inherit",
});

fastapi.on("error", (err) => {
  console.error("Failed to start FastAPI server:", err);
  process.exit(1);
});

fastapi.on("exit", (code) => {
  log(`FastAPI server exited with code ${code}`);
  process.exit(code || 0);
});

log("FastAPI server started");
