"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Eye, Edit } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDealer } from "@/lib/actions/dealer";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

function ActionsCell({ dealer }: { dealer: DealerRow }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<DealerEditValues>({
    resolver: zodResolver(dealerEditSchema),
    defaultValues: {
      businessNameLegal: dealer.businessName,
      businessNameTrading: dealer.tradingName,
      businessAddress: dealer.businessAddress || "",
      contactPersonName: dealer.contactPerson,
      phone: dealer.phone,
      email: dealer.email,
      dealerLicenseNumber: dealer.dealerLicenseNumber || "",
      businessRegistrationNumber: dealer.businessRegistrationNumber || "",
      status: dealer.status,
    },
  });

  async function onSubmit(values: DealerEditValues) {
    startTransition(async () => {
      const res = await updateDealer(dealer.id, {
        businessNameLegal: values.businessNameLegal,
        businessNameTrading: values.businessNameTrading,
        businessAddress: values.businessAddress,
        contactPersonName: values.contactPersonName,
        phone: values.phone,
        email: values.email,
        dealerLicenseNumber: values.dealerLicenseNumber,
        businessRegistrationNumber: values.businessRegistrationNumber,
        status: values.status,
      });
      if (res.status) {
        toast.success("Dealer updated");
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to update dealer");
      }
    });
  }

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Dealer</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Legal Business Name</Label>
                <Input {...form.register("businessNameLegal")} />
              </div>
              <div className="space-y-2">
                <Label>Trading Name</Label>
                <Input {...form.register("businessNameTrading")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Business Address</Label>
              <Input {...form.register("businessAddress")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input {...form.register("contactPersonName")} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...form.register("phone")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...form.register("email")} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Input {...form.register("status")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dealer License #</Label>
                <Input {...form.register("dealerLicenseNumber")} />
              </div>
              <div className="space-y-2">
                <Label>Business Registration #</Label>
                <Input {...form.register("businessRegistrationNumber")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
      return <ActionsCell dealer={row.original} />;
    },
  },
];
