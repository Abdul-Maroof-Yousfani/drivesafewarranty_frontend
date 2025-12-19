"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getCustomers } from "@/lib/actions/customer";
import { getWarrantyPackagesAction } from "@/lib/actions/warranty-package";
import { createDealerWarrantySaleAction } from "@/lib/actions/dealer-warranty-sales";

const dealerSaleSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  warrantyPackageId: z.string().min(1, "Please select a package"),
  price: z.coerce.number().min(0, "Price must be a non‑negative number"),
});

type DealerSaleFormValues = z.infer<typeof dealerSaleSchema>;

export default function DealerCreateWarrantySalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [pkg, setPkg] = useState<any | null>(null);

  const form = useForm<DealerSaleFormValues>({
    resolver: zodResolver(dealerSaleSchema),
    defaultValues: {
      customerId: "",
      warrantyPackageId: "",
      price: 0,
    },
  });

  // Load customers (from dealer tenant DB) and preselect package from query
  useEffect(() => {
    (async () => {
      try {
        const [customersRes, packagesRes] = await Promise.all([
          getCustomers(),
          getWarrantyPackagesAction(),
        ]);

        if (customersRes.status && customersRes.data) {
          setCustomers(customersRes.data);
        }

        const packageId = searchParams.get("packageId");
        if (
          packagesRes.status &&
          Array.isArray(packagesRes.data) &&
          packageId
        ) {
          const found = packagesRes.data.find((p: any) => p.id === packageId);
          if (found) {
            setPkg(found);
            form.setValue("warrantyPackageId", found.id);
            if (found.price12Months != null) {
              form.setValue("price", Number(found.price12Months));
            } else if (found.price != null) {
              form.setValue("price", Number(found.price));
            }
          }
        }
      } catch (e) {
        console.error("Failed to load data for dealer sale", e);
      }
    })();
  }, [form, searchParams]);

  const onSubmit = async (data: DealerSaleFormValues) => {
    setLoading(true);
    try {
      const res = await createDealerWarrantySaleAction({
        customerId: data.customerId,
        warrantyPackageId: data.warrantyPackageId,
        price: data.price,
      });
      if (res.status) {
        router.push("/dealer/warranty-sales/list");
      } else {
        console.error("Create sale failed:", res.message);
      }
    } catch (error) {
      console.error("Error creating dealer warranty sale:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Assign Warranty Package to Customer
        </h1>
        <p className="text-muted-foreground mt-2">
          Select one of your customers and set the final price for this warranty
          package.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {pkg ? (
            <>
              <p>
                <span className="font-medium">Name:</span> {pkg.name}
              </p>
              {pkg.durationValue && pkg.durationUnit && (
                <p>
                  <span className="font-medium">Duration:</span>{" "}
                  {pkg.durationValue}{" "}
                  {pkg.durationUnit === "years" ? "Year" : "Month"}
                  {pkg.durationValue > 1 ? "s" : ""}
                </p>
              )}
              {pkg.price != null && (
                <p>
                  <span className="font-medium">Suggested/Base Price:</span> $
                  {pkg.price}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">
              No package selected. Please go back to the package list and choose
              "Assign" from there.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>
            Choose a customer and final price for this assignment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="warrantyPackageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selected Package</FormLabel>
                    <FormControl>
                      <Input
                        readOnly
                        value={pkg ? pkg.name : "No package selected"}
                        className="bg-muted/40"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} — {c.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter customer price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={loading || !pkg}>
                  {loading ? "Assigning..." : "Assign Package"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
