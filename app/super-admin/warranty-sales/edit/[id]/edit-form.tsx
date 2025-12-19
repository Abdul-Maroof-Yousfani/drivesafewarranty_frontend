"use client";

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
import { updateWarrantySaleAction, WarrantySale } from "@/lib/actions/warranty-sales";
import { toast } from "sonner";

const schema = z.object({
  salesRepresentativeName: z.string().optional(),
  warrantyPrice: z.coerce.number().min(0, "Price must be non-negative"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  coverageStartDate: z.coerce.date(),
  coverageEndDate: z.coerce.date(),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof schema>;

export function WarrantySaleEditForm({ sale }: { sale: WarrantySale & { coverageStartDate: string; coverageEndDate: string } }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      salesRepresentativeName: sale.salesRepresentativeName || "",
      warrantyPrice: Number(sale.warrantyPrice),
      paymentMethod: sale.paymentMethod || "cash",
      coverageStartDate: new Date(sale.coverageStartDate),
      coverageEndDate: new Date(sale.coverageEndDate),
      status: sale.status || "active",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = await updateWarrantySaleAction(sale.id, {
        ...values,
        coverageStartDate: values.coverageStartDate.toISOString(),
        coverageEndDate: values.coverageEndDate.toISOString(),
      });
      if (res.status) {
        toast.success("Warranty sale updated");
      } else {
        toast.error(res.message || "Failed to update");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Input type="number" step="0.01" min="0" {...field} />
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
                    <SelectItem value="dealer_assignment">Dealer Assignment</SelectItem>
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
                  <DatePicker date={field.value} setDate={field.onChange} />
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
                  <DatePicker date={field.value} setDate={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
