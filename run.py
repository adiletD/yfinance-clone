import uvicorn

if __name__ == "__main__":
    # Run uvicorn server directly
    uvicorn.run(
        "api.main:app", 
        host="0.0.0.0", 
        port=5000,  # Changed from 3000 to 5000
        reload=True
    )