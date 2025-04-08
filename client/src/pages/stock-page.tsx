import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import StockHeader from "@/components/stock-header";
import ResearchAnalysis from "@/components/research-analysis";
import EarningsEstimates from "@/components/earnings-estimates";
import RevenueEstimates from "@/components/revenue-estimates";
import GrowthEstimates from "@/components/growth-estimates";
import { useToast } from "@/hooks/use-toast";

export default function StockPage() {
  const { ticker = "" } = useParams();
  const normalizedTicker = ticker.toUpperCase();
  const { toast } = useToast();

  // Check if stock exists
  const {
    data: stockData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [`/api/stock/${normalizedTicker}`],
    retry: 1,
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error Loading Stock",
        description:
          (error as Error).message ||
          `Could not load data for ${normalizedTicker}. Please check the ticker symbol and try again.`,
        variant: "destructive",
      });
    }
  }, [isError, error, normalizedTicker, toast]);

  // Set page title
  useEffect(() => {
    if (stockData) {
      document.title = `${normalizedTicker} - ${stockData.shortName} | Yahoo Finance`;
    } else {
      document.title = `${normalizedTicker} | Yahoo Finance`;
    }
  }, [normalizedTicker, stockData]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isError ? (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">
                Stock Not Found
              </h2>
              <p className="mt-2 text-gray-600">
                We couldn't find data for the ticker symbol "{normalizedTicker}".
                Please check the ticker and try again.
              </p>
            </div>
          ) : (
            <>
              <StockHeader ticker={normalizedTicker} />
              <ResearchAnalysis ticker={normalizedTicker} />
              <EarningsEstimates ticker={normalizedTicker} />
              <RevenueEstimates ticker={normalizedTicker} />
              <GrowthEstimates ticker={normalizedTicker} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
