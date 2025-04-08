from pydantic import BaseModel, Field, EmailStr
from typing import Dict, List, Optional, Union
from datetime import datetime

# Authentication models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        orm_mode = True

# Finance models
class Period(BaseModel):
    label: str
    yahooEstimate: float
    lowEstimate: float
    highEstimate: float
    yearAgo: float

class EstimateBase(BaseModel):
    ticker: str
    userId: int
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

class EarningsEstimate(EstimateBase):
    periods: Dict[str, float]  # keys: currentQtr, nextQtr, currentYear, nextYear

class RevenueEstimate(EstimateBase):
    periods: Dict[str, float]  # keys: currentQtr, nextQtr, currentYear, nextYear

class GrowthEstimate(EstimateBase):
    periods: Dict[str, float]  # keys: currentQtr, nextQtr, currentYear, nextYear, next5Years, past5Years

class SearchResult(BaseModel):
    symbol: str
    shortname: str
    longname: Optional[str] = None
    exchDisp: str
    typeDisp: str

class StockData(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    changePercent: float

class AnalystRecommendation(BaseModel):
    strongBuy: int
    buy: int
    hold: int
    underperform: int
    sell: int

class AnalystData(BaseModel):
    recommendationMean: float
    recommendationTrends: AnalystRecommendation
    targetLow: float
    targetMean: float
    targetHigh: float
    targetMedian: float
    currentPrice: float

class YahooFinanceEarningsData(BaseModel):
    currentQtr: Period
    nextQtr: Period
    currentYear: Period
    nextYear: Period

class YahooFinanceRevenueData(BaseModel):
    currentQtr: Period
    nextQtr: Period
    currentYear: Period
    nextYear: Period

class GrowthPeriod(BaseModel):
    label: str
    estimate: float

class YahooFinanceGrowthData(BaseModel):
    currentQtr: GrowthPeriod
    nextQtr: GrowthPeriod
    currentYear: GrowthPeriod
    nextYear: GrowthPeriod
    next5Years: GrowthPeriod
    past5Years: GrowthPeriod