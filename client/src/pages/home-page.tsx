import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, TrendingUp, DollarSign, BarChart2 } from "lucide-react";

export default function HomePage() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/stock/${searchTerm.trim().toUpperCase()}`);
    }
  };

  const popularStocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "AMZN", name: "Amazon.com, Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "META", name: "Meta Platforms, Inc." },
    { symbol: "TSLA", name: "Tesla, Inc." },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                Yahoo Finance Analysis
              </h1>
              <p className="mt-3 max-w-md mx-auto text-xl text-primary-foreground sm:text-2xl md:mt-5 md:max-w-3xl">
                Get detailed financial analysis, stock estimates, and create your
                own custom forecasts.
              </p>

              <div className="mt-10 max-w-xl mx-auto">
                <form onSubmit={handleSearch} className="sm:flex">
                  <div className="min-w-0 flex-1">
                    <Input
                      type="text"
                      placeholder="Enter a stock ticker (e.g., AAPL, MSFT)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white text-gray-900 placeholder-gray-500 h-12"
                    />
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button
                      type="submit"
                      className="w-full h-12 bg-primary-foreground text-primary hover:bg-gray-100"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Stocks Section */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Popular Stocks
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Quickly access analysis for these frequently viewed stocks
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
              {popularStocks.map((stock) => (
                <Button
                  key={stock.symbol}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center"
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                >
                  <span className="text-lg font-bold text-primary">
                    {stock.symbol}
                  </span>
                  <span className="text-sm text-gray-500 mt-1 text-center">
                    {stock.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Comprehensive Stock Analysis
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Make informed decisions with our detailed financial analysis
                tools
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-6 w-6 mr-2 text-primary" />
                    Research Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    View analyst recommendations, price targets, and detailed
                    research to understand market sentiment.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-6 w-6 mr-2 text-primary" />
                    Earnings & Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Track earnings and revenue estimates, compare with past
                    performance, and add your own forecasts.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="h-6 w-6 mr-2 text-primary" />
                    Growth Estimates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Explore short and long-term growth projections alongside your
                    custom growth estimates.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
