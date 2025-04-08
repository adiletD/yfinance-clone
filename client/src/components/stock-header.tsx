import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { YahooFinanceStock } from "@shared/schema";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StockHeaderProps {
  ticker: string;
}

export default function StockHeader({ ticker }: StockHeaderProps) {
  const { data: stockData, isLoading } = useQuery<YahooFinanceStock>({
    queryKey: [`/api/stock/${ticker}`],
  });

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">
                {ticker} - {stockData?.shortName ?? stockData?.longName}
              </CardTitle>
              {stockData?.regularMarketChange !== undefined && (
                <div
                  className={`flex items-center ${
                    stockData.regularMarketChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stockData.regularMarketChange >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-semibold">
                    {stockData.regularMarketChangePercent.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
            <CardDescription>
              Stock • {stockData?.longName || ""}
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex gap-6">
            <Skeleton className="h-20 w-28" />
            <Skeleton className="h-20 w-28" />
            <Skeleton className="h-20 w-28" />
            <Skeleton className="h-20 w-28" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Price</p>
              <h3 className="text-2xl font-bold">
                ${stockData?.regularMarketPrice.toFixed(2)}
              </h3>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Day Range
              </p>
              <h3 className="text-base">
                ${stockData?.regularMarketDayLow.toFixed(2)} - $
                {stockData?.regularMarketDayHigh.toFixed(2)}
              </h3>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Volume
              </p>
              <h3 className="text-base">
                {stockData?.regularMarketVolume.toLocaleString()}
              </h3>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Market Cap
              </p>
              <h3 className="text-base">
                $
                {stockData?.marketCap
                  ? (stockData.marketCap / 1000000000).toFixed(2) + "B"
                  : "N/A"}
              </h3>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}