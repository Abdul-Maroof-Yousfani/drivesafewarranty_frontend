"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpDown, Edit, Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCustomer } from "@/lib/actions/customer";
import { toast } from "sonner";

export type CustomerRow = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vin?: string | null;
  registrationNumber?: string | null;
  mileage?: number;
  dealerName?: string | null;
};

export const columns: ColumnDef<CustomerRow>[] = [
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    size: 200,
    cell: ({ row }) => {
      const val = row.getValue("name") as string;
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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const val = row.getValue("email") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate max-w-[200px]">{val}</div>
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
  },
  {
    accessorKey: "vehicleMake",
    header: "Vehicle",
    cell: ({ row }) => {
      const make = row.getValue("vehicleMake") as string;
      const model = row.original.vehicleModel;
      const year = row.original.vehicleYear;
      const vehicleText = `${make} ${model} (${year})`;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate max-w-[200px]">{vehicleText}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{vehicleText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 250,
    minSize: 180,
    maxSize: 250,
  },
  {
    accessorKey: "dealerName",
    header: "Dealer",
    cell: ({ row }) => {
      const dealerName = row.getValue("dealerName") as string | null;
      const displayText = dealerName || "N/A";
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate max-w-[140px]">{displayText}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{displayText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 150,
    minSize: 130,
    maxSize: 180,
  },
  {
    accessorKey: "Actions",
    id: "actions",
    cell: ({ row }) => {
      return <CustomerActionsCell customer={row.original} />;
    },
  },
];

const customerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  vehicleMake: z.string().min(1),
  vehicleModel: z.string().min(1),
  vehicleYear: z.coerce.number().min(1900),
  vin: z.string().optional(),
  registrationNumber: z.string().optional(),
  mileage: z.coerce.number().optional(),
  status: z.string().optional(),
});
type CustomerEditValues = z.infer<typeof customerSchema>;

function CustomerActionsCell({ customer }: { customer: CustomerRow }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CustomerEditValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || "",
      vehicleMake: customer.vehicleMake,
      vehicleModel: customer.vehicleModel,
      vehicleYear: customer.vehicleYear,
      vin: customer.vin || "",
      registrationNumber: customer.registrationNumber || "",
      mileage: customer.mileage,
      status: undefined,
    },
  });

  async function onSubmit(values: CustomerEditValues) {
    startTransition(async () => {
      const res = await updateCustomer(customer.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        vehicleMake: values.vehicleMake,
        vehicleModel: values.vehicleModel,
        vehicleYear: values.vehicleYear,
        vin: values.vin,
        registrationNumber: values.registrationNumber,
        mileage: values.mileage,
        status: values.status,
      });
      if (res.status) {
        toast.success("Customer updated");
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to update customer");
      }
    });
  }

  return (
    <div className="flex items-center ">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/super-admin/customers/view/${customer.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View Customer</p>
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
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input {...form.register("firstName")} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input {...form.register("lastName")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...form.register("email")} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...form.register("phone")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input {...form.register("address")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Vehicle Make</Label>
                <Input {...form.register("vehicleMake")} />
              </div>
              <div className="space-y-2">
                <Label>Vehicle Model</Label>
                <Input {...form.register("vehicleModel")} />
              </div>
              <div className="space-y-2">
                <Label>Vehicle Year</Label>
                <Input type="number" {...form.register("vehicleYear")} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>VIN</Label>
                <Input {...form.register("vin")} />
              </div>
              <div className="space-y-2">
                <Label>Registration #</Label>
                <Input {...form.register("registrationNumber")} />
              </div>
              <div className="space-y-2">
                <Label>Mileage</Label>
                <Input type="number" {...form.register("mileage")} />
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
