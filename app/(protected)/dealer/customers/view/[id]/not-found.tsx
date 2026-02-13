import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function DealerCustomerNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Customer Not Found</CardTitle>
          </div>
          <CardDescription>
            The customer you're looking for doesn't exist or has been deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dealer/customers/list">Back to Customers List</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
