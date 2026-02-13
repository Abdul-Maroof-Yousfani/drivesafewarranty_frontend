"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  createWarrantyPackageAction,
} from "@/lib/actions/warranty-package";
import { getWarrantyItemsAction } from "@/lib/actions/warranty-item";
import { getWarrantyPlanLevelsAction } from "@/lib/actions/warranty-plan-level";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const packageSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description is too long"),
  planLevel: z
    .string()
    .min(1, "Plan level is required")
    .max(50, "Plan level is too long"),
  eligibility: z
    .string()
    .min(5, "Eligibility criteria must be at least 5 characters")
    .max(1000, "Eligibility criteria too long"),
  eligibilityMileageComparator: z
    .enum(["gt", "lt"])
    .optional()
    .or(z.literal("")),
  eligibilityMileageValue: z.coerce.number().min(0).optional(),
  eligibilityVehicleAgeYearsMax: z.coerce.number().min(0).optional(),
  eligibilityTransmission: z
    .enum(["manual", "automatic"])
    .optional()
    .or(z.literal("")),
  excess: z.coerce
    .number()
    .min(0, "Excess must be non‑negative")
    .max(1000, "Excess is too high"),
  labourRatePerHour: z.coerce
    .number()
    .min(0, "Labour rate must be non‑negative")
    .max(500, "Labour rate is too high"),
  fixedClaimLimit: z.coerce
    .number()
    .min(0, "Fixed claim limit must be non‑negative")
    .max(100000, "Fixed claim limit is too high"),
  price12Months: z.coerce
    .number()
    .min(0, "12‑month price must be non‑negative"),
  price24Months: z.coerce
    .number()
    .min(0, "24‑month price must be non‑negative"),
  price36Months: z.coerce
    .number()
    .min(0, "36‑month price must be non‑negative"),
  includedFeatures: z.array(z.string()).default([]),
  keyBenefits: z.array(z.string()).min(1, "Select at least one benefit"), // Array of WarrantyItem IDs
});

type PackageFormValues = z.infer<typeof packageSchema>;

export default function CreateWarrantyPackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      planLevel: "",
      eligibility: "",
      eligibilityMileageComparator: "",
      eligibilityMileageValue: "" as any,
      eligibilityVehicleAgeYearsMax: "" as any,
      eligibilityTransmission: "",
      excess: 100,
      labourRatePerHour: 50,
      fixedClaimLimit: 2000,
      price12Months: 0,
      price24Months: 0,
      price36Months: 0,
      includedFeatures: [],
      keyBenefits: [],
    },
  });

  const [warrantyItems, setWarrantyItems] = useState<
    Array<{ id: string; label: string; type: string }>
  >([]);
  const [planLevels, setPlanLevels] = useState<
    Array<{
      id: string;
      name: string;
      benefitIds: string[];
    }>
  >([]);

  useEffect(() => {
    (async () => {
      const [itemsRes, levelsRes] = await Promise.all([
        getWarrantyItemsAction(),
        getWarrantyPlanLevelsAction(),
      ]);

      if (itemsRes.status && Array.isArray(itemsRes.data)) {
        setWarrantyItems(
          itemsRes.data.map((x) => ({
            id: x.id,
            label: x.label,
            type: x.type,
          }))
        );
      }

      if (levelsRes.status && Array.isArray(levelsRes.data)) {
        setPlanLevels(
          levelsRes.data.map((level: any) => ({
            id: level.id,
            name: level.name,
            benefitIds:
              level.benefits
                ?.map(
                  (b: any) =>
                    b.warrantyItemId || b.warrantyItem?.id || undefined
                )
                .filter(Boolean) ?? [],
          }))
        );
      }
    })();
  }, []);

  const onSubmit = async (data: PackageFormValues) => {
    setLoading(true);
    try {
      const result = await createWarrantyPackageAction({
        name: data.name,
        description: data.description,
        planLevel: data.planLevel,
        eligibility: data.eligibility,
        eligibilityMileageComparator:
          data.eligibilityMileageComparator || undefined,
        eligibilityMileageValue: data.eligibilityMileageValue,
        eligibilityVehicleAgeYearsMax: data.eligibilityVehicleAgeYearsMax,
        eligibilityTransmission: data.eligibilityTransmission || undefined,
        excess: data.excess,
        labourRatePerHour: data.labourRatePerHour,
        fixedClaimLimit: data.fixedClaimLimit,
        price12Months: data.price12Months,
        price24Months: data.price24Months,
        price36Months: data.price36Months,
        context: "drive_safe",
        includedFeatures: data.includedFeatures,
        keyBenefits: data.keyBenefits,
      } as any);

      if (result.status) {
        toast.success(
          result.message || "Warranty package created successfully"
        );
        router.push("/super-admin/warranty-packages/list");
      } else {
        toast.error(
          result.message ||
            "Failed to create warranty package. Please check the details and try again."
        );
      }
    } catch (error) {
      console.error("Error creating package:", error);
      toast.error(
        "An unexpected error occurred. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create Warranty Package
        </h1>
        <p className="text-muted-foreground mt-2">
          Define a new warranty package that can be shared with dealers and
          customers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package Information</CardTitle>
          <CardDescription>Enter the warranty package details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Silver 1 Year" maxLength={50} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Short description of this package"
                        rows={3}
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Level</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        // Auto-select default benefits for this plan level (if defined)
                        const level = planLevels.find((l) => l.name === val);
                        if (level && level.benefitIds.length > 0) {
                          form.setValue("keyBenefits", level.benefitIds, {
                            shouldValidate: true,
                          });
                        }
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan level" />
                      </SelectTrigger>
                      <SelectContent>
                        {planLevels.map((level) => (
                          <SelectItem key={level.id} value={level.name}>
                            {level.name}
                          </SelectItem>
                        ))}
                        {/* Fallback for custom/legacy levels that are not in planLevels */}
                        {field.value &&
                          !planLevels.some((l) => l.name === field.value) && (
                            <SelectItem value={field.value}>
                              {field.value}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price12Months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>12 Months Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
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
                      <FormLabel>24 Months Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
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
                      <FormLabel>36 Months Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="keyBenefits"
                render={() => (
                  <FormItem>
                    <FormLabel>Coverage Benefits</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {warrantyItems.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="keyBenefits"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            item.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormDescription>
                      Select applicable benefits for this package.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eligibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligibility</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Eligibility criteria"
                        rows={2}
                        maxLength={1000}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="eligibilityMileageComparator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage Comparator</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select comparator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gt">Greater Than</SelectItem>
                            <SelectItem value="lt">Less Than</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eligibilityMileageValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage Value (miles)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eligibilityVehicleAgeYearsMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Vehicle Age (years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="eligibilityTransmission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Transmission</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automatic">Automatic</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="excess"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excess</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
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
                      <FormLabel>Labour Rate (per hour)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
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
                      <FormLabel>Fixed Claim Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormMessage />

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Package"}
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
