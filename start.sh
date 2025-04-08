#!/bin/bash

# Kill any running node or Python processes
pkill -f "node" || true
pkill -f "uvicorn" || true
pkill -f "vite" || true
pkill -f "tsx" || true

echo "Starting the client and server..."

# Build the frontend assets
echo "Building frontend assets..."
cd client
npm run build
cd ..

# Start the FastAPI server
echo "Starting FastAPI server..."
python run.py