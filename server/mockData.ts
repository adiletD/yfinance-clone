import { 
  YahooFinanceStock, 
  YahooFinanceAnalystData, 
  YahooFinanceEarningsData, 
  YahooFinanceRevenueData, 
  YahooFinanceGrowthData,
  Period
} from '@shared/schema';

// Function to generate random stock price between 10 and 1000
const getRandomPrice = (min = 10, max = 1000) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Function to generate random percentage change between -10% and +10%
const getRandomChange = (min = -10, max = 10) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Function to generate a random number in a range
const getRandomNumber = (min: number, max: number) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Generate random large numbers for things like volume and market cap
const getRandomLargeNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

// Generate random recommendations
const getRandomRecommendations = () => {
  return {
    strongBuy: Math.floor(Math.random() * 10),
    buy: Math.floor(Math.random() * 15),
    hold: Math.floor(Math.random() * 20),
    sell: Math.floor(Math.random() * 10),
    strongSell: Math.floor(Math.random() * 5)
  };
};

// Formats a quarter string (e.g., "2Q2025")
const formatQuarterLabel = (quarterNum: number, year: number) => {
  return `${quarterNum}Q${year}`;
};

// Get current year and quarter
const getCurrentQuarter = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  // Calculate quarter (0-2: Q1, 3-5: Q2, 6-8: Q3, 9-11: Q4)
  const quarter = Math.floor(month / 3) + 1;
  
  return { year, quarter };
};

// Create a period object for earnings/revenue data
const createPeriod = (label: string, baseValue: number): Period => {
  const yahooEstimate = parseFloat((baseValue).toFixed(2));
  const lowEstimate = parseFloat((baseValue * 0.9).toFixed(2));
  const highEstimate = parseFloat((baseValue * 1.1).toFixed(2));
  const yearAgo = parseFloat((baseValue * 0.85).toFixed(2));
  
  return {
    label,
    yahooEstimate,
    lowEstimate,
    highEstimate,
    yearAgo
  };
};

// Mock stock data for any ticker
export function getMockStockData(ticker: string): YahooFinanceStock {
  const price = getRandomPrice();
  const change = getRandomChange();
  const changePercent = change / price * 100;
  
  return {
    symbol: ticker,
    shortName: `${ticker} Inc.`,
    longName: `${ticker} Corporation`,
    regularMarketPrice: price,
    regularMarketChange: change,
    regularMarketChangePercent: changePercent,
    regularMarketDayHigh: price * 1.02,
    regularMarketDayLow: price * 0.98,
    regularMarketVolume: getRandomLargeNumber(1000000, 10000000),
    trailingPE: getRandomNumber(10, 40),
    marketCap: getRandomLargeNumber(1000000000, 1000000000000)
  };
}

// Mock analyst data for any ticker
export function getMockAnalystData(ticker: string): YahooFinanceAnalystData {
  const price = getRandomPrice();
  const targetMean = price * (1 + getRandomChange(-5, 20) / 100);
  const targetMedian = targetMean * (1 + getRandomChange(-2, 2) / 100);
  const targetLow = targetMean * 0.8;
  const targetHigh = targetMean * 1.2;
  
  return {
    targetHighPrice: targetHigh,
    targetLowPrice: targetLow,
    targetMeanPrice: targetMean,
    targetMedianPrice: targetMedian,
    recommendationMean: getRandomNumber(1, 5),
    recommendationKey: ['strongSell', 'sell', 'hold', 'buy', 'strongBuy'][Math.floor(Math.random() * 5)],
    numberOfAnalystOpinions: Math.floor(Math.random() * 30) + 5,
    recommendationTrends: {
      strongBuy: Math.floor(Math.random() * 10),
      buy: Math.floor(Math.random() * 15),
      hold: Math.floor(Math.random() * 20),
      sell: Math.floor(Math.random() * 10),
      strongSell: Math.floor(Math.random() * 5)
    }
  };
}

