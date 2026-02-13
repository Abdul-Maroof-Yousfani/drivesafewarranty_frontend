"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Eye, Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDealer, deleteDealer } from "@/lib/actions/dealer";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DealerStatusCell } from "./dealer-status-cell";

export type DealerRow = {
  id: string;
  businessName: string;
  tradingName: string;
  email: string;
  phone: string;
  contactPerson: string;
  status: string;
  businessAddress?: string;
  dealerLicenseNumber?: string;
  businessRegistrationNumber?: string;
  databaseName?: string | null;
  username?: string | null;
  excelFilePath?: string;
  createdAt: Date | string;
};

const dealerEditSchema = z.object({
  businessNameLegal: z.string().min(1),
  businessNameTrading: z.string().optional(),
  businessAddress: z.string().min(1),
  contactPersonName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  dealerLicenseNumber: z.string().optional(),
  businessRegistrationNumber: z.string().optional(),
  status: z.string().min(1),
});
type DealerEditValues = z.infer<typeof dealerEditSchema>;

import { DealerStatusHistoryDialog } from "./dealer-status-history-dialog";

function ActionsCell({ dealer }: { dealer: DealerRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteDealer(dealer.id);
      if (result.status) {
        toast.success(result.message || "Dealer deleted successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete dealer");
      }
    });
  };

  return (
    <div className="flex items-center gap-1 justify-end">
      <DealerStatusHistoryDialog dealerId={dealer.id} />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
              asChild
            >
              <Link href={`/super-admin/dealers/view/${dealer.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>View Details</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
              asChild
            >
              <Link href={`/super-admin/dealers/edit/${dealer.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit Dealer</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialog>
        <TooltipProvider>
          <Tooltip>
            <AlertDialogTrigger asChild>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
            </AlertDialogTrigger>
            <TooltipContent>Delete Dealer</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              dealer <strong>{dealer.businessName}</strong> and all associated data including their tenant database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[230px]">
                <div className="font-medium truncate">{businessName}</div>
                {tradingName && tradingName !== businessName && (
                  <div className="text-xs text-muted-foreground truncate">
                    Trading: {tradingName}
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{businessName}</p>
              {tradingName && tradingName !== businessName && (
                <p className="text-xs">Trading: {tradingName}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 250,
  },
  {
    accessorKey: "contactPerson",
    header: "Contact Person",
    size: 150,
    cell: ({ row }) => {
      const val = row.getValue("contactPerson") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate max-w-[130px]">{val}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{val}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 200,
    cell: ({ row }) => {
      const val = row.getValue("email") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate max-w-[180px]">{val}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{val}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    size: 150,
    cell: ({ row }) => {
      const val = row.getValue("phone") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate max-w-[130px]">{val}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{val}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <DealerStatusCell 
          dealerId={row.original.id} 
          initialStatus={row.getValue("status") as string} 
        />
      );
    },
    size: 180,
  },
  {
    accessorKey: "Actions",
    id: "actions",
    cell: ({ row }) => {
      return <ActionsCell dealer={row.original} />;
    },
  },
];
