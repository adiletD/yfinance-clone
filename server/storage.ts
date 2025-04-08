import { users, type User, type InsertUser, EarningsEstimate, RevenueEstimate, GrowthEstimate } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Earnings Estimates
  getEarningsEstimates(ticker: string, userId: number): Promise<EarningsEstimate | undefined>;
  saveEarningsEstimates(estimate: EarningsEstimate): Promise<EarningsEstimate>;
  
  // Revenue Estimates
  getRevenueEstimates(ticker: string, userId: number): Promise<RevenueEstimate | undefined>;
  saveRevenueEstimates(estimate: RevenueEstimate): Promise<RevenueEstimate>;
  
  // Growth Estimates
  getGrowthEstimates(ticker: string, userId: number): Promise<GrowthEstimate | undefined>;
  saveGrowthEstimates(estimate: GrowthEstimate): Promise<GrowthEstimate>;
  
  // Audit logging
  logAction(userId: number, action: string, details: any): Promise<void>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private earningsEstimates: Map<string, EarningsEstimate>;
  private revenueEstimates: Map<string, RevenueEstimate>;
  private growthEstimates: Map<string, GrowthEstimate>;
  private auditLogs: Array<{ timestamp: Date, userId: number, action: string, details: any }>;
  currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.earningsEstimates = new Map();
    this.revenueEstimates = new Map();
    this.growthEstimates = new Map();
    this.auditLogs = [];
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }
  
  async getEarningsEstimates(ticker: string, userId: number): Promise<EarningsEstimate | undefined> {
    const key = `${ticker.toUpperCase()}_${userId}`;
    return this.earningsEstimates.get(key);
  }
  
  async saveEarningsEstimates(estimate: EarningsEstimate): Promise<EarningsEstimate> {
    const key = `${estimate.ticker.toUpperCase()}_${estimate.userId}`;
    const updatedEstimate = {
      ...estimate,
      updatedAt: new Date()
    };
    this.earningsEstimates.set(key, updatedEstimate);
    await this.logAction(estimate.userId, 'SAVE_EARNINGS_ESTIMATE', { ticker: estimate.ticker, periods: estimate.periods });
    return updatedEstimate;
  }
  
  async getRevenueEstimates(ticker: string, userId: number): Promise<RevenueEstimate | undefined> {
    const key = `${ticker.toUpperCase()}_${userId}`;
    return this.revenueEstimates.get(key);
  }
  
  async saveRevenueEstimates(estimate: RevenueEstimate): Promise<RevenueEstimate> {
    const key = `${estimate.ticker.toUpperCase()}_${userId}`;
    const updatedEstimate = {
      ...estimate,
      updatedAt: new Date()
    };
    this.revenueEstimates.set(key, updatedEstimate);
    await this.logAction(estimate.userId, 'SAVE_REVENUE_ESTIMATE', { ticker: estimate.ticker, periods: estimate.periods });
    return updatedEstimate;
  }
  
  async getGrowthEstimates(ticker: string, userId: number): Promise<GrowthEstimate | undefined> {
    const key = `${ticker.toUpperCase()}_${userId}`;
    return this.growthEstimates.get(key);
  }
  
  async saveGrowthEstimates(estimate: GrowthEstimate): Promise<GrowthEstimate> {
    const key = `${estimate.ticker.toUpperCase()}_${estimate.userId}`;
    const updatedEstimate = {
      ...estimate,
      updatedAt: new Date()
    };
    this.growthEstimates.set(key, updatedEstimate);
    await this.logAction(estimate.userId, 'SAVE_GROWTH_ESTIMATE', { ticker: estimate.ticker, periods: estimate.periods });
    return updatedEstimate;
  }
  
  async logAction(userId: number, action: string, details: any): Promise<void> {
    this.auditLogs.push({
      timestamp: new Date(),
      userId,
      action,
      details
    });
    console.log(`AUDIT: User ${userId} - ${action}`, details);
  }
}

export const storage = new MemStorage();
