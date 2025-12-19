"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect } from "react";
import { getCustomers } from "@/lib/actions/customer";
import { getDealers } from "@/lib/actions/dealer";
import {
  getWarrantyPackagesAction,
  assignWarrantyPackageToDealer,
} from "@/lib/actions/warranty-package";
import { createMasterWarrantySaleAction } from "@/lib/actions/warranty-sales";
import { toast } from "sonner";

const warrantySaleSchema = z.object({
  assignTo: z.enum(["customer", "dealer"], {
    required_error: "Please select who you are assigning the package to",
  }),
  customerId: z.string().optional(),
  dealerId: z.string().optional(),
  warrantyPackageId: z.string().min(1, "Please select a warranty package"),
  price: z.coerce.number().min(0, "Price must be a non‑negative number"),
});

type WarrantySaleFormValues = z.infer<typeof warrantySaleSchema>;

export default function CreateWarrantySalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);

  const form = useForm<WarrantySaleFormValues>({
    resolver: zodResolver(warrantySaleSchema),
    defaultValues: {
      assignTo: "customer",
      customerId: "",
      dealerId: "",
      warrantyPackageId: "",
      price: 0,
    },
  });

  // Load customers, dealers and packages for selection
  useEffect(() => {
    (async () => {
      try {
        const [customersRes, dealersRes, packagesRes] = await Promise.all([
          getCustomers(),
          getDealers(),
          getWarrantyPackagesAction(),
        ]);

        if (customersRes.status && customersRes.data) {
          setCustomers(customersRes.data);
        }
        if (dealersRes.status && dealersRes.data) {
          setDealers(dealersRes.data);
        }
        if (packagesRes.status && packagesRes.data) {
          setPackages(packagesRes.data);
        }
      } catch (e) {
        console.error("Failed to load assignment data", e);
      }
    })();
  }, []);

  const onSubmit = async (data: WarrantySaleFormValues) => {
    setLoading(true);
    try {
      if (data.assignTo === "dealer") {
        if (!data.dealerId) {
          toast.error("Please select a dealer");
          setLoading(false);
          return;
        }
        const result = await assignWarrantyPackageToDealer({
          dealerId: data.dealerId,
          warrantyPackageId: data.warrantyPackageId,
          price: data.price,
        });
        if (result.status) {
          toast.success(
            result.message || "Warranty package assigned to dealer successfully"
          );
        } else {
          toast.error(result.message || "Failed to assign package to dealer");
          setLoading(false);
          return;
        }
      } else {
        if (!data.customerId) {
          toast.error("Please select a customer");
          setLoading(false);
          return;
        }
        const result = await createMasterWarrantySaleAction({
          customerId: data.customerId,
          warrantyPackageId: data.warrantyPackageId,
          price: data.price,
        });
        if (result.status) {
          toast.success("Warranty package assigned to customer successfully");
        } else {
          toast.error(result.message || "Failed to assign package to customer");
          setLoading(false);
          return;
        }
      }

      router.push("/super-admin/warranty-sales/list");
    } catch (error) {
      console.error("Error creating warranty sale:", error);
      toast.error("Failed to create warranty assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create Warranty Assignment
        </h1>
        <p className="text-muted-foreground mt-2">
          Assign a warranty package either to a customer or to a dealer.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Who to assign to */}
          <Card>
            <CardHeader>
              <CardTitle>Recipient Type</CardTitle>
              <CardDescription>
                Choose whether you are assigning this warranty package to a
                customer or to a dealer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="assignTo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        className="flex flex-col gap-2 sm:flex-row sm:gap-6"
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="customer" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Assign to Customer
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="dealer" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Assign to Dealer
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Step 2: Select specific customer or dealer */}
          <Card>
            <CardHeader>
              <CardTitle>Select Recipient</CardTitle>
              <CardDescription>
                Choose the specific customer or dealer who will receive this warranty package.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.watch("assignTo") === "customer" ? (
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
                      <FormDescription>
                        Only existing customers are shown here.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="dealerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dealer</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select dealer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dealers.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.businessNameTrading || d.businessNameLegal} —{" "}
                              {d.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select which dealer should receive this package.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Step 3: Select package and price */}
          <Card>
            <CardHeader>
              <CardTitle>Warranty Package</CardTitle>
              <CardDescription>
                Choose which warranty package to assign and set the price (if applicable).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="warrantyPackageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Package</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        const p = packages.find((x) => x.id === val);
                        setSelectedPackage(p || null);
                        if (p?.price12Months != null) {
                          form.setValue("price", Number(p.price12Months));
                        } else if (p?.price != null) {
                          form.setValue("price", Number(p.price));
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warranty package" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {packages.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}{" "}
                            {p.durationValue && p.durationUnit
                              ? `(${p.durationValue} ${p.durationUnit})`
                              : ""}
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
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter price (dealers can override when selling to customers)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      For dealer assignments, this can represent the base or reference price.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Warranty Sale"}
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
    </div>
  );
}
