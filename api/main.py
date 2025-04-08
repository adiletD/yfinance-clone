from fastapi import FastAPI, Depends, HTTPException, status, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from typing import List, Dict, Optional
import uvicorn
import os
import mimetypes
from datetime import datetime, timedelta
import pathlib

# Register additional MIME types
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".jsx")
mimetypes.add_type("application/javascript", ".ts")
mimetypes.add_type("application/javascript", ".tsx")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("text/html", ".html")

from api.models import (
    Token, User, UserCreate, 
    StockData, AnalystData, SearchResult,
    YahooFinanceEarningsData, YahooFinanceRevenueData, YahooFinanceGrowthData,
    EarningsEstimate, RevenueEstimate, GrowthEstimate
)
from api.auth import (
    get_current_user, authenticate_user, 
    create_access_token, get_password_hash
)
from api.database import (
    get_user_by_username, create_user, 
    save_earnings_estimate, get_earnings_estimate,
    save_revenue_estimate, get_revenue_estimate,
    save_growth_estimate, get_growth_estimate
)
from api.yahoo_finance import (
    get_stock_data, get_analyst_data, 
    get_earnings_estimates, get_revenue_estimates,
    get_growth_estimates, search_stocks
)

# Create FastAPI app - API only
app = FastAPI(title="Yahoo Finance Clone API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication endpoints
@app.post("/api/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/register", response_model=User)
async def register_user(user: UserCreate):
    db_user = get_user_by_username(user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    created_user = create_user(user.username, user.email, hashed_password)
    
    return created_user

@app.get("/api/user", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/api/logout")
async def logout():
    # For JWT-based auth, the client handles logout by removing the token
    return {"message": "Logged out successfully"}

# Stock data endpoints
@app.get("/api/stock/{ticker}", response_model=StockData)
async def get_stock_info(ticker: str):
    try:
        stock_data = get_stock_data(ticker)
        return {
            "symbol": stock_data["symbol"],
            "name": stock_data["shortName"],
            "price": stock_data["regularMarketPrice"],
            "change": stock_data["regularMarketChange"],
            "changePercent": stock_data["regularMarketChangePercent"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stock data: {str(e)}"
        )

@app.get("/api/stock/{ticker}/analyst", response_model=AnalystData)
async def get_analyst_info(ticker: str):
    try:
        analyst_data = get_analyst_data(ticker)
        return {
            "recommendationMean": analyst_data["recommendationMean"],
            "recommendationTrends": {
                "strongBuy": analyst_data["recommendationTrends"]["strongBuy"],
                "buy": analyst_data["recommendationTrends"]["buy"],
                "hold": analyst_data["recommendationTrends"]["hold"],
                "underperform": analyst_data["recommendationTrends"]["sell"],
                "sell": analyst_data["recommendationTrends"]["strongSell"] 
                    if "strongSell" in analyst_data["recommendationTrends"] 
                    else 0
            },
            "targetLow": analyst_data["targetLowPrice"],
            "targetMean": analyst_data["targetMeanPrice"],
            "targetHigh": analyst_data["targetHighPrice"],
            "targetMedian": analyst_data["targetMedianPrice"],
            "currentPrice": analyst_data["currentPrice"] 
                if "currentPrice" in analyst_data 
                else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analyst data: {str(e)}"
        )

@app.get("/api/stock/{ticker}/earnings", response_model=YahooFinanceEarningsData)
async def get_earnings_info(ticker: str):
    try:
        return get_earnings_estimates(ticker)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch earnings data: {str(e)}"
        )

@app.get("/api/stock/{ticker}/revenue", response_model=YahooFinanceRevenueData)
async def get_revenue_info(ticker: str):
    try:
        return get_revenue_estimates(ticker)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch revenue data: {str(e)}"
        )
        
@app.get("/api/stock/{ticker}/growth", response_model=YahooFinanceGrowthData)
async def get_growth_info(ticker: str):
    try:
        return get_growth_estimates(ticker)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch growth data: {str(e)}"
        )

@app.get("/api/search", response_model=List[SearchResult])
async def search_for_stocks(query: str):
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query is required"
        )
    
    try:
        results = search_stocks(query)
        return [
            SearchResult(
                symbol=result["symbol"],
                shortname=result["shortname"],
                longname=result.get("longname"),
                exchDisp=result["exchDisp"],
                typeDisp=result["typeDisp"]
            ) for result in results
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search for stocks: {str(e)}"
        )

# Custom estimates endpoints
@app.post("/api/estimates/{ticker}/earnings", response_model=EarningsEstimate)
async def save_earnings_estimate(
    estimate: EarningsEstimate,
    current_user: User = Depends(get_current_user)
):
    try:
        # Ensure the user can only save their own estimates
        if estimate.userId != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot save estimates for another user"
            )
        
        saved_estimate = save_earnings_estimate(
            estimate.ticker, estimate.userId, estimate.periods
        )
        return saved_estimate
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save earnings estimate: {str(e)}"
        )

@app.post("/api/estimates/{ticker}/revenue", response_model=RevenueEstimate)
async def save_revenue_estimate(
    estimate: RevenueEstimate,
    current_user: User = Depends(get_current_user)
):
    try:
        # Ensure the user can only save their own estimates
        if estimate.userId != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot save estimates for another user"
            )
        
        saved_estimate = save_revenue_estimate(
            estimate.ticker, estimate.userId, estimate.periods
        )
        return saved_estimate
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save revenue estimate: {str(e)}"
        )

@app.post("/api/estimates/{ticker}/growth", response_model=GrowthEstimate)
async def save_growth_estimate(
    estimate: GrowthEstimate,
    current_user: User = Depends(get_current_user)
):
    try:
        # Ensure the user can only save their own estimates
        if estimate.userId != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot save estimates for another user"
            )
        
        saved_estimate = save_growth_estimate(
            estimate.ticker, estimate.userId, estimate.periods
        )
        return saved_estimate
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save growth estimate: {str(e)}"
        )

# Get user's custom estimates
@app.get("/api/estimates/{ticker}/earnings", response_model=EarningsEstimate)
async def get_user_earnings_estimate(
    ticker: str,
    current_user: User = Depends(get_current_user)
):
    try:
        estimate = get_earnings_estimate(ticker, current_user["id"])
        if not estimate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No earnings estimate found for this ticker"
            )
        return estimate
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve earnings estimate: {str(e)}"
        )

@app.get("/api/estimates/{ticker}/revenue", response_model=RevenueEstimate)
async def get_user_revenue_estimate(
    ticker: str,
    current_user: User = Depends(get_current_user)
):
    try:
        estimate = get_revenue_estimate(ticker, current_user["id"])
        if not estimate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No revenue estimate found for this ticker"
            )
        return estimate
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve revenue estimate: {str(e)}"
        )

@app.get("/api/estimates/{ticker}/growth", response_model=GrowthEstimate)
async def get_user_growth_estimate(
    ticker: str,
    current_user: User = Depends(get_current_user)
):
    try:
        estimate = get_growth_estimate(ticker, current_user["id"])
        if not estimate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No growth estimate found for this ticker"
            )
        return estimate
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve growth estimate: {str(e)}"
        )

# For direct running (development)
if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=3000, reload=True)