import uvicorn

if __name__ == "__main__":
    # Run FastAPI server on port 3000 to avoid conflict with Express
    uvicorn.run(
        "api.main:app", 
        host="0.0.0.0", 
        port=3000,  # Using port 3000 for API only
        reload=True
    )