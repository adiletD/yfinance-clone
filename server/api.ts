import axios from 'axios';
import { 
  YahooFinanceStock, 
  YahooFinanceAnalystData, 
  YahooFinanceEarningsData, 
  YahooFinanceRevenueData, 
  YahooFinanceGrowthData,
  Period
} from '@shared/schema';

// Initialize the Yahoo Finance API client
const yahooFinanceBaseUrl = 'https://query1.finance.yahoo.com/v10/finance';

// Function to fetch stock data from Yahoo Finance
export async function getStockData(ticker: string): Promise<YahooFinanceStock> {
  try {
    const url = `${yahooFinanceBaseUrl}/quoteSummary/${ticker}?modules=price`;
    const response = await axios.get(url);
    
    const result = response.data.quoteSummary.result[0];
    const price = result.price;
    
    return {
      symbol: price.symbol,
      shortName: price.shortName,
      longName: price.longName || price.shortName,
      regularMarketPrice: price.regularMarketPrice.raw,
      regularMarketChange: price.regularMarketChange.raw,
      regularMarketChangePercent: price.regularMarketChangePercent.raw,
      regularMarketDayHigh: price.regularMarketDayHigh.raw,
      regularMarketDayLow: price.regularMarketDayLow.raw,
      regularMarketVolume: price.regularMarketVolume.raw,
      trailingPE: price.trailingPE?.raw || 0,
      marketCap: price.marketCap?.raw || 0
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${ticker}:`, error);
    throw new Error(`Failed to fetch stock data for ${ticker}`);
  }
}

// Function to fetch analyst data from Yahoo Finance
export async function getAnalystData(ticker: string): Promise<YahooFinanceAnalystData> {
  try {
    const url = `${yahooFinanceBaseUrl}/quoteSummary/${ticker}?modules=financialData,recommendationTrend`;
    const response = await axios.get(url);
    
    const result = response.data.quoteSummary.result[0];
    const financialData = result.financialData;
    const recommendationTrend = result.recommendationTrend.trend[0];
    
    return {
      targetHighPrice: financialData.targetHighPrice.raw,
      targetLowPrice: financialData.targetLowPrice.raw,
      targetMeanPrice: financialData.targetMeanPrice.raw,
      targetMedianPrice: financialData.targetMedianPrice.raw,
      recommendationMean: financialData.recommendationMean.raw,
      recommendationKey: financialData.recommendationKey,
      numberOfAnalystOpinions: financialData.numberOfAnalystOpinions.raw,
      recommendationTrends: {
        strongBuy: recommendationTrend.strongBuy,
        buy: recommendationTrend.buy,
        hold: recommendationTrend.hold,
        sell: recommendationTrend.sell,
        strongSell: recommendationTrend.strongSell
      }
    };
  } catch (error) {
    console.error(`Error fetching analyst data for ${ticker}:`, error);
    throw new Error(`Failed to fetch analyst data for ${ticker}`);
  }
}

// Function to fetch earnings estimate data
export async function getEarningsEstimates(ticker: string): Promise<YahooFinanceEarningsData> {
  try {
    const url = `${yahooFinanceBaseUrl}/quoteSummary/${ticker}?modules=earningsTrend`;
    const response = await axios.get(url);
    
    const result = response.data.quoteSummary.result[0];
    const earningsTrend = result.earningsTrend.trend;
    
    // Map the quarters to our format
    const currentQtr: Period = {
      label: `Current Qtr. (${earningsTrend[0].endDate})`,
      yahooEstimate: earningsTrend[0].epsAverage.raw,
      lowEstimate: earningsTrend[0].epsLow.raw,
      highEstimate: earningsTrend[0].epsHigh.raw,
      yearAgo: earningsTrend[0].epsTrend.yearAgoEps?.raw || 0
    };
    
    const nextQtr: Period = {
      label: `Next Qtr. (${earningsTrend[1].endDate})`,
      yahooEstimate: earningsTrend[1].epsAverage.raw,
      lowEstimate: earningsTrend[1].epsLow.raw,
      highEstimate: earningsTrend[1].epsHigh.raw,
      yearAgo: earningsTrend[1].epsTrend.yearAgoEps?.raw || 0
    };
    
    const currentYear: Period = {
      label: `Current Year (${earningsTrend[2].endDate.split('-')[0]})`,
      yahooEstimate: earningsTrend[2].epsAverage.raw,
      lowEstimate: earningsTrend[2].epsLow.raw,
      highEstimate: earningsTrend[2].epsHigh.raw,
      yearAgo: earningsTrend[2].epsTrend.yearAgoEps?.raw || 0
    };
    
    const nextYear: Period = {
      label: `Next Year (${earningsTrend[3].endDate.split('-')[0]})`,
      yahooEstimate: earningsTrend[3].epsAverage.raw,
      lowEstimate: earningsTrend[3].epsLow.raw,
      highEstimate: earningsTrend[3].epsHigh.raw,
      yearAgo: earningsTrend[3].epsTrend.yearAgoEps?.raw || 0
    };
    
    return {
      currentQtr,
      nextQtr,
      currentYear,
      nextYear
    };
  } catch (error) {
    console.error(`Error fetching earnings estimates for ${ticker}:`, error);
    throw new Error(`Failed to fetch earnings estimates for ${ticker}`);
  }
}

// Function to fetch revenue estimate data
export async function getRevenueEstimates(ticker: string): Promise<YahooFinanceRevenueData> {
  try {
    const url = `${yahooFinanceBaseUrl}/quoteSummary/${ticker}?modules=earningsTrend`;
    const response = await axios.get(url);
    
    const result = response.data.quoteSummary.result[0];
    const earningsTrend = result.earningsTrend.trend;
    
    // Map the quarters to our format
    const currentQtr: Period = {
      label: `Current Qtr. (${earningsTrend[0].endDate})`,
      yahooEstimate: earningsTrend[0].revenueAverage?.raw || 0,
      lowEstimate: earningsTrend[0].revenueLow?.raw || 0,
      highEstimate: earningsTrend[0].revenueHigh?.raw || 0,
      yearAgo: earningsTrend[0].earningsEstimate?.yearAgoRevenue?.raw || 0
    };
    
    const nextQtr: Period = {
      label: `Next Qtr. (${earningsTrend[1].endDate})`,
      yahooEstimate: earningsTrend[1].revenueAverage?.raw || 0,
      lowEstimate: earningsTrend[1].revenueLow?.raw || 0,
      highEstimate: earningsTrend[1].revenueHigh?.raw || 0,
      yearAgo: earningsTrend[1].earningsEstimate?.yearAgoRevenue?.raw || 0
    };
    
    const currentYear: Period = {
      label: `Current Year (${earningsTrend[2].endDate.split('-')[0]})`,
      yahooEstimate: earningsTrend[2].revenueAverage?.raw || 0,
      lowEstimate: earningsTrend[2].revenueLow?.raw || 0,
      highEstimate: earningsTrend[2].revenueHigh?.raw || 0,
      yearAgo: earningsTrend[2].earningsEstimate?.yearAgoRevenue?.raw || 0
    };
    
    const nextYear: Period = {
      label: `Next Year (${earningsTrend[3].endDate.split('-')[0]})`,
      yahooEstimate: earningsTrend[3].revenueAverage?.raw || 0,
      lowEstimate: earningsTrend[3].revenueLow?.raw || 0,
      highEstimate: earningsTrend[3].revenueHigh?.raw || 0,
      yearAgo: earningsTrend[3].earningsEstimate?.yearAgoRevenue?.raw || 0
    };
    
    return {
      currentQtr,
      nextQtr,
      currentYear,
      nextYear
    };
  } catch (error) {
    console.error(`Error fetching revenue estimates for ${ticker}:`, error);
    throw new Error(`Failed to fetch revenue estimates for ${ticker}`);
  }
}

// Function to fetch growth estimate data
export async function getGrowthEstimates(ticker: string): Promise<YahooFinanceGrowthData> {
  try {
    const url = `${yahooFinanceBaseUrl}/quoteSummary/${ticker}?modules=earningsTrend,defaultKeyStatistics`;
    const response = await axios.get(url);
    
    const result = response.data.quoteSummary.result[0];
    const earningsTrend = result.earningsTrend.trend;
    const keyStats = result.defaultKeyStatistics;
    
    return {
      currentQtr: {
        label: 'Current Qtr.',
        estimate: earningsTrend[0].growth?.raw * 100 || 0
      },
      nextQtr: {
        label: 'Next Qtr.',
        estimate: earningsTrend[1].growth?.raw * 100 || 0
      },
      currentYear: {
        label: 'Current Year',
        estimate: earningsTrend[2].growth?.raw * 100 || 0
      },
      nextYear: {
        label: 'Next Year',
        estimate: earningsTrend[3].growth?.raw * 100 || 0
      },
      next5Years: {
        label: 'Next 5 Years (per annum)',
        estimate: keyStats.fiveYearAverageReturn?.raw * 100 || 0
      },
      past5Years: {
        label: 'Past 5 Years (per annum)',
        estimate: keyStats.fiveYearAverageReturn?.raw * 100 || 0
      }
    };
  } catch (error) {
    console.error(`Error fetching growth estimates for ${ticker}:`, error);
    throw new Error(`Failed to fetch growth estimates for ${ticker}`);
  }
}

// Function to search for stocks
export async function searchStocks(query: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    
    return response.data.quotes.filter((quote: any) => quote.quoteType === 'EQUITY').slice(0, 10);
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    throw new Error(`Failed to search for ${query}`);
  }
}
