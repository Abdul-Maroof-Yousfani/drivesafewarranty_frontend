"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getCustomers } from "@/lib/actions/customer";
import { getDealers } from "@/lib/actions/dealer";
import {
  getWarrantyPackagesAction,
  assignWarrantyPackageToDealer,
} from "@/lib/actions/warranty-package";
import { createMasterWarrantySaleAction } from "@/lib/actions/warranty-sales";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const warrantySaleSchema = z.object({
  assignTo: z.enum(["customer", "dealer"], {
    required_error: "Please select who you are assigning the package to",
  }),
  customerId: z.string().optional(),
  dealerId: z.string().optional(),
  warrantyPackageId: z.string().min(1, "Please select a warranty package"),
  price: z.coerce.number().min(0, "Price must be a non‑negative number"),
  duration: z.coerce.number().min(1, "Duration is required"),
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
      duration: 12, // Default to 12 months
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

  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    setSelectedPackage(pkg || null);
    form.setValue("warrantyPackageId", packageId);

    if (pkg) {
      // Auto-select 12 months if available, or whatever is available
      if (pkg.price12Months != null) {
        form.setValue("duration", 12);
        form.setValue("price", Number(pkg.price12Months));
      } else if (pkg.price24Months != null) {
        form.setValue("duration", 24);
        form.setValue("price", Number(pkg.price24Months));
      } else if (pkg.price36Months != null) {
        form.setValue("duration", 36);
        form.setValue("price", Number(pkg.price36Months));
      } else if (pkg.price != null) {
        // Fallback for flat price packages
        form.setValue("price", Number(pkg.price));
        // Default duration if not specified? 
        form.setValue("duration", pkg.coverageDuration ? pkg.coverageDuration / 30 / 24 / 60 / 60 / 1000 : 12); // Approximate or default
      }
    }
  };

  const handleDurationSelect = (duration: number) => {
    form.setValue("duration", duration);
    if (selectedPackage) {
      if (duration === 12 && selectedPackage.price12Months != null) {
        form.setValue("price", Number(selectedPackage.price12Months));
      } else if (duration === 24 && selectedPackage.price24Months != null) {
        form.setValue("price", Number(selectedPackage.price24Months));
      } else if (duration === 36 && selectedPackage.price36Months != null) {
        form.setValue("price", Number(selectedPackage.price36Months));
      }
    }
  };

  const onSubmit = async (data: WarrantySaleFormValues) => {
    setLoading(true);
    try {
      if (data.assignTo === "dealer") {
        if (!data.dealerId) {
          toast.error("Please select a dealer");
          setLoading(false);
          return;
        }
        // For dealer assignment, we might not strictly need duration if it copies the whole package,
        // but passing price is supported.
        const result = await assignWarrantyPackageToDealer({
          dealerId: data.dealerId,
          warrantyPackageId: data.warrantyPackageId,
          price: data.price,
          duration: data.duration,
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
          duration: data.duration,
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
                Choose which warranty package to assign and set the price.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="warrantyPackageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Package</FormLabel>
                    <Select
                      onValueChange={handlePackageChange}
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
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedPackage && (
                <div className="space-y-4 rounded-md border p-4 bg-muted/20">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <FormLabel>Excess (£)</FormLabel>
                        <Input 
                          readOnly 
                          value={selectedPackage.excess ? selectedPackage.excess : "0"} 
                          className="bg-background text-muted-foreground"
                        />
                     </div>
                     <div className="space-y-2">
                        <FormLabel>Fixed Claim Limit (£)</FormLabel>
                        <Input 
                          readOnly 
                          value={selectedPackage.fixedClaimLimit ? selectedPackage.fixedClaimLimit : "0"} 
                          className="bg-background text-muted-foreground"
                        />
                     </div>
                  </div>

                  <FormLabel className="text-base pt-2 block">Select Duration & Price</FormLabel>
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={(val) => handleDurationSelect(Number(val))}
                            defaultValue={String(field.value)}
                            className="flex flex-col space-y-1"
                          >
                            {selectedPackage.price12Months != null && (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="12" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  12 Months — {formatCurrency(selectedPackage.price12Months)}
                                </FormLabel>
                              </FormItem>
                            )}
                            {selectedPackage.price24Months != null && (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="24" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  24 Months — {formatCurrency(selectedPackage.price24Months)}
                                </FormLabel>
                              </FormItem>
                            )}
                            {selectedPackage.price36Months != null && (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="36" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  36 Months — {formatCurrency(selectedPackage.price36Months)}
                                </FormLabel>
                              </FormItem>
                            )}
                            
                            {/* Fallback for packages without tiered pricing */}
                            {!selectedPackage.price12Months && 
                             !selectedPackage.price24Months && 
                             !selectedPackage.price36Months && (
                               <div className="text-sm text-muted-foreground">
                                 Standard Duration ({(selectedPackage.coverageDuration || 12)} Months)
                               </div>
                             )}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Price (£)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter final price"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can override the calculated price if needed.
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
