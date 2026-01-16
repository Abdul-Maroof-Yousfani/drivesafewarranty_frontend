"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Control } from "react-hook-form";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Customer } from "@/lib/actions/customer";
import { WarrantyPackage } from "@/lib/actions/warranty-package";
import { getDealerCustomersAction } from "@/lib/actions/dealer-customer";
import { getDealerWarrantyPackagesAction } from "@/lib/actions/warranty-package";
import { createDealerWarrantySaleAction } from "@/lib/actions/dealer-warranty-sales";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const dealerSaleSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  vehicleId: z.string().min(1, "Please select a vehicle"),
  warrantyPackageId: z.string().min(1, "Please select a package"),
  price: z.coerce
    .number()
    .min(0, "Price must be a non‑negative number")
    .max(50000, "Price is too high"),
  duration: z.coerce
    .number()
    .min(1, "Duration is required")
    .max(120, "Duration is too long"),
  // New fields for package assignment
  excess: z.coerce
    .number()
    .min(0, "Excess must be a non-negative number")
    .nullable(),
  labourRatePerHour: z.coerce
    .number()
    .min(0, "Labour rate must be a non-negative number")
    .nullable(),
  fixedClaimLimit: z.coerce
    .number()
    .min(0, "Fixed claim limit must be a non-negative number")
    .nullable(),
  price12Months: z.coerce.number().min(0).nullable().optional(),
  price24Months: z.coerce.number().min(0).nullable().optional(),
  price36Months: z.coerce.number().min(0).nullable().optional(),
  customerConsent: z.boolean().refine((val) => val === true, {
    message: "Customer consent is required",
  }),
  customerSignature: z.string().optional().nullable(),
  mileageAtSale: z.coerce
    .number()
    .min(0, "Mileage must be non-negative")
    .max(1000000, "Mileage is too high")
    .nullable()
    .optional(),
  salesRepresentativeName: z.string().optional().nullable(),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "finance"]),
  coverageStartDate: z.string().min(1, "Coverage start date is required"),
});

type DealerSaleFormValues = z.infer<typeof dealerSaleSchema>;

// Update FormControlProps to include disabled
type FormControlProps = {
  control: Control<DealerSaleFormValues>;
  name: keyof DealerSaleFormValues;
  label: string;
  placeholder: string;
  type?: string;
  step?: string;
  min?: string | number;
  disabled?: boolean;
};

