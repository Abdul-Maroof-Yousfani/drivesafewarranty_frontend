"use client";

import { useState, useEffect, useRef } from "react";
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
import { Autocomplete } from "@/components/ui/autocomplete";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getCustomers } from "@/lib/actions/customer";
import { getDealers } from "@/lib/actions/dealer";
import {
  getWarrantyPackagesAction,
  assignWarrantyPackageToDealer,
} from "@/lib/actions/warranty-package";
import { getWarrantyItemsAction } from "@/lib/actions/warranty-item";
import { Customer } from "@/lib/actions/customer";
import { WarrantyPackage } from "@/lib/actions/warranty-package";
import { createMasterWarrantySaleAction } from "@/lib/actions/warranty-sales";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const warrantySaleSchema = z
  .object({
    assignTo: z.enum(["customer", "dealer"]),
    customerId: z.string().optional(),
    dealerId: z.string().optional(),
    warrantyPackageId: z.string().min(1, "Please select a warranty package"),
    price: z.coerce
      .number()
      .min(0, "Price must be a non‑negative number")
      .max(50000, "Price is too high"),
    duration: z.coerce
      .number()
      .min(1, "Duration is required")
      .max(120, "Duration is too long"),
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
    customerConsent: z.boolean(),
    mileageAtSale: z.coerce
      .number()
      .min(0, "Mileage must be non-negative")
      .max(1000000, "Mileage is too high")
      .nullable()
      .optional(),
    coverageStartDate: z.string().min(1, "Coverage start date is required"),
    vehicleId: z.string().optional(),
    includedBenefits: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      if (data.assignTo === "customer") return !!data.customerId;
      return true;
    },
    {
      message: "Please select a customer",
      path: ["customerId"],
    }
  )
  .refine(
    (data) => {
      if (data.assignTo === "dealer") return !!data.dealerId;
      return true;
    },
    {
      message: "Please select a dealer",
      path: ["dealerId"],
    }
  )
  .refine(
    (data) => {
      if (data.assignTo === "customer") return data.customerConsent === true;
      return true;
    },
    {
      message: "Customer consent is required for direct sale",
      path: ["customerConsent"],
    }
  );

type WarrantySaleFormValues = z.infer<typeof warrantySaleSchema>;

function normalizeToastMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as any).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.filter(Boolean).join(", ");
  }
  return undefined;
}

