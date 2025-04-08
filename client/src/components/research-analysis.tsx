import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { YahooFinanceAnalystData } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

// Create a custom interface for our analyst data
interface ExtendedAnalystData {
  recommendationMean: number;
  targetLowPrice: number;
  targetMeanPrice: number;
  targetHighPrice: number;
  recommendationTrends: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  };
}

interface ResearchAnalysisProps {
  ticker: string;
}

export default function ResearchAnalysis({ ticker }: ResearchAnalysisProps) {
  const { data: analystData, isLoading } = useQuery<ExtendedAnalystData>({
    queryKey: [`/api/stock/${ticker}/analyst`],
  });

  // Rating categories and their colors
  const ratingColors = [
    { rating: "Strong Buy", color: "bg-green-600" },
    { rating: "Buy", color: "bg-green-400" },
    { rating: "Hold", color: "bg-yellow-400" },
    { rating: "Underperform", color: "bg-orange-400" },
    { rating: "Sell", color: "bg-red-500" },
  ];

  // Function to get recommendation text based on mean rating
  const getRecommendationText = (rating?: number) => {
    if (rating === undefined) return "N/A";
    if (rating <= 1.5) return "Strong Buy";
    if (rating <= 2.5) return "Buy";
    if (rating <= 3.5) return "Hold";
    if (rating <= 4.5) return "Underperform";
    return "Sell";
  };

  // Function to get recommendation color based on mean rating
  const getRecommendationColor = (rating?: number) => {
    if (rating === undefined) return "bg-gray-300";
    if (rating <= 1.5) return "bg-green-600";
    if (rating <= 2.5) return "bg-green-400";
    if (rating <= 3.5) return "bg-yellow-400";
    if (rating <= 4.5) return "bg-orange-400";
    return "bg-red-500";
  };

  // Calculate total recommendations
  const totalRecommendations = analystData?.recommendationTrends
    ? Object.values(analystData.recommendationTrends).reduce(
        (sum, count) => sum + count,
        0
      )
    : 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Research Analysis</CardTitle>
        <CardDescription>
          Analyst recommendations and price targets
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Rating */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Analyst Rating
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className={`h-7 w-7 rounded-full ${getRecommendationColor(
                    analystData?.recommendationMean
                  )}`}
                />
                <span className="text-2xl font-bold">
                  {getRecommendationText(analystData?.recommendationMean)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Mean recommendation of{" "}
                <span className="font-medium">
                  {analystData?.recommendationMean?.toFixed(2) || "N/A"}
                </span>{" "}
                from {totalRecommendations} analyst
                {totalRecommendations !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Recommendation Breakdown</h3>
              {ratingColors.map(({ rating, color }, index) => {
                // Map the rating to the corresponding property in recommendationTrends
                const ratingKey = rating
                  .replace(/\s+/g, "")
                  .toLowerCase();
                
                // This map allows us to handle the different naming between our UI and the API
                const apiKeyMap: Record<string, keyof ExtendedAnalystData['recommendationTrends']> = {
                  strongbuy: "strongBuy",
                  buy: "buy",
                  hold: "hold",
                  underperform: "strongSell", // Map underperform to strongSell
                  sell: "sell"
                };
                
                const count = analystData?.recommendationTrends[apiKeyMap[ratingKey]] || 0;
                const percentage = totalRecommendations
                  ? (count / totalRecommendations) * 100
                  : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm w-24">{rating}</span>
                    <Progress
                      value={percentage}
                      className={`h-2 w-full ${color}`}
                    />
                    <span className="text-sm w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Low Target
                </h4>
                <p className="text-xl font-bold mt-1">
                  ${analystData?.targetLowPrice?.toFixed(2) || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Average Target
                </h4>
                <p className="text-xl font-bold mt-1">
                  ${analystData?.targetMeanPrice?.toFixed(2) || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-muted-foreground">
                  High Target
                </h4>
                <p className="text-xl font-bold mt-1">
                  ${analystData?.targetHighPrice?.toFixed(2) || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}