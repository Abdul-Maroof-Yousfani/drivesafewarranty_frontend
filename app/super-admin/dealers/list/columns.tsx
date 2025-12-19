"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Eye, Edit, Trash2, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");

// Client-side function to download credentials
async function handleDownloadCredentials(dealerId: string) {
  try {
    // Use credentials: 'include' to send httpOnly cookies automatically
    const res = await fetch(`${API_BASE}/dealers/${dealerId}/credentials/download`, {
      method: 'GET',
      credentials: 'include', // This sends httpOnly cookies automatically
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to download credentials' }));
      toast.error(errorData.message || 'Failed to download credentials');
      return;
    }
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = res.headers.get('Content-Disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `dealer-credentials-${dealerId}.xlsx`;
    
    // Create blob and download
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success("Credentials file downloaded successfully");
  } catch (error) {
    console.error("Failed to download credentials:", error);
    toast.error("Failed to download credentials");
  }
}

export type DealerRow = {
  id: string;
  businessName: string;
  tradingName: string;
  email: string;
  phone: string;
  contactPerson: string;
  status: string;
  databaseName?: string | null;
  username?: string | null;
  excelFilePath?: string;
  createdAt: Date | string;
};

export const columns: ColumnDef<DealerRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 28,
  },
  {
    accessorKey: "businessName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Business Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const businessName = row.getValue("businessName") as string;
      const tradingName = row.original.tradingName;
      return (
        <div>
          <div className="font-medium">{businessName}</div>
          {tradingName && tradingName !== businessName && (
            <div className="text-xs text-muted-foreground">Trading: {tradingName}</div>
          )}
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: "contactPerson",
    header: "Contact Person",
    size: 150,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 200,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    size: 150,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
    size: 100,
  },
  {
    accessorKey: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const dealer = row.original;
      

      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/super-admin/dealers/view/${dealer.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Dealer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/super-admin/dealers/edit/${dealer.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Dealer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

       
        </div>
      );
    },
  },
];

