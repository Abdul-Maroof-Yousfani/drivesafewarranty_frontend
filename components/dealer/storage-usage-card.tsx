import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Database, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface StorageUsageCardProps {
  usedGB: number;
  limitGB: number;
  percentageUsed: number;
  availableGB: number;
}

export function StorageUsageCard({
  usedGB,
  limitGB,
  percentageUsed,
  availableGB,
}: StorageUsageCardProps) {
  // Determine color based on usage percentage
  const getStatusColor = () => {
    if (percentageUsed >= 90) return "destructive";
    if (percentageUsed >= 70) return "warning";
    return "success";
  };

  const getProgressBarColor = () => {
    if (percentageUsed >= 90) return "bg-red-500";
    if (percentageUsed >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTextColor = () => {
    if (percentageUsed >= 90) return "text-red-600 dark:text-red-400";
    if (percentageUsed >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Storage Usage</CardTitle>
          </div>
          <span className={cn("text-2xl font-bold", getTextColor())}>
            {percentageUsed.toFixed(1)}%
          </span>
        </div>
        <CardDescription>
          Your file storage allocation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={percentageUsed} 
            className="h-3"
            indicatorClassName={getProgressBarColor()}
          />
        </div>

        {/* Storage Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Used</p>
            <p className="text-lg font-semibold">
              {usedGB.toFixed(2)} GB
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Available</p>
            <p className="text-lg font-semibold">
              {availableGB.toFixed(2)} GB
            </p>
          </div>
        </div>

        {/* Total Quota */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Quota</span>
            <span className="font-medium">{limitGB.toFixed(2)} GB</span>
          </div>
        </div>

        {/* Warning Message */}
        {percentageUsed >= 90 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
            <Database className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                Storage Almost Full
              </p>
              <p className="text-red-700 dark:text-red-300">
                You're running out of storage space. Please delete unnecessary files or contact admin to increase your quota.
              </p>
            </div>
          </div>
        )}
        
        {percentageUsed >= 70 && percentageUsed < 90 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
            <Database className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                Storage Running Low
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                Consider removing old files to free up space.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