export default function CreateWarrantySalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [packages, setPackages] = useState<WarrantyPackage[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<WarrantyPackage | null>(null);
  const [warrantyItems, setWarrantyItems] = useState<
    { id: string; label: string; type: string }[]
  >([]);
  const hasAppliedQueryDefaultsRef = useRef(false);

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
      coverageStartDate: new Date().toISOString().split("T")[0],
      vehicleId: "",
      includedBenefits: [],
    },
  });

  const selectedCustomerId = form.watch("customerId");
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const availableVehicles = selectedCustomer?.vehicles || [];
  const selectedVehicle = availableVehicles.find(
    (v) => v.id === form.watch("vehicleId")
  );

  const assignType = form.watch("assignTo");
  const [eligibilityStatus, setEligibilityStatus] = useState<{
    eligible: boolean;
    messages: string[];
  } | null>(null);

  useEffect(() => {
    if (selectedPackage && selectedVehicle) {
      const messages: string[] = [];
      let eligible = true;

      if (
        selectedPackage.eligibilityMileageValue !== null &&
        selectedPackage.eligibilityMileageValue !== undefined &&
        selectedVehicle.mileage !== undefined &&
        selectedVehicle.mileage !== null
      ) {
        if (selectedPackage.eligibilityMileageComparator === "lt") {
          if (
            selectedVehicle.mileage >= selectedPackage.eligibilityMileageValue
          ) {
            eligible = false;
            messages.push(
              `Vehicle mileage (${selectedVehicle.mileage}) exceeds limit (${selectedPackage.eligibilityMileageValue})`
            );
          }
        } else if (selectedPackage.eligibilityMileageComparator === "gt") {
          if (
            selectedVehicle.mileage <= selectedPackage.eligibilityMileageValue
          ) {
            eligible = false;
            messages.push(
              `Vehicle mileage (${selectedVehicle.mileage}) is below required (${selectedPackage.eligibilityMileageValue})`
            );
          }
        }
      }

      if (
        selectedPackage.eligibilityVehicleAgeYearsMax !== null &&
        selectedPackage.eligibilityVehicleAgeYearsMax !== undefined &&
        selectedVehicle.year
      ) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - selectedVehicle.year;
        if (age > selectedPackage.eligibilityVehicleAgeYearsMax) {
          eligible = false;
          messages.push(
            `Vehicle age (${age} years) exceeds limit (${selectedPackage.eligibilityVehicleAgeYearsMax} years)`
          );
        }
      }

      if (
        selectedPackage.eligibilityTransmission &&
        selectedVehicle.transmission
      ) {
        const packageTransmission = String(
          selectedPackage.eligibilityTransmission
        );
        if (
          packageTransmission.toLowerCase() !==
          String(selectedVehicle.transmission || "").toLowerCase()
        ) {
          eligible = false;
          messages.push(
            `Vehicle transmission (${selectedVehicle.transmission}) does not match package (${selectedPackage.eligibilityTransmission})`
          );
        }
      }

      setEligibilityStatus({ eligible, messages });
    } else {
      setEligibilityStatus(null);
    }
  }, [selectedPackage, selectedVehicle]);

  useEffect(() => {
    (async () => {
      try {
        const [customersRes, dealersRes, packagesRes, itemsRes] =
          await Promise.all([
            getCustomers(),
            getDealers(),
            getWarrantyPackagesAction(),
            getWarrantyItemsAction(),
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
        if (itemsRes.status && itemsRes.data) {
          setWarrantyItems(itemsRes.data);
        }
      } catch (e) {
        console.error("Failed to load assignment data", e);
      }
    })();
  }, []);

  useEffect(() => {
    const queryCustomerId = searchParams.get("customerId");
    const queryDealerId = searchParams.get("dealerId");
    const queryPackageId =
      searchParams.get("packageId") || searchParams.get("warrantyPackageId");

    const needsPackage = !!queryPackageId;
    const matchedPackage = queryPackageId
      ? packages.find((p) => p.id === queryPackageId)
      : null;
    const packagesLoaded = packages.length > 0;

    if (hasAppliedQueryDefaultsRef.current) return;
    if (!queryCustomerId && !queryDealerId && !queryPackageId) {
      hasAppliedQueryDefaultsRef.current = true;
      return;
    }

    if (queryDealerId) {
      form.setValue("assignTo", "dealer");
      form.setValue("dealerId", queryDealerId);
      form.setValue("customerId", "");
      form.setValue("vehicleId", "");
    } else if (queryCustomerId) {
      form.setValue("assignTo", "customer");
      form.setValue("customerId", queryCustomerId);
      form.setValue("dealerId", "");
    }

    if (matchedPackage) {
      if (queryPackageId) handlePackageChange(queryPackageId);
    }

    if (!needsPackage || (packagesLoaded && dealers.length > 0)) {
      hasAppliedQueryDefaultsRef.current = true;
    }
  }, [form, packages, dealers, searchParams]);

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
      }
      const defaultBenefitIds = Array.isArray(pkg.items)
        ? pkg.items
            .filter((it) => it.type === "benefit")
            .map((it) => it.warrantyItem.id)
        : [];
      form.setValue("includedBenefits", defaultBenefitIds);
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
          ...(data.excess != null ? { excess: data.excess } : {}),
          ...(data.labourRatePerHour != null
            ? { labourRatePerHour: data.labourRatePerHour }
            : {}),
          ...(data.fixedClaimLimit != null
            ? { fixedClaimLimit: data.fixedClaimLimit }
            : {}),
          // Dealer internal prices (cost to dealer - SA can set these)
          ...(data.dealerPrice12Months != null
            ? { dealerPrice12Months: data.dealerPrice12Months }
            : {}),
          ...(data.dealerPrice24Months != null
            ? { dealerPrice24Months: data.dealerPrice24Months }
            : {}),
          ...(data.dealerPrice36Months != null
            ? { dealerPrice36Months: data.dealerPrice36Months }
            : {}),
          ...(Array.isArray(data.includedBenefits) &&
          data.includedBenefits.length > 0
            ? { includedBenefits: data.includedBenefits }
            : {}),
          // Note: Customer prices are fixed from master package, not sent
        });
        if (result.status) {
          toast.success(
            result.message || "Warranty package assigned to dealer successfully"
          );
        } else {
          toast.error(
            normalizeToastMessage(result.message) ||
              "Failed to assign package to dealer"
          );
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
          ...(data.excess != null ? { excess: data.excess } : {}),
          ...(data.labourRatePerHour != null
            ? { labourRatePerHour: data.labourRatePerHour }
            : {}),
          ...(data.fixedClaimLimit != null
            ? { fixedClaimLimit: data.fixedClaimLimit }
            : {}),
          ...(data.price12Months != null
            ? { price12Months: data.price12Months }
            : {}),
          ...(data.price24Months != null
            ? { price24Months: data.price24Months }
            : {}),
          ...(data.price36Months != null
            ? { price36Months: data.price36Months }
            : {}),
          ...(data.paymentMethod ? { paymentMethod: data.paymentMethod } : {}),
          ...(data.customerConsent
            ? { customerConsent: data.customerConsent }
            : {}),
          ...(data.mileageAtSale != null
            ? { mileageAtSale: data.mileageAtSale }
            : {}),
          ...(data.coverageStartDate
            ? { coverageStartDate: data.coverageStartDate }
            : {}),
          ...(data.vehicleId ? { vehicleId: data.vehicleId } : {}),
          ...(Array.isArray(data.includedBenefits) &&
          data.includedBenefits.length > 0
            ? { includedBenefits: data.includedBenefits }
            : {}),
        });
        if (result.status) {
          toast.success("Warranty package assigned to customer successfully");
        } else {
          toast.error(
            normalizeToastMessage(result.message) ||
              "Failed to assign package to customer"
          );
          setLoading(false);
          return;
        }
      }

      const redirectPath =
        data.assignTo === "customer"
          ? "/super-admin/warranty-sales/list?tab=customer"
          : `/super-admin/dealers/assigned-warranties?dealerId=${data.dealerId}`;
      router.push(redirectPath);
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
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) =>
            console.error("Form Validation Errors:", errors)
          )}
          className="space-y-6"
        >
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
                        value={field.value}
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
                        <FormControl>
                          <Autocomplete
                            options={customers.map((c) => ({
                              value: c.id,
                              label: `${c.firstName} ${c.lastName} — ${c.email}`,
                            }))}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select customer"
                            searchPlaceholder="Search customer by name or email..."
                          />
                        </FormControl>
                        <FormDescription>
                          Only existing customers are shown here.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedCustomer &&
                    selectedCustomer.vehicles &&
                    selectedCustomer.vehicles.length > 0 && (
                      <FormField
                        control={form.control}
                        name="vehicleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue>
                                    {selectedVehicle
                                      ? `${selectedVehicle.make} ${selectedVehicle.model}`
                                      : "Select vehicle"}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedCustomer.vehicles?.map((v) => (
                                  <SelectItem key={v.id} value={v.id}>
                                    {v.make} {v.model} (
                                    {v.registrationNumber || v.vin || v.year})
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
                      <FormControl>
                        <Autocomplete
                          options={dealers.map((d) => ({
                            value: d.id,
                            label: `${d.businessNameTrading || d.businessNameLegal} — ${d.email}`,
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select dealer"
                          searchPlaceholder="Search dealer by name or email..."
                        />
                      </FormControl>
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
                    <FormControl>
                      <Autocomplete
                        options={packages.map((p) => ({
                          value: p.id,
                          label: p.name,
                        }))}
                        value={field.value}
                        onValueChange={handlePackageChange}
                        placeholder="Select warranty package"
                        searchPlaceholder="Search warranty package..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {eligibilityStatus && (
                <div
                  className={`rounded-md p-4 border ${
                    eligibilityStatus.eligible
                      ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                      : "bg-destructive/10 border-destructive/20 text-destructive dark:bg-destructive/20 dark:border-destructive/30"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {eligibilityStatus.eligible ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Vehicle is eligible for this package
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        Vehicle is NOT eligible
                      </>
                    )}
                  </div>
                  {!eligibilityStatus.eligible && (
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      {eligibilityStatus.messages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

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
                            <span className="text-xs text-muted-foreground ml-1">
                              (Fixed)
                            </span>
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
                            <span className="text-xs text-muted-foreground ml-1">
                              (Fixed)
                            </span>
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
                            <span className="text-xs text-muted-foreground ml-1">
                              (Fixed)
                            </span>
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
                            <span className="text-xs text-muted-foreground ml-1">
                              (Fixed)
                            </span>
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
                            <span className="text-xs text-muted-foreground ml-1">
                              (Fixed)
                            </span>
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
                            <span className="text-xs text-muted-foreground ml-1">
                              (Fixed)
                            </span>
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
                        <h4 className="font-medium text-sm">
                          Dealer Internal Pricing (Cost to Dealer)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Set the amount the dealer pays for this package. This
                          is their cost, not the customer price.
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
                              {selectedPackage?.price12Months != null &&
                                field.value != null && (
                                  <p className="text-xs text-green-600">
                                    Margin:{" "}
                                    {formatCurrency(
                                      Number(selectedPackage.price12Months) -
                                        Number(field.value)
                                    )}
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
                              {selectedPackage?.price24Months != null &&
                                field.value != null && (
                                  <p className="text-xs text-green-600">
                                    Margin:{" "}
                                    {formatCurrency(
                                      Number(selectedPackage.price24Months) -
                                        Number(field.value)
                                    )}
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
                              {selectedPackage?.price36Months != null &&
                                field.value != null && (
                                  <p className="text-xs text-green-600">
                                    Margin:{" "}
                                    {formatCurrency(
                                      Number(selectedPackage.price36Months) -
                                        Number(field.value)
                                    )}
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
                              value={String(field.value)}
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
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="card">Card</SelectItem>
                                  <SelectItem value="bank_transfer">
                                    Bank Transfer
                                  </SelectItem>
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
                              <FormLabel>Vehicle Mileage at Sale</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter current mileage"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(e.target.valueAsNumber)
                                  }
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
                                  onChange={(e) =>
                                    field.onChange(e.target.checked)
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Customer Agreement & Acceptance of Terms
                                </FormLabel>
                              </div>
                              <FormMessage />
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
            <Button
              type="submit"
              disabled={loading || eligibilityStatus?.eligible === false}
            >
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
