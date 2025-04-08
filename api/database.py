from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from typing import Dict, List, Optional, Union

# In-memory storage for development
users_db = {}
earnings_estimates_db = {}
revenue_estimates_db = {}
growth_estimates_db = {}
user_id_counter = 1

# User management functions
def get_user_by_username(username: str):
    if username in users_db:
        return users_db[username]
    return None

def get_user_by_id(user_id: int):
    for username, user in users_db.items():
        if user["id"] == user_id:
            return user
    return None

def create_user(username: str, email: str, hashed_password: str):
    global user_id_counter
    user = {
        "id": user_id_counter,
        "username": username,
        "email": email,
        "password": hashed_password
    }
    users_db[username] = user
    user_id_counter += 1
    return user

def get_all_users():
    return list(users_db.values())

# Estimate management functions
def save_earnings_estimate(ticker: str, user_id: int, periods: Dict[str, float]):
    key = f"{ticker}_{user_id}"
    estimate = {
        "ticker": ticker,
        "userId": user_id,
        "periods": periods,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    earnings_estimates_db[key] = estimate
    return estimate

def get_earnings_estimate(ticker: str, user_id: int):
    key = f"{ticker}_{user_id}"
    return earnings_estimates_db.get(key)

def save_revenue_estimate(ticker: str, user_id: int, periods: Dict[str, float]):
    key = f"{ticker}_{user_id}"
    estimate = {
        "ticker": ticker,
        "userId": user_id,
        "periods": periods,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    revenue_estimates_db[key] = estimate
    return estimate

def get_revenue_estimate(ticker: str, user_id: int):
    key = f"{ticker}_{user_id}"
    return revenue_estimates_db.get(key)

def save_growth_estimate(ticker: str, user_id: int, periods: Dict[str, float]):
    key = f"{ticker}_{user_id}"
    estimate = {
        "ticker": ticker,
        "userId": user_id,
        "periods": periods,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now()
    }
    growth_estimates_db[key] = estimate
    return estimate

def get_growth_estimate(ticker: str, user_id: int):
    key = f"{ticker}_{user_id}"
    return growth_estimates_db.get(key)

# Audit logging
def log_action(user_id: int, action: str, details: Dict):
    # Implementation for audit logging
    print(f"AUDIT: User {user_id} performed {action} with details: {details}")

# When we need SQL database, uncomment this code
"""
# Database setup
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./finance.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy models
class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, index=True)
    password = Column(String)
    
    earnings_estimates = relationship("EarningsEstimateModel", back_populates="user")
    revenue_estimates = relationship("RevenueEstimateModel", back_populates="user")
    growth_estimates = relationship("GrowthEstimateModel", back_populates="user")

class EarningsEstimateModel(Base):
    __tablename__ = "earnings_estimates"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    periods = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("UserModel", back_populates="earnings_estimates")

class RevenueEstimateModel(Base):
    __tablename__ = "revenue_estimates"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    periods = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("UserModel", back_populates="revenue_estimates")

class GrowthEstimateModel(Base):
    __tablename__ = "growth_estimates"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    periods = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("UserModel", back_populates="growth_estimates")

# Create tables
Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""