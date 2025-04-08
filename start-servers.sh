#!/bin/bash

# Start the FastAPI server in the background
python run.py &
FASTAPI_PID=$!

# Start the Express server
npm run dev

# Kill the FastAPI server when the Express server is stopped
kill $FASTAPI_PID