// Mock earnings data for any ticker
export function getMockEarningsData(ticker: string): YahooFinanceEarningsData {
  const { year, quarter } = getCurrentQuarter();
  
  // Base earnings per share
  const baseEPS = getRandomNumber(0.5, 5);
  
  // Calculate labels for the quarters
  const currentQtrLabel = formatQuarterLabel(quarter, year);
  const nextQtrLabel = formatQuarterLabel(quarter === 4 ? 1 : quarter + 1, quarter === 4 ? year + 1 : year);
  const currentYearLabel = `${year}`;
  const nextYearLabel = `${year + 1}`;
  
  return {
    currentQtr: createPeriod(currentQtrLabel, baseEPS),
    nextQtr: createPeriod(nextQtrLabel, baseEPS * 1.05),
    currentYear: createPeriod(currentYearLabel, baseEPS * 4),
    nextYear: createPeriod(nextYearLabel, baseEPS * 4.2)
  };
}

// Mock revenue data for any ticker
export function getMockRevenueData(ticker: string): YahooFinanceRevenueData {
  const { year, quarter } = getCurrentQuarter();
  
  // Base revenue in millions
  const baseRevenue = getRandomNumber(500, 5000);
  
  // Calculate labels for the quarters
  const currentQtrLabel = formatQuarterLabel(quarter, year);
  const nextQtrLabel = formatQuarterLabel(quarter === 4 ? 1 : quarter + 1, quarter === 4 ? year + 1 : year);
  const currentYearLabel = `${year}`;
  const nextYearLabel = `${year + 1}`;
  
  return {
    currentQtr: createPeriod(currentQtrLabel, baseRevenue),
    nextQtr: createPeriod(nextQtrLabel, baseRevenue * 1.08),
    currentYear: createPeriod(currentYearLabel, baseRevenue * 4),
    nextYear: createPeriod(nextYearLabel, baseRevenue * 4.3)
  };
}

// Mock growth data for any ticker
export function getMockGrowthData(ticker: string): YahooFinanceGrowthData {
  const { year, quarter } = getCurrentQuarter();
  
  // Calculate labels for the quarters
  const currentQtrLabel = formatQuarterLabel(quarter, year);
  const nextQtrLabel = formatQuarterLabel(quarter === 4 ? 1 : quarter + 1, quarter === 4 ? year + 1 : year);
  const currentYearLabel = `${year}`;
  const nextYearLabel = `${year + 1}`;
  
  return {
    currentQtr: { label: currentQtrLabel, estimate: getRandomNumber(1, 10) },
    nextQtr: { label: nextQtrLabel, estimate: getRandomNumber(2, 12) },
    currentYear: { label: currentYearLabel, estimate: getRandomNumber(5, 15) },
    nextYear: { label: nextYearLabel, estimate: getRandomNumber(8, 20) },
    next5Years: { label: "Next 5 Years (per annum)", estimate: getRandomNumber(10, 25) },
    past5Years: { label: "Past 5 Years (per annum)", estimate: getRandomNumber(8, 18) }
  };
}

// Mock search results
export function getMockSearchResults(query: string) {
  // Create some dummy tickers based on the query
  const results = [
    {
      symbol: query.toUpperCase(),
      shortname: `${query.toUpperCase()} Inc.`,
      longname: `${query.toUpperCase()} Corporation`,
      exchDisp: "NASDAQ",
      typeDisp: "Equity"
    }
  ];
  
  // Add some variations
  const suffixes = ['X', 'Y', 'Z', 'Tech', 'Group', 'Holdings'];
  for (let i = 0; i < 5; i++) {
    const symbol = `${query.toUpperCase()}${suffixes[i % suffixes.length]}`;
    results.push({
      symbol,
      shortname: `${symbol} Inc.`,
      longname: `${symbol} Corporation`,
      exchDisp: ["NASDAQ", "NYSE", "OTC"][i % 3],
      typeDisp: "Equity"
    });
  }
  
  return results;
}