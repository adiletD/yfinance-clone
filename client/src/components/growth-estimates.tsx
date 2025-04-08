import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { YahooFinanceGrowthData, GrowthEstimate } from "@shared/schema";
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
import { Edit2, Save, X, AlertTriangle } from "lucide-react";

interface GrowthEstimatesProps {
  ticker: string;
}

export default function GrowthEstimates({ ticker }: GrowthEstimatesProps) {
  // Temporarily use a null user until auth is fixed
  const user = null;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [customEstimates, setCustomEstimates] = useState<Record<string, string>>({
    currentQtr: "",
    nextQtr: "",
    currentYear: "",
    nextYear: "",
    next5Years: "",
    past5Years: "",
  });
  
  // Fetch Yahoo Finance growth data
  const { 
    data: growthData, 
    isLoading: isLoadingYahooData 
  } = useQuery<YahooFinanceGrowthData>({
    queryKey: [`/api/stock/${ticker}/growth`],
  });
  
  // Fetch user's custom estimates if logged in
  const { 
    data: userEstimates, 
    isLoading: isLoadingUserData 
  } = useQuery<GrowthEstimate>({
    queryKey: [`/api/user/estimates/${ticker}/growth`],
    enabled: !!user,
  });
  
  // Mutation for saving custom estimates
  const saveMutation = useMutation({
    mutationFn: async (data: { 
      ticker: string; 
      periods: Record<string, number>; 
    }) => {
      const response = await apiRequest(
        "POST", 
        "/api/user/estimates/growth", 
        data
      );
      return response.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Estimates Saved",
        description: "Your custom growth estimates have been saved.",
      });
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ 
        queryKey: [`/api/user/estimates/${ticker}/growth`] 
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
    if (userEstimates?.periods) {
      const periods = userEstimates.periods;
      setCustomEstimates({
        currentQtr: periods.currentQtr?.toString() || "",
        nextQtr: periods.nextQtr?.toString() || "",
        currentYear: periods.currentYear?.toString() || "",
        nextYear: periods.nextYear?.toString() || "",
        next5Years: periods.next5Years?.toString() || "",
        past5Years: periods.past5Years?.toString() || "",
      });
    } else {
      // Initialize with empty strings
      setCustomEstimates({
        currentQtr: "",
        nextQtr: "",
        currentYear: "",
        nextYear: "",
        next5Years: "",
        past5Years: "",
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
    
    saveMutation.mutate({
      ticker,
      periods,
    });
  };
  
  // Format number as percentage
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };
  
  const isLoading = isLoadingYahooData || (!!user && isLoadingUserData);
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Growth Estimates</CardTitle>
          <CardDescription>
            Projected growth rates for different periods
          </CardDescription>
        </div>
        
        {user && !isEditing && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={startEditing}
            disabled={isLoading || saveMutation.isPending}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            {userEstimates ? "Edit Estimates" : "Add Estimates"}
          </Button>
        )}
        
        {user && isEditing && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cancelEditing}
              disabled={saveMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={saveCustomEstimates}
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {!user && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sign in to add your own growth estimates and compare them with Yahoo Finance data.
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
                {(user && !isEditing) && (
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
                  {growthData?.currentQtr.label || "Current Qtr"}
                </TableCell>
                <TableCell className={growthData?.currentQtr.estimate && growthData.currentQtr.estimate >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatPercentage(growthData?.currentQtr.estimate)}
                </TableCell>
                {(user && !isEditing) && (
                  <TableCell className={userEstimates?.periods.currentQtr && userEstimates.periods.currentQtr >= 0 ? "text-green-600" : "text-red-600"}>
                    {userEstimates?.periods.currentQtr !== undefined
                      ? formatPercentage(userEstimates.periods.currentQtr)
                      : "-"}
                  </TableCell>
                )}
                {isEditing && (
                  <TableCell>
                    <Input
                      type="text"
                      value={customEstimates.currentQtr}
                      onChange={(e) => handleInputChange("currentQtr", e.target.value)}
                      placeholder="Enter % (e.g., 5.2)"
                      className="w-40"
                    />
                  </TableCell>
                )}
              </TableRow>
              
              {/* Next Quarter */}
              <TableRow>
                <TableCell className="font-medium">
                  {growthData?.nextQtr.label || "Next Qtr"}
                </TableCell>
                <TableCell className={growthData?.nextQtr.estimate && growthData.nextQtr.estimate >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatPercentage(growthData?.nextQtr.estimate)}
                </TableCell>
                {(user && !isEditing) && (
                  <TableCell className={userEstimates?.periods.nextQtr && userEstimates.periods.nextQtr >= 0 ? "text-green-600" : "text-red-600"}>
                    {userEstimates?.periods.nextQtr !== undefined
                      ? formatPercentage(userEstimates.periods.nextQtr)
                      : "-"}
                  </TableCell>
                )}
                {isEditing && (
                  <TableCell>
                    <Input
                      type="text"
                      value={customEstimates.nextQtr}
                      onChange={(e) => handleInputChange("nextQtr", e.target.value)}
                      placeholder="Enter % (e.g., 5.2)"
                      className="w-40"
                    />
                  </TableCell>
                )}
              </TableRow>
              
              {/* Current Year */}
              <TableRow>
                <TableCell className="font-medium">
                  {growthData?.currentYear.label || "Current Year"}
                </TableCell>
                <TableCell className={growthData?.currentYear.estimate && growthData.currentYear.estimate >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatPercentage(growthData?.currentYear.estimate)}
                </TableCell>
                {(user && !isEditing) && (
                  <TableCell className={userEstimates?.periods.currentYear && userEstimates.periods.currentYear >= 0 ? "text-green-600" : "text-red-600"}>
                    {userEstimates?.periods.currentYear !== undefined
                      ? formatPercentage(userEstimates.periods.currentYear)
                      : "-"}
                  </TableCell>
                )}
                {isEditing && (
                  <TableCell>
                    <Input
                      type="text"
                      value={customEstimates.currentYear}
                      onChange={(e) => handleInputChange("currentYear", e.target.value)}
                      placeholder="Enter % (e.g., 5.2)"
                      className="w-40"
                    />
                  </TableCell>
                )}
              </TableRow>
              
              {/* Next Year */}
              <TableRow>
                <TableCell className="font-medium">
                  {growthData?.nextYear.label || "Next Year"}
                </TableCell>
                <TableCell className={growthData?.nextYear.estimate && growthData.nextYear.estimate >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatPercentage(growthData?.nextYear.estimate)}
                </TableCell>
                {(user && !isEditing) && (
                  <TableCell className={userEstimates?.periods.nextYear && userEstimates.periods.nextYear >= 0 ? "text-green-600" : "text-red-600"}>
                    {userEstimates?.periods.nextYear !== undefined
                      ? formatPercentage(userEstimates.periods.nextYear)
                      : "-"}
                  </TableCell>
                )}
                {isEditing && (
                  <TableCell>
                    <Input
                      type="text"
                      value={customEstimates.nextYear}
                      onChange={(e) => handleInputChange("nextYear", e.target.value)}
                      placeholder="Enter % (e.g., 5.2)"
                      className="w-40"
                    />
                  </TableCell>
                )}
              </TableRow>
              
              {/* Next 5 Years */}
              <TableRow>
                <TableCell className="font-medium">
                  {growthData?.next5Years.label || "Next 5 Years (per annum)"}
                </TableCell>
                <TableCell className={growthData?.next5Years.estimate && growthData.next5Years.estimate >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatPercentage(growthData?.next5Years.estimate)}
                </TableCell>
                {(user && !isEditing) && (
                  <TableCell className={userEstimates?.periods.next5Years && userEstimates.periods.next5Years >= 0 ? "text-green-600" : "text-red-600"}>
                    {userEstimates?.periods.next5Years !== undefined
                      ? formatPercentage(userEstimates.periods.next5Years)
                      : "-"}
                  </TableCell>
                )}
                {isEditing && (
                  <TableCell>
                    <Input
                      type="text"
                      value={customEstimates.next5Years}
                      onChange={(e) => handleInputChange("next5Years", e.target.value)}
                      placeholder="Enter % (e.g., 5.2)"
                      className="w-40"
                    />
                  </TableCell>
                )}
              </TableRow>
              
              {/* Past 5 Years */}
              <TableRow>
                <TableCell className="font-medium">
                  {growthData?.past5Years.label || "Past 5 Years (per annum)"}
                </TableCell>
                <TableCell className={growthData?.past5Years.estimate && growthData.past5Years.estimate >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatPercentage(growthData?.past5Years.estimate)}
                </TableCell>
                {(user && !isEditing) && (
                  <TableCell className={userEstimates?.periods.past5Years && userEstimates.periods.past5Years >= 0 ? "text-green-600" : "text-red-600"}>
                    {userEstimates?.periods.past5Years !== undefined
                      ? formatPercentage(userEstimates.periods.past5Years)
                      : "-"}
                  </TableCell>
                )}
                {isEditing && (
                  <TableCell>
                    <Input
                      type="text"
                      value={customEstimates.past5Years}
                      onChange={(e) => handleInputChange("past5Years", e.target.value)}
                      placeholder="Enter % (e.g., 5.2)"
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