// Update NumberInputField to use disabled prop
function NumberInputField({
  control,
  name,
  label,
  placeholder,
  type = "number",
  step = "0.01",
  min = "0",
  disabled = false,
}: FormControlProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Convert the value to a string for the input
        const value =
          field.value === null || field.value === undefined
            ? ""
            : field.value.toString();

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type={type}
                step={step}
                min={min}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                className={disabled ? "bg-muted" : ""}
                onChange={(e) => {
                  // Convert empty string to null, otherwise parse as number
                  const newValue =
                    e.target.value === "" ? null : Number(e.target.value);
                  field.onChange(newValue);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export default function DealerCreateWarrantySalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [pkg, setPkg] = useState<any | null>(null);

  const form = useForm<DealerSaleFormValues>({
    // @ts-ignore - The resolver types are complex and not perfectly aligned with the schema
    resolver: zodResolver(dealerSaleSchema) as any,
    defaultValues: {
      customerId: "",
      vehicleId: "",
      warrantyPackageId: "",
      price: 0,
      duration: 12,
      excess: null,
      labourRatePerHour: null,
      fixedClaimLimit: null,
      price12Months: null,
      price24Months: null,
      price36Months: null,
      customerConsent: false,
      customerSignature: "",
      mileageAtSale: null,
      salesRepresentativeName: "",
      paymentMethod: "cash",
      coverageStartDate: new Date().toISOString().split("T")[0], // Default today
    },
  });

  const selectedCustomerId = form.watch("customerId");
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const availableVehicles = selectedCustomer?.vehicles || [];

  const selectedVehicle = availableVehicles.find(
    (v: any) => v.id === form.watch("vehicleId")
  );
  const [eligibilityStatus, setEligibilityStatus] = useState<{
    eligible: boolean;
    messages: string[];
  } | null>(null);

  useEffect(() => {
    if (pkg && selectedVehicle) {
      const messages: string[] = [];
      let eligible = true;

      // Check Mileage
      if (
        pkg.eligibilityMileageValue !== null &&
        pkg.eligibilityMileageValue !== undefined &&
        selectedVehicle.mileage
      ) {
        if (pkg.eligibilityMileageComparator === "lt") {
          if (selectedVehicle.mileage >= pkg.eligibilityMileageValue) {
            eligible = false;
            messages.push(
              `Vehicle mileage (${selectedVehicle.mileage}) exceeds limit (${pkg.eligibilityMileageValue})`
            );
          }
        } else if (pkg.eligibilityMileageComparator === "gt") {
          if (selectedVehicle.mileage <= pkg.eligibilityMileageValue) {
            eligible = false;
            messages.push(
              `Vehicle mileage (${selectedVehicle.mileage}) is below required (${pkg.eligibilityMileageValue})`
            );
          }
        }
      }

      // Check Age
      if (
        pkg.eligibilityVehicleAgeYearsMax !== null &&
        pkg.eligibilityVehicleAgeYearsMax !== undefined &&
        selectedVehicle.year
      ) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - selectedVehicle.year;
        if (age > pkg.eligibilityVehicleAgeYearsMax) {
          eligible = false;
          messages.push(
            `Vehicle age (${age} years) exceeds limit (${pkg.eligibilityVehicleAgeYearsMax} years)`
          );
        }
      }

      // Check Transmission
      if (pkg.eligibilityTransmission && selectedVehicle.transmission) {
        if (
          pkg.eligibilityTransmission !== "any" &&
          pkg.eligibilityTransmission.toLowerCase() !==
            selectedVehicle.transmission.toLowerCase()
        ) {
          eligible = false;
          messages.push(
            `Vehicle transmission (${selectedVehicle.transmission}) does not match package (${pkg.eligibilityTransmission})`
          );
        }
      }

      setEligibilityStatus({ eligible, messages });
    } else {
      setEligibilityStatus(null);
    }
  }, [pkg, selectedVehicle]);

  const handlePackageSelect = (packageId: string) => {
    const selectedPkg = packages.find((p) => p.id === packageId);
    if (selectedPkg) {
      setPkg(selectedPkg);

      // Set package ID and original prices
      form.setValue("warrantyPackageId", selectedPkg.id);
      form.setValue("excess", selectedPkg.excess || 0);
      form.setValue("labourRatePerHour", selectedPkg.labourRatePerHour || 0);
      form.setValue("fixedClaimLimit", selectedPkg.fixedClaimLimit || 0);

      // Store original prices for reference
      form.setValue("price12Months", selectedPkg.price12Months || null);
      form.setValue("price24Months", selectedPkg.price24Months || null);
      form.setValue("price36Months", selectedPkg.price36Months || null);

      // Auto-select duration/price logic
      if (selectedPkg.price12Months != null) {
        form.setValue("duration", 12);
        form.setValue("price", Number(selectedPkg.price12Months));
      } else if (selectedPkg.price24Months != null) {
        form.setValue("duration", 24);
        form.setValue("price", Number(selectedPkg.price24Months));
      } else if (selectedPkg.price36Months != null) {
        form.setValue("duration", 36);
        form.setValue("price", Number(selectedPkg.price36Months));
      } else if (selectedPkg.price != null) {
        form.setValue("price", Number(selectedPkg.price));
        form.setValue("duration", selectedPkg.coverageDuration || 12);
      }
    }
  };

  // Load customers (from dealer tenant DB) and preselect package from query
  useEffect(() => {
    (async () => {
      try {
        const [customersRes, packagesRes] = await Promise.all([
          getDealerCustomersAction(),
          getDealerWarrantyPackagesAction(),
        ]);

        if (customersRes.status && customersRes.data) {
          setCustomers(customersRes.data);

          const customerId = searchParams.get("customerId");
          if (customerId) {
            form.setValue("customerId", customerId);
            form.setValue("vehicleId", "");
          }
        }

        if (packagesRes.status && Array.isArray(packagesRes.data)) {
          setPackages(packagesRes.data);

          const packageId =
            searchParams.get("packageId") ||
            searchParams.get("warrantyPackageId");
          if (packageId) {
            const found = packagesRes.data.find(
              (p: WarrantyPackage) => p.id === packageId
            );
            if (found) {
              setPkg(found);

              // Set package ID and original prices
              form.setValue("warrantyPackageId", found.id);
              form.setValue("excess", found.excess || 0);
              form.setValue("labourRatePerHour", found.labourRatePerHour || 0);
              form.setValue("fixedClaimLimit", found.fixedClaimLimit || 0);

              // Store original prices for reference
              form.setValue("price12Months", found.price12Months || null);
              form.setValue("price24Months", found.price24Months || null);
              form.setValue("price36Months", found.price36Months || null);

              // Auto-select duration/price logic
              if (found.price12Months != null) {
                form.setValue("duration", 12);
                form.setValue("price", Number(found.price12Months));
              } else if (found.price24Months != null) {
                form.setValue("duration", 24);
                form.setValue("price", Number(found.price24Months));
              } else if (found.price36Months != null) {
                form.setValue("duration", 36);
                form.setValue("price", Number(found.price36Months));
              } else if (found.price != null) {
                form.setValue("price", Number(found.price));
                form.setValue("duration", found.coverageDuration || 12);
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to load data for dealer sale", e);
      }
    })();
  }, [form, searchParams]);

  const handleDurationSelect = (duration: number) => {
    form.setValue("duration", duration);
    if (pkg) {
      if (duration === 12 && pkg.price12Months != null) {
        form.setValue("price", Number(Number(pkg.price12Months).toFixed(2)));
      } else if (duration === 24 && pkg.price24Months != null) {
        form.setValue("price", Number(Number(pkg.price24Months).toFixed(2)));
      } else if (duration === 36 && pkg.price36Months != null) {
        form.setValue("price", Number(Number(pkg.price36Months).toFixed(2)));
      }
    }
  };

  const onSubmit: SubmitHandler<DealerSaleFormValues> = async (data) => {
    setLoading(true);
    try {
      // Note: Price is now fixed by SA and determined from package on backend
      // We only need to send customerId, warrantyPackageId, and duration
      const res = await createDealerWarrantySaleAction({
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        warrantyPackageId: data.warrantyPackageId,
        duration: data.duration,
        customerConsent: data.customerConsent,
        customerSignature: data.customerSignature,
        mileageAtSale: data.mileageAtSale,
        salesRepresentativeName: data.salesRepresentativeName,
        paymentMethod: data.paymentMethod,
        coverageStartDate: data.coverageStartDate,
        // Price fields are ignored by backend - SA controls all customer pricing
      });
      if (res.status) {
        toast.success("Warranty package assigned");
        router.push("/dealer/warranty-sales/list");
      } else {
        toast.error(res.message || "Failed to assign package");
      }
    } catch (error) {
      console.error("Error creating dealer warranty sale:", error);
      toast.error("Failed to assign package");
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
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>
            Choose a customer and price for this assignment.
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
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        handlePackageSelect(val);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a package" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salesRepresentativeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Representative Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter name"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
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
              </div>

              {pkg && (
                <div className="space-y-4 rounded-md border p-4 bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <NumberInputField
                      control={form.control}
                      name="excess"
                      label="Excess (£)"
                      placeholder="Fixed by package"
                      disabled={true}
                    />
                    <NumberInputField
                      control={form.control}
                      name="labourRatePerHour"
                      label="Labour Rate (£/hr)"
                      placeholder="Fixed by package"
                      disabled={true}
                    />
                    <NumberInputField
                      control={form.control}
                      name="fixedClaimLimit"
                      label="Fixed Claim Limit (£)"
                      placeholder="Fixed by package"
                      disabled={true}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Select Duration</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(val) =>
                              handleDurationSelect(Number(val))
                            }
                            value={String(field.value)}
                            className="flex flex-col space-y-1"
                          >
                            {pkg.price12Months != null && (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="12" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  12 Months —{" "}
                                  {formatCurrency(pkg.price12Months)}
                                </FormLabel>
                              </FormItem>
                            )}
                            {pkg.price24Months != null && (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="24" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  24 Months —{" "}
                                  {formatCurrency(pkg.price24Months)}
                                </FormLabel>
                              </FormItem>
                            )}
                            {pkg.price36Months != null && (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="36" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  36 Months —{" "}
                                  {formatCurrency(pkg.price36Months)}
                                </FormLabel>
                              </FormItem>
                            )}
                          </RadioGroup>
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
                            <SelectItem value="finance">Finance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        // Reset vehicle when customer changes
                        form.setValue("vehicleId", "");
                      }}
                      defaultValue={field.value}
                      value={field.value}
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

              {/* Vehicle Selection */}
              {selectedCustomerId && (
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
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableVehicles.length > 0 ? (
                            availableVehicles.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.make} {v.model} ({v.year}) -{" "}
                                {v.registrationNumber || "No Reg"}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-vehicle" disabled>
                              No vehicles found for this customer
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Eligibility Status Display */}
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

              <FormField
                control={form.control}
                name="customerConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Customer Agreement & Acceptance of Terms
                      </FormLabel>
                      <FormDescription>
                        I confirm that the customer has read and agreed to the
                        terms and conditions.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading || !pkg || eligibilityStatus?.eligible === false}
                >
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
