import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { YahooFinanceEarningsData, EarningsEstimate } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit2, Save, X, AlertTriangle, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-simple-auth";
import { useGuestEstimates, GuestEarningsEstimate } from "@/hooks/use-guest-estimates";

interface EarningsEstimatesProps {
  ticker: string;
}

export default function EarningsEstimates({ ticker }: EarningsEstimatesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getEarningsEstimate, saveEarningsEstimate } = useGuestEstimates();
  const [isEditing, setIsEditing] = useState(false);
  const [customEstimates, setCustomEstimates] = useState<Record<string, string>>({
    currentQtr: "",
    nextQtr: "",
    currentYear: "",
    nextYear: "",
  });
  const [guestEstimate, setGuestEstimate] = useState<GuestEarningsEstimate | null>(null);
  
  // Debug: Log auth state
  console.log("EarningsEstimates auth state:", { user, isUser: !!user });
  
  // Fetch Yahoo Finance earnings data
  const { 
    data: earningsData, 
    isLoading: isLoadingYahooData 
  } = useQuery<YahooFinanceEarningsData>({
    queryKey: [`/api/stock/${ticker}/earnings`],
  });
  
  // Fetch user's custom estimates if logged in
  const { 
    data: userEstimates, 
    isLoading: isLoadingUserData 
  } = useQuery<EarningsEstimate>({
    queryKey: [`/api/user/estimates/${ticker}/earnings`],
    enabled: !!user,
  });
  
  // Load guest estimates on component mount
  useEffect(() => {
    const estimate = getEarningsEstimate(ticker);
    setGuestEstimate(estimate);
  }, [ticker, getEarningsEstimate]);
  
  // Mutation for saving custom estimates
  const saveMutation = useMutation({
    mutationFn: async (data: { 
      ticker: string; 
      periods: Record<string, number>; 
    }) => {
      const response = await apiRequest(
        "POST", 
        "/api/user/estimates/earnings", 
        data
      );
      return response.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Estimates Saved",
        description: "Your custom earnings estimates have been saved.",
      });
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ 
        queryKey: [`/api/user/estimates/${ticker}/earnings`] 
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save estimates: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });
  
  // Initialize editing form with current estimates
  const startEditing = () => {
    if (user && userEstimates?.periods) {
      // If user is logged in, use their saved estimates
      setCustomEstimates({
        currentQtr: userEstimates.periods.currentQtr.toString(),
        nextQtr: userEstimates.periods.nextQtr.toString(),
        currentYear: userEstimates.periods.currentYear.toString(),
        nextYear: userEstimates.periods.nextYear.toString(),
      });
    } else if (!user && guestEstimate?.periods) {
      // If guest user has saved estimates, use those
      setCustomEstimates({
        currentQtr: guestEstimate.periods.currentQtr.toString(),
        nextQtr: guestEstimate.periods.nextQtr.toString(),
        currentYear: guestEstimate.periods.currentYear.toString(),
        nextYear: guestEstimate.periods.nextYear.toString(),
      });
    } else {
      // Initialize with empty strings
      setCustomEstimates({
        currentQtr: "",
        nextQtr: "",
        currentYear: "",
        nextYear: "",
      });
    }
    setIsEditing(true);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
  };
  
  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setCustomEstimates((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Save custom estimates
  const saveCustomEstimates = () => {
    // Convert string values to numbers
    const periods: Record<string, number> = {};
    
    // Validate inputs
    let hasError = false;
    Object.entries(customEstimates).forEach(([key, value]) => {
      if (value.trim() === "") {
        // Skip empty values
        return;
      }
      
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        toast({
          title: "Invalid Input",
          description: `Please enter a valid number for ${key}`,
          variant: "destructive",
        });
        hasError = true;
        return;
      }
      
      periods[key] = numValue;
    });
    
    if (hasError || Object.keys(periods).length === 0) {
      return;
    }
    
    if (user) {
      // If user is logged in, save to server
      saveMutation.mutate({
        ticker,
        periods,
      });
    } else {
      // If no user is logged in, save to localStorage
      saveEarningsEstimate(ticker, periods);
      setGuestEstimate({
        ticker,
        periods: {
          currentQtr: periods.currentQtr || 0,
          nextQtr: periods.nextQtr || 0,
          currentYear: periods.currentYear || 0,
          nextYear: periods.nextYear || 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
      toast({
        title: "Estimates Saved",
        description: "Your custom earnings estimates have been saved locally. Sign in to save them permanently.",
      });
    }
  };
  
  // Format number as currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  const isLoading = isLoadingYahooData || (!!user && isLoadingUserData);
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Earnings Estimate</CardTitle>
          <CardDescription>
            EPS forecasts for upcoming periods
          </CardDescription>
        </div>
        
        {/* Show edit button for both logged-in users and guests */}
        {!isEditing && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={startEditing}
            disabled={isLoading || (!!user && saveMutation.isPending)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {(user && userEstimates) || (!user && guestEstimate) ? "Edit Estimates" : "Add Estimates"}
          </Button>
        )}
        
        {/* Show save/cancel buttons when editing (for both users and guests) */}
        {isEditing && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cancelEditing}
              disabled={!!user && saveMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={saveCustomEstimates}
              disabled={!!user && saveMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {!!user && saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {!user && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your estimates will be saved locally. Sign in to save them permanently and access them from any device.
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Yahoo Estimate</TableHead>
                <TableHead>Low / High</TableHead>
                <TableHead>Year Ago</TableHead>
                {(!isEditing) && (
                  <TableHead>Your Estimate</TableHead>
                )}
                {isEditing && (
                  <TableHead>Your Estimate</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Current Quarter */}
              <TableRow>
                <TableCell className="font-medium">
                  {earningsData?.currentQtr.label || "Current Qtr"}
                </TableCell>
                <TableCell>
                  {formatCurrency(earningsData?.currentQtr.yahooEstimate)}
                </TableCell>
                <TableCell>
                  {earningsData?.currentQtr.lowEstimate !== undefined && 
                   earningsData?.currentQtr.highEstimate !== undefined
                    ? `${formatCurrency(earningsData.currentQtr.lowEstimate)} / ${formatCurrency(earningsData.currentQtr.highEstimate)}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {formatCurrency(earningsData?.currentQtr.yearAgo)}
                </TableCell>
                {(!isEditing) && (
                  <TableCell>
                    {user && userEstimates?.periods.currentQtr !== undefined
                      ? formatCurrency(userEstimates.periods.currentQtr)
                      : !user && guestEstimate?.periods.currentQtr
                      ? formatCurrency(guestEstimate.periods.currentQtr)
                      : "-"}
                  </TableCell>
                )}
                {isEditing && (
                  <TableCell>
                    <Input
                      type="text"
                      value={customEstimates.currentQtr}
                      onChange={(e) => handleInputChange("currentQtr", e.target.value)}
                      placeholder="Enter your estimate"
                      className="w-40"
                    />
                  </TableCell>
                )}
              </TableRow>
              
              {/* Next Quarter */}
              <TableRow>
                <TableCell className="font-medium">
                  {earningsData?.nextQtr.label || "Next Qtr"}
                </TableCell>
                <TableCell>
                  {formatCurrency(earningsData?.nextQtr.yahooEstimate)}
                </TableCell>
                <TableCell>
                  {earningsData?.nextQtr.lowEstimate !== undefined && 
                   earningsData?.nextQtr.highEstimate !== undefined
                    ? `${formatCurrency(earningsData.nextQtr.lowEstimate)} / ${formatCurrency(earningsData.nextQtr.highEstimate)}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {formatCurrency(earningsData?.nextQtr.yearAgo)}
                </TableCell>
                {(!isEditing) && (
                  <TableCell>
                    {user && userEstimates?.periods.nextQtr !== undefined
                      ? formatCurrency(userEstimates.periods.nextQtr)
                      : !user && guestEstimate?.periods.nextQtr
                      ? formatCurrency(guestEstimate.periods.nextQtr)
                      : "-"}
                  </TableCell>
                )}
                {isEditing && (
                  <TableCell>
                    <Input
                      type="text"
                      value={customEstimates.nextQtr}
                      onChange={(e) => handleInputChange("nextQtr", e.target.value)}
                      placeholder="Enter your estimate"
                      className="w-40"
                    />
                  </TableCell>
                )}
              </TableRow>
              
              {/* Current Year */}
              <TableRow>
                <TableCell className="font-medium">
                  {earningsData?.currentYear.label || "Current Year"}
                </TableCell>
                <TableCell>
                  {formatCurrency(earningsData?.currentYear.yahooEstimate)}
                </TableCell>
                <TableCell>
                  {earningsData?.currentYear.lowEstimate !== undefined && 
                   earningsData?.currentYear.highEstimate !== undefined
                    ? `${formatCurrency(earningsData.currentYear.lowEstimate)} / ${formatCurrency(earningsData.currentYear.highEstimate)}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {formatCurrency(earningsData?.currentYear.yearAgo)}
                </TableCell>
                {(!isEditing) && (
                  <TableCell>
                    {user && userEstimates?.periods.currentYear !== undefined
                      ? formatCurrency(userEstimates.periods.currentYear)
                      : !user && guestEstimate?.periods.currentYear
                      ? formatCurrency(guestEstimate.periods.currentYear)
                      : "-"}
                  </TableCell>
                )}
                {isEditing && (
                  <TableCell>
                    <Input
                      type="text"
                      value={customEstimates.currentYear}
                      onChange={(e) => handleInputChange("currentYear", e.target.value)}
                      placeholder="Enter your estimate"
                      className="w-40"
                    />
                  </TableCell>
                )}
              </TableRow>
              
              {/* Next Year */}
              <TableRow>
                <TableCell className="font-medium">
                  {earningsData?.nextYear.label || "Next Year"}
                </TableCell>
                <TableCell>
                  {formatCurrency(earningsData?.nextYear.yahooEstimate)}
                </TableCell>
                <TableCell>
                  {earningsData?.nextYear.lowEstimate !== undefined && 
                   earningsData?.nextYear.highEstimate !== undefined
                    ? `${formatCurrency(earningsData.nextYear.lowEstimate)} / ${formatCurrency(earningsData.nextYear.highEstimate)}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {formatCurrency(earningsData?.nextYear.yearAgo)}
                </TableCell>
                {(!isEditing) && (
                  <TableCell>
                    {user && userEstimates?.periods.nextYear !== undefined
                      ? formatCurrency(userEstimates.periods.nextYear)
                      : !user && guestEstimate?.periods.nextYear
                      ? formatCurrency(guestEstimate.periods.nextYear)
                      : "-"}
                  </TableCell>
                )}
                {isEditing && (
                  <TableCell>
                    <Input
                      type="text"
                      value={customEstimates.nextYear}
                      onChange={(e) => handleInputChange("nextYear", e.target.value)}
                      placeholder="Enter your estimate"
                      className="w-40"
                    />
                  </TableCell>
                )}
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}