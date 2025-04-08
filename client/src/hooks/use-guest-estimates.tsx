import { createContext, ReactNode, useContext, useState, useEffect } from "react";

type GuestEstimatesContextType = {
  // Earnings Estimates
  getEarningsEstimate: (ticker: string) => GuestEarningsEstimate | null;
  saveEarningsEstimate: (ticker: string, periods: Record<string, number>) => void;
  
  // Revenue Estimates
  getRevenueEstimate: (ticker: string) => GuestRevenueEstimate | null;
  saveRevenueEstimate: (ticker: string, periods: Record<string, number>) => void;
  
  // Growth Estimates
  getGrowthEstimate: (ticker: string) => GuestGrowthEstimate | null;
  saveGrowthEstimate: (ticker: string, periods: Record<string, number>) => void;
  
  // Clear all guest estimates (e.g., after transfer to user account)
  clearAllEstimates: () => void;
};

// Simplified types for guest estimates
export type GuestEarningsEstimate = {
  ticker: string;
  periods: {
    currentQtr: number;
    nextQtr: number;
    currentYear: number;
    nextYear: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type GuestRevenueEstimate = {
  ticker: string;
  periods: {
    currentQtr: number;
    nextQtr: number;
    currentYear: number;
    nextYear: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type GuestGrowthEstimate = {
  ticker: string;
  periods: {
    currentQtr: number;
    nextQtr: number;
    currentYear: number;
    nextYear: number;
    next5Years: number;
    past5Years: number;
  };
  createdAt: string;
  updatedAt: string;
};

// Storage keys
const STORAGE_KEYS = {
  EARNINGS: 'guestEarningsEstimates',
  REVENUE: 'guestRevenueEstimates',
  GROWTH: 'guestGrowthEstimates'
};

// Create context
const GuestEstimatesContext = createContext<GuestEstimatesContextType>({
  getEarningsEstimate: () => null,
  saveEarningsEstimate: () => {},
  getRevenueEstimate: () => null,
  saveRevenueEstimate: () => {},
  getGrowthEstimate: () => null,
  saveGrowthEstimate: () => {},
  clearAllEstimates: () => {}
});

// Provider component
export function GuestEstimatesProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage
  const [earningsEstimates, setEarningsEstimates] = useState<Record<string, GuestEarningsEstimate>>({});
  const [revenueEstimates, setRevenueEstimates] = useState<Record<string, GuestRevenueEstimate>>({});
  const [growthEstimates, setGrowthEstimates] = useState<Record<string, GuestGrowthEstimate>>({});
  
  // Load estimates from localStorage on component mount
  useEffect(() => {
    try {
      const storedEarnings = localStorage.getItem(STORAGE_KEYS.EARNINGS);
      if (storedEarnings) {
        setEarningsEstimates(JSON.parse(storedEarnings));
      }
      
      const storedRevenue = localStorage.getItem(STORAGE_KEYS.REVENUE);
      if (storedRevenue) {
        setRevenueEstimates(JSON.parse(storedRevenue));
      }
      
      const storedGrowth = localStorage.getItem(STORAGE_KEYS.GROWTH);
      if (storedGrowth) {
        setGrowthEstimates(JSON.parse(storedGrowth));
      }
    } catch (error) {
      console.error("Error loading guest estimates from localStorage:", error);
    }
  }, []);
  
  // Save to localStorage whenever estimates change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EARNINGS, JSON.stringify(earningsEstimates));
  }, [earningsEstimates]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVENUE, JSON.stringify(revenueEstimates));
  }, [revenueEstimates]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GROWTH, JSON.stringify(growthEstimates));
  }, [growthEstimates]);
  
  // Earnings estimates
  const getEarningsEstimate = (ticker: string): GuestEarningsEstimate | null => {
    return earningsEstimates[ticker] || null;
  };
  
  const saveEarningsEstimate = (ticker: string, periodsData: Record<string, number>) => {
    const now = new Date().toISOString();
    
    // Convert general Record to specific structure
    const typedPeriods = {
      currentQtr: periodsData.currentQtr || 0,
      nextQtr: periodsData.nextQtr || 0,
      currentYear: periodsData.currentYear || 0,
      nextYear: periodsData.nextYear || 0
    };
    
    setEarningsEstimates(prev => ({
      ...prev,
      [ticker]: {
        ticker,
        periods: typedPeriods,
        createdAt: prev[ticker]?.createdAt || now,
        updatedAt: now
      }
    }));
  };
  
  // Revenue estimates
  const getRevenueEstimate = (ticker: string): GuestRevenueEstimate | null => {
    return revenueEstimates[ticker] || null;
  };
  
  const saveRevenueEstimate = (ticker: string, periodsData: Record<string, number>) => {
    const now = new Date().toISOString();
    
    // Convert general Record to specific structure
    const typedPeriods = {
      currentQtr: periodsData.currentQtr || 0,
      nextQtr: periodsData.nextQtr || 0,
      currentYear: periodsData.currentYear || 0,
      nextYear: periodsData.nextYear || 0
    };
    
    setRevenueEstimates(prev => ({
      ...prev,
      [ticker]: {
        ticker,
        periods: typedPeriods,
        createdAt: prev[ticker]?.createdAt || now,
        updatedAt: now
      }
    }));
  };
  
  // Growth estimates
  const getGrowthEstimate = (ticker: string): GuestGrowthEstimate | null => {
    return growthEstimates[ticker] || null;
  };
  
  const saveGrowthEstimate = (ticker: string, periodsData: Record<string, number>) => {
    const now = new Date().toISOString();
    
    // Convert general Record to specific structure for growth estimates
    const typedPeriods = {
      currentQtr: periodsData.currentQtr || 0,
      nextQtr: periodsData.nextQtr || 0,
      currentYear: periodsData.currentYear || 0,
      nextYear: periodsData.nextYear || 0,
      next5Years: periodsData.next5Years || 0,
      past5Years: periodsData.past5Years || 0
    };
    
    setGrowthEstimates(prev => ({
      ...prev,
      [ticker]: {
        ticker,
        periods: typedPeriods,
        createdAt: prev[ticker]?.createdAt || now,
        updatedAt: now
      }
    }));
  };
  
  // Clear all estimates
  const clearAllEstimates = () => {
    setEarningsEstimates({});
    setRevenueEstimates({});
    setGrowthEstimates({});
    localStorage.removeItem(STORAGE_KEYS.EARNINGS);
    localStorage.removeItem(STORAGE_KEYS.REVENUE);
    localStorage.removeItem(STORAGE_KEYS.GROWTH);
  };
  
  const value: GuestEstimatesContextType = {
    getEarningsEstimate,
    saveEarningsEstimate,
    getRevenueEstimate,
    saveRevenueEstimate,
    getGrowthEstimate,
    saveGrowthEstimate,
    clearAllEstimates
  };
  
  return (
    <GuestEstimatesContext.Provider value={value}>
      {children}
    </GuestEstimatesContext.Provider>
  );
}

// Hook to use the guest estimates context
export function useGuestEstimates() {
  return useContext(GuestEstimatesContext);
}