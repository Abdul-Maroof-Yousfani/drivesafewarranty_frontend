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
  assignTo: z.enum(["customer", "dealer"]),
  customerId: z.string().optional(),
  dealerId: z.string().optional(),
  warrantyPackageId: z.string().min(1, "Please select a warranty package"),
  price: z.coerce.number().min(0, "Price must be a non‑negative number").max(50000, "Price is too high"),
  duration: z.coerce.number().min(1, "Duration is required").max(120, "Duration is too long"),
  excess: z.coerce
    .number()
    .min(0, "Excess must be a non‑negative number")
    .nullable()
    .optional(),
  labourRatePerHour: z.coerce
    .number()
    .min(0, "Labour rate must be a non‑negative number")
    .nullable()
    .optional(),
  fixedClaimLimit: z.coerce
    .number()
    .min(0, "Fixed claim limit must be a non‑negative number")
    .nullable()
    .optional(),
  // Fixed customer prices (read-only, from package)
  price12Months: z.coerce.number().min(0).nullable().optional(),
  price24Months: z.coerce.number().min(0).nullable().optional(),
  price36Months: z.coerce.number().min(0).nullable().optional(),
  dealerPrice12Months: z.coerce.number().min(0).nullable().optional(),
  dealerPrice24Months: z.coerce.number().min(0).nullable().optional(),
  dealerPrice36Months: z.coerce.number().min(0).nullable().optional(),
  // New fields for Direct Sale
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "finance"]),
  customerConsent: z.boolean().refine(val => val === true, {
    message: "Customer consent is required for direct sale",
  }),
  mileageAtSale: z.coerce.number().min(0, "Mileage must be non-negative").max(500000, "Mileage is too high").nullable().optional(),
  coverageStartDate: z.string().min(1, "Coverage start date is required"),
  vehicleId: z.string().optional(),
}).refine(data => {
  if (data.assignTo === "customer") return !!data.customerId;
  return true;
}, {
  message: "Please select a customer",
  path: ["customerId"]
}).refine(data => {
  if (data.assignTo === "dealer") return !!data.dealerId;
  return true;
}, {
  message: "Please select a dealer",
  path: ["dealerId"]
}).refine(data => {
  if (data.assignTo === "customer") return !!data.vehicleId;
  return true;
}, {
  message: "Please select a vehicle",
  path: ["vehicleId"]
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
    resolver: zodResolver(warrantySaleSchema) as any,
    defaultValues: {
      assignTo: "customer",
      customerId: "",
      dealerId: "",
      warrantyPackageId: "",
      price: 0,
      duration: 12, // Default to 12 months
      excess: null,
      labourRatePerHour: null,
      fixedClaimLimit: null,
      price12Months: null,
      price24Months: null,
      price36Months: null,
      dealerPrice12Months: null,
      dealerPrice24Months: null,
      dealerPrice36Months: null,
      paymentMethod: "cash",
      customerConsent: false,
      mileageAtSale: null,
      coverageStartDate: new Date().toISOString().split('T')[0],
      vehicleId: "",
    },
  });

  const selectedCustomerId = form.watch("customerId");
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const assignType = form.watch("assignTo");
  const duration = form.watch("duration");

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
      form.setValue("excess", pkg.excess != null ? Number(pkg.excess) : 0);
      form.setValue(
        "labourRatePerHour",
        pkg.labourRatePerHour != null ? Number(pkg.labourRatePerHour) : 0
      );
      form.setValue(
        "fixedClaimLimit",
        pkg.fixedClaimLimit != null ? Number(pkg.fixedClaimLimit) : 0
      );
      form.setValue(
        "price12Months",
        pkg.price12Months != null ? Number(pkg.price12Months) : null
      );
      form.setValue(
        "price24Months",
        pkg.price24Months != null ? Number(pkg.price24Months) : null
      );
      form.setValue(
        "price36Months",
        pkg.price36Months != null ? Number(pkg.price36Months) : null
      );
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
        form.setValue(
          "duration",
          pkg.coverageDuration
            ? pkg.coverageDuration / 30 / 24 / 60 / 60 / 1000
            : 12
        ); // Approximate or default
      }
    }
  };

  const handleDurationSelect = (duration: number) => {
    form.setValue("duration", duration);

    const p12 = form.getValues("price12Months");
    const p24 = form.getValues("price24Months");
    const p36 = form.getValues("price36Months");

    if (duration === 12 && p12 != null) {
      form.setValue("price", Number(Number(p12).toFixed(2)));
    } else if (duration === 24 && p24 != null) {
      form.setValue("price", Number(Number(p24).toFixed(2)));
    } else if (duration === 36 && p36 != null) {
      form.setValue("price", Number(Number(p36).toFixed(2)));
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
        const result = await assignWarrantyPackageToDealer({
          dealerId: data.dealerId,
          warrantyPackageId: data.warrantyPackageId,
          duration: data.duration,
          // Package operational settings
          excess: data.excess ?? null,
          labourRatePerHour: data.labourRatePerHour ?? null,
          fixedClaimLimit: data.fixedClaimLimit ?? null,
          // Dealer internal prices (cost to dealer - editable by SA)
          dealerPrice12Months: data.dealerPrice12Months ?? null,
          dealerPrice24Months: data.dealerPrice24Months ?? null,
          dealerPrice36Months: data.dealerPrice36Months ?? null,
          // Note: Customer prices are fixed from master package, not sent
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
          excess: data.excess ?? null,
          labourRatePerHour: data.labourRatePerHour ?? null,
          fixedClaimLimit: data.fixedClaimLimit ?? null,
          price12Months: data.price12Months ?? null,
          price24Months: data.price24Months ?? null,
          price36Months: data.price36Months ?? null,
          paymentMethod: data.paymentMethod,
          customerConsent: data.customerConsent,
          mileageAtSale: data.mileageAtSale,
          coverageStartDate: data.coverageStartDate,
          vehicleId: data.vehicleId,
        });
        if (result.status) {
          toast.success("Warranty package assigned to customer successfully");
        } else {
          toast.error(result.message || "Failed to assign package to customer");
          setLoading(false);
          return;
        }
      }

      const redirectTab = data.assignTo === "customer" ? "customer" : "dealer";
      router.push(`/super-admin/warranty-sales/list?tab=${redirectTab}`);
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
                            Sell to Customer
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
                Choose the specific customer or dealer who will receive this
                warranty package.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.watch("assignTo") === "customer" ? (
                <>
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

                  {selectedCustomer && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 && (
                    <FormField
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue>
                                  {form.watch("vehicleId") 
                                    ? selectedCustomer.vehicles.find((v: any) => v.id === form.watch("vehicleId"))?.make + " " + selectedCustomer.vehicles.find((v: any) => v.id === form.watch("vehicleId"))?.model
                                    : "Select vehicle"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedCustomer.vehicles.map((v: any) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.make} {v.model} ({v.registrationNumber || v.vin || v.year})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="excess"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Excess (£)
                            <span className="text-xs text-muted-foreground ml-1">(Fixed)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="Enter excess"
                              disabled
                              readOnly
                              className="bg-muted"
                              {...field}
                              value={
                                field.value === null ||
                                  field.value === undefined
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="labourRatePerHour"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Labour Rate (£/hr)
                            <span className="text-xs text-muted-foreground ml-1">(Fixed)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="Enter labour rate"
                              disabled
                              readOnly
                              className="bg-muted"
                              {...field}
                              value={
                                field.value === null ||
                                  field.value === undefined
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fixedClaimLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Fixed Claim Limit (£)
                            <span className="text-xs text-muted-foreground ml-1">(Fixed)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="Enter claim limit"
                              disabled
                              readOnly
                              className="bg-muted"
                              {...field}
                              value={
                                field.value === null ||
                                  field.value === undefined
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Customer Prices - Read-only when assigning to dealer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <FormField
                      control={form.control}
                      name="price12Months"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            12‑Month Customer Price (£)
                            <span className="text-xs text-muted-foreground ml-1">(Fixed)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="Enter 12‑month price"
                              disabled
                              readOnly
                              className="bg-muted"
                              {...field}
                              value={
                                field.value === null ||
                                  field.value === undefined
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price24Months"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            24‑Month Customer Price (£)
                            <span className="text-xs text-muted-foreground ml-1">(Fixed)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="Enter 24‑month price"
                              disabled
                              readOnly
                              className="bg-muted"
                              {...field}
                              value={
                                field.value === null ||
                                  field.value === undefined
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price36Months"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            36‑Month Customer Price (£)
                            <span className="text-xs text-muted-foreground ml-1">(Fixed)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="Enter 36‑month price"
                              disabled
                              readOnly
                              className="bg-muted"
                              {...field}
                              value={
                                field.value === null ||
                                  field.value === undefined
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dealer Internal Prices - Only shown when assigning to dealer */}
                  {assignType === "dealer" && (
                    <div className="space-y-4 pt-4 border-t mt-4">
                      <div>
                        <h4 className="font-medium text-sm">Dealer Internal Pricing (Cost to Dealer)</h4>
                        <p className="text-xs text-muted-foreground">
                          Set the amount the dealer pays for this package. This is their cost, not the customer price.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="dealerPrice12Months"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>12‑Month Dealer Cost (£)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  placeholder="Enter dealer cost"
                                  {...field}
                                  value={
                                    field.value === null ||
                                      field.value === undefined
                                      ? ""
                                      : field.value
                                  }
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              {selectedPackage?.price12Months != null && field.value != null && (
                                <p className="text-xs text-green-600">
                                  Margin: {formatCurrency(Number(selectedPackage.price12Months) - Number(field.value))}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dealerPrice24Months"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>24‑Month Dealer Cost (£)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  placeholder="Enter dealer cost"
                                  {...field}
                                  value={
                                    field.value === null ||
                                      field.value === undefined
                                      ? ""
                                      : field.value
                                  }
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              {selectedPackage?.price24Months != null && field.value != null && (
                                <p className="text-xs text-green-600">
                                  Margin: {formatCurrency(Number(selectedPackage.price24Months) - Number(field.value))}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dealerPrice36Months"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>36‑Month Dealer Cost (£)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  placeholder="Enter dealer cost"
                                  {...field}
                                  value={
                                    field.value === null ||
                                      field.value === undefined
                                      ? ""
                                      : field.value
                                  }
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                              {selectedPackage?.price36Months != null && field.value != null && (
                                <p className="text-xs text-green-600">
                                  Margin: {formatCurrency(Number(selectedPackage.price36Months) - Number(field.value))}
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {assignType === "customer" && (
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={(val) =>
                                handleDurationSelect(Number(val))
                              }
                              defaultValue={String(field.value)}
                              className="flex flex-col space-y-1"
                            >
                              {selectedPackage &&
                                selectedPackage.price12Months != null && (
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="12" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      12 Months —{" "}
                                      {formatCurrency(
                                        selectedPackage.price12Months
                                      )}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              {selectedPackage &&
                                selectedPackage.price24Months != null && (
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="24" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      24 Months —{" "}
                                      {formatCurrency(
                                        selectedPackage.price24Months
                                      )}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              {selectedPackage &&
                                selectedPackage.price36Months != null && (
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="36" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      36 Months —{" "}
                                      {formatCurrency(
                                        selectedPackage.price36Months
                                      )}
                                    </FormLabel>
                                  </FormItem>
                                )}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {assignType === "customer" && (
                    <div className="space-y-4 pt-4 border-t mt-4">
                      <h4 className="font-medium text-sm">Sale Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="card">Card</SelectItem>
                                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="coverageStartDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coverage Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mileageAtSale"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mileage at Sale</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter current mileage"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={e => field.onChange(e.target.valueAsNumber)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerConsent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md col-span-1 md:col-span-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Customer Agreement & Acceptance of Terms
                                </FormLabel>
                                <FormDescription>
                                  I confirm that the customer has read and agreed to the terms and conditions.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
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
    </div >
  );
}
