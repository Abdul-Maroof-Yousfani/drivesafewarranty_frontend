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
import { getDealerCustomersAction } from "@/lib/actions/dealer-customer";
import { getDealerWarrantyPackagesAction } from "@/lib/actions/warranty-package";
import { createDealerWarrantySaleAction } from "@/lib/actions/dealer-warranty-sales";
import { formatCurrency } from "@/lib/utils";

const dealerSaleSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  warrantyPackageId: z.string().min(1, "Please select a package"),
  price: z.coerce.number().min(0, "Price must be a non‑negative number"),
  duration: z.coerce.number().min(1, "Duration is required"),
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
});

type DealerSaleFormValues = {
  customerId: string;
  warrantyPackageId: string;
  price: number;
  duration: number;
  excess: number | null;
  labourRatePerHour: number | null;
  fixedClaimLimit: number | null;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
};

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
      warrantyPackageId: "",
      price: 0,
      duration: 12,
      excess: null,
      labourRatePerHour: null,
      fixedClaimLimit: null,
      price12Months: null,
      price24Months: null,
      price36Months: null,
    },
  });

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
        }

        if (packagesRes.status && Array.isArray(packagesRes.data)) {
          setPackages(packagesRes.data);

          const packageId = searchParams.get("packageId");
          if (packageId) {
            const found = packagesRes.data.find((p: any) => p.id === packageId);
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
        warrantyPackageId: data.warrantyPackageId,
        duration: data.duration,
        // Price fields are ignored by backend - SA controls all customer pricing
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
                            defaultValue={String(field.value)}
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

                  <NumberInputField
                    control={form.control}
                    name="price"
                    label="Plan Amount (£)"
                    placeholder="Fixed by package"
                    disabled={true}
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
