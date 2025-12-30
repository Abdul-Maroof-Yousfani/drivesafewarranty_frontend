"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  updateWarrantySaleAction,
  WarrantySale,
} from "@/lib/actions/warranty-sales";
import { toast } from "sonner";

const schema = z
  .object({
    salesRepresentativeName: z.string().optional(),
    warrantyPrice: z.coerce.number().min(0, "Price must be non-negative"),
    paymentMethod: z.string().min(1, "Payment method is required"),
    coverageStartDate: z.string().min(1, "Start date is required"),
    coverageEndDate: z.string().min(1, "End date is required"),
    status: z.enum(["active", "inactive"]),
  })
  .refine(
    (data) => {
      const start = data.coverageStartDate
        ? new Date(data.coverageStartDate)
        : null;
      const end = data.coverageEndDate ? new Date(data.coverageEndDate) : null;
      if (!start || !end) return true;
      return end >= start;
    },
    {
      message: "End date must be on/after start date",
      path: ["coverageEndDate"],
    }
  );

type FormValues = z.infer<typeof schema>;

export function WarrantySaleEditForm({ sale }: { sale: WarrantySale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      salesRepresentativeName: (sale as any).salesRepresentativeName || "",
      warrantyPrice: Number(sale.warrantyPrice) || 0,
      paymentMethod: sale.paymentMethod || "cash",
      coverageStartDate: sale.coverageStartDate
        ? new Date(sale.coverageStartDate).toISOString().split("T")[0]
        : "",
      coverageEndDate: sale.coverageEndDate
        ? new Date(sale.coverageEndDate).toISOString().split("T")[0]
        : "",
      status: (sale.status === "active" || sale.status === "inactive"
        ? sale.status
        : "active") as "active" | "inactive",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = await updateWarrantySaleAction(sale.id, {
        ...values,
      });
      if (res.status) {
        toast.success("Warranty sale updated");
        const redirectTab = sale.dealer ? "dealer" : "customer";
        router.push(`/super-admin/warranty-sales/list?tab=${redirectTab}`);
      } else {
        toast.error(res.message || "Failed to update");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="salesRepresentativeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sales Representative</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
       <FormField 
  control={form.control}
  name="warrantyPrice"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Price</FormLabel>
      <FormControl>
        <Input
          type="number"
          step="0.01"
          min="0"
          disabled
          {...field}
          onChange={(e) => field.onChange(e.target.valueAsNumber)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
    
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                   
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="coverageStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coverage Start</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="coverageEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coverage End</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/super-admin/warranty-sales/list")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
