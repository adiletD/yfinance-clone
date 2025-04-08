import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Period = {
  label: string;
  yahooEstimate: number;
  lowEstimate: number;
  highEstimate: number;
  yearAgo: number;
};

export type EarningsEstimate = {
  ticker: string;
  userId: number;
  periods: {
    currentQtr: number;
    nextQtr: number;
    currentYear: number;
    nextYear: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type RevenueEstimate = {
  ticker: string;
  userId: number;
  periods: {
    currentQtr: number;
    nextQtr: number;
    currentYear: number;
    nextYear: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type GrowthEstimate = {
  ticker: string;
  userId: number;
  periods: {
    currentQtr: number;
    nextQtr: number;
    currentYear: number;
    nextYear: number;
    next5Years: number;
    past5Years: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type Estimate = {
  period: string;
  value: number;
};

export type StockData = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

export type AnalystData = {
  recommendationMean: number;
  recommendationTrends: {
    strongBuy: number;
    buy: number;
    hold: number;
    underperform: number;
    sell: number;
  };
  targetLow: number;
  targetMean: number;
  targetHigh: number;
  targetMedian: number;
  currentPrice: number;
};

export const earningsEstimates = pgTable("earnings_estimates", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  periods: json("periods").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const revenueEstimates = pgTable("revenue_estimates", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  periods: json("periods").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const growthEstimates = pgTable("growth_estimates", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  periods: json("periods").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEarningsEstimateSchema = createInsertSchema(earningsEstimates).pick({
  ticker: true,
  userId: true,
  periods: true,
});

export const insertRevenueEstimateSchema = createInsertSchema(revenueEstimates).pick({
  ticker: true,
  userId: true,
  periods: true,
});

export const insertGrowthEstimateSchema = createInsertSchema(growthEstimates).pick({
  ticker: true,
  userId: true,
  periods: true,
});

export type InsertEarningsEstimate = z.infer<typeof insertEarningsEstimateSchema>;
export type InsertRevenueEstimate = z.infer<typeof insertRevenueEstimateSchema>;
export type InsertGrowthEstimate = z.infer<typeof insertGrowthEstimateSchema>;

export type EarningsEstimateData = typeof earningsEstimates.$inferSelect;
export type RevenueEstimateData = typeof revenueEstimates.$inferSelect;
export type GrowthEstimateData = typeof growthEstimates.$inferSelect;

export type YahooFinanceStock = {
  symbol: string;
  shortName: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  trailingPE: number;
  marketCap: number;
};

export type YahooFinanceAnalystData = {
  targetHighPrice: number;
  targetLowPrice: number;
  targetMeanPrice: number;
  targetMedianPrice: number;
  recommendationMean: number;
  recommendationKey: string;
  numberOfAnalystOpinions: number;
  recommendationTrends: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  };
};

export type YahooFinanceEarningsData = {
  currentQtr: Period;
  nextQtr: Period;
  currentYear: Period;
  nextYear: Period;
};

export type YahooFinanceRevenueData = {
  currentQtr: Period;
  nextQtr: Period;
  currentYear: Period;
  nextYear: Period;
};

export type YahooFinanceGrowthData = {
  currentQtr: { label: string; estimate: number };
  nextQtr: { label: string; estimate: number };
  currentYear: { label: string; estimate: number };
  nextYear: { label: string; estimate: number };
  next5Years: { label: string; estimate: number };
  past5Years: { label: string; estimate: number };
};
