"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Eye, Edit, ClipboardPlus, Trash2 } from "lucide-react";
import { HighlightText } from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

export type WarrantyPackageRow = {
  id: string;
  name: string;
  description: string;
  durationValue: number;
  durationUnit: "months" | "years";
  price: number;
  createdAt: string;
  featuresCount: number;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
  deletedAt?: string | null;
};

export const getColumns = (
  onRefresh: () => void
): ColumnDef<WarrantyPackageRow>[] => [
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
    accessorKey: "name",
    header: "Package Name",
    enableSorting: true,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <HighlightText text={name} className="truncate" />;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isDeleted = !!row.original.deletedAt;
      
      if (isDeleted) {
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
            Deleted
          </Badge>
        );
      }

      return (
        <Badge
          variant={status === "active" ? "default" : "secondary"}
          className={
            status === "active"
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
          }
        >
          {status === "active" ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "featuresCount",
    header: "Features (count)",
    enableSorting: true,
    cell: ({ row }) => {
      const count = row.getValue("featuresCount") as number;
      return count ?? 0;
    },
  },
  {
    accessorKey: "price12Months",
    header: "12 month price",
    enableSorting: true,
    cell: ({ row }) => {
      const val = row.getValue("price12Months") as number | null;
      return val != null ? `£${Number(val).toFixed(2)}` : "—";
    },
  },
  {
    accessorKey: "price24Months",
    header: "24 month price",
    enableSorting: true,
    cell: ({ row }) => {
      const val = row.getValue("price24Months") as number | null;
      return val != null ? `£${Number(val).toFixed(2)}` : "—";
    },
  },
  {
    accessorKey: "price36Months",
    header: "36 month price",
    enableSorting: true,
    cell: ({ row }) => {
      const val = row.getValue("price36Months") as number | null;
      return val != null ? `£${Number(val).toFixed(2)}` : "—";
    },
  },
  {
    accessorKey: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const pkg = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/super-admin/warranty-packages/view/${pkg.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/super-admin/warranty-packages/edit/${pkg.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href={`/super-admin/warranty-sales/create?packageId=${pkg.id}`}
                  >
                    <ClipboardPlus className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Assign to Customer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DeleteAction id={pkg.id} name={pkg.name} isDeleted={!!pkg.deletedAt} onRefresh={onRefresh} />
        </div>
      );
    },
  },
];

function DeleteAction({ id, name, isDeleted, onRefresh }: { id: string, name: string, isDeleted: boolean, onRefresh: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const onRestore = () => {
    startTransition(async () => {
      const { restoreWarrantyPackageAction } = await import("@/lib/actions/warranty-package");
      const res = await restoreWarrantyPackageAction(id);
      if (res.status) {
        toast.success(res.message || "Package restored successfully");
        router.refresh();
        onRefresh();
      } else {
        toast.error(res.message || "Failed to restore package");
      }
    });
  };

  const onDelete = () => {
    startTransition(async () => {
      const { deleteWarrantyPackageAction } = await import("@/lib/actions/warranty-package");
      const res = await deleteWarrantyPackageAction(id);
      if (res.status) {
        toast.success(res.message || "Package deleted successfully");
        router.refresh();
        onRefresh();
      } else {
        toast.error(res.message || "Failed to delete package");
      }
    });
  };

  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip>
          <AlertDialogTrigger asChild>
            <TooltipTrigger asChild>
              {isDeleted ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  disabled={isPending}
                >
                  <ArrowUpDown className="h-4 w-4 rotate-180" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </TooltipTrigger>
          </AlertDialogTrigger>
          <TooltipContent>
            <p>{isDeleted ? "Restore Package" : "Delete Package"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDeleted ? "Restore Warranty Package" : "Delete Warranty Package"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDeleted
              ? `Are you sure you want to restore "${name}"? This will reactivate the package across all assigned dealers.`
              : `Are you sure you want to delete "${name}"?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={isDeleted ? onRestore : onDelete}
            disabled={isPending}
            className={isDeleted ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {isDeleted ? "Restore" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
