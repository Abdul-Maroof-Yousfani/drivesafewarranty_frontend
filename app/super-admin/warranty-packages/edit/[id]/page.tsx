"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  getWarrantyPackageByIdAction,
  getWarrantyItemsAction,
  updateWarrantyPackageAction,
} from "@/lib/actions/warranty-package";
import { toast } from "sonner";

const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  planLevel: z.enum(["Silver", "Gold", "Platinum"]),
  eligibility: z.string().min(1, "Eligibility is required"),
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
  excess: z.coerce.number().min(0, "Excess must be non‑negative"),
  labourRatePerHour: z.coerce
    .number()
    .min(0, "Labour rate must be non‑negative"),
  fixedClaimLimit: z.coerce
    .number()
    .min(0, "Fixed claim limit must be non‑negative"),
  price12Months: z.coerce
    .number()
    .min(0, "12‑month price must be non‑negative"),
  price24Months: z.coerce
    .number()
    .min(0, "24‑month price must be non‑negative"),
  price36Months: z.coerce
    .number()
    .min(0, "36‑month price must be non‑negative"),
  includedFeatures: z.array(z.string()).optional().default([]),
  keyBenefits: z.array(z.string()).min(1, "Select at least one benefit"), // Array of WarrantyItem IDs
});

type PackageFormValues = z.infer<typeof packageSchema>;

export default function EditWarrantyPackagePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warrantyItems, setWarrantyItems] = useState<
    Array<{ id: string; label: string; type: string }>
  >([]);

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      description: "",
      planLevel: "Silver",
      eligibility: "",
      eligibilityMileageComparator: "",
      eligibilityMileageValue: undefined,
      eligibilityVehicleAgeYearsMax: undefined,
      eligibilityTransmission: "",
      excess: 0,
      labourRatePerHour: 0,
      fixedClaimLimit: 0,
      price12Months: 0,
      price24Months: 0,
      price36Months: 0,
      includedFeatures: [],
      keyBenefits: [],
    },
  });

  useEffect(() => {
    const loadData = async () => {
      const id = params.id as string | undefined;
      if (!id) return;
      const [itemsRes, pkgRes] = await Promise.all([
        getWarrantyItemsAction(),
        getWarrantyPackageByIdAction(id),
      ]);
      if (itemsRes.status && Array.isArray(itemsRes.data)) {
        setWarrantyItems(
          itemsRes.data.map((x) => ({ id: x.id, label: x.label, type: x.type }))
        );
      }
      if (pkgRes.status && pkgRes.data) {
        const p = pkgRes.data;
        form.reset({
          name: p.name || "",
          description: p.description || "",
          planLevel: (p.planLevel as any) || "Silver",
          eligibility: p.eligibility || "",
          eligibilityMileageComparator:
            (p.eligibilityMileageComparator as any) || "",
          eligibilityMileageValue: p.eligibilityMileageValue || undefined,
          eligibilityVehicleAgeYearsMax:
            p.eligibilityVehicleAgeYearsMax || undefined,
          eligibilityTransmission: (p.eligibilityTransmission as any) || "",
          excess: p.excess ?? 0,
          labourRatePerHour: p.labourRatePerHour ?? 0,
          fixedClaimLimit: p.fixedClaimLimit ?? 0,
          price12Months: p.price12Months ?? 0,
          price24Months: p.price24Months ?? 0,
          price36Months: p.price36Months ?? 0,
          includedFeatures: Array.isArray(p.includedFeatures)
            ? p.includedFeatures
            : [],
          // Extract benefit item IDs from items relation
          keyBenefits:
            p.items
              ?.filter((item: any) => item.type === "benefit")
              .map((item: any) => item.warrantyItem?.id || item.warrantyItemId)
              .filter(Boolean) || [],
        });
      } else {
        toast.error(pkgRes.message || "Failed to load package");
      }
      setLoading(false);
    };
    loadData();
  }, [params.id]);

  const onSubmit = async (data: PackageFormValues) => {
    const id = params.id as string | undefined;
    if (!id) return;
    setSaving(true);
    try {
      const res = await updateWarrantyPackageAction(id, {
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
        includedFeatures: data.includedFeatures,
        keyBenefits: data.keyBenefits,
      } as any);
      if (res.status) {
        toast.success(res.message || "Warranty package updated successfully");
        router.push("/super-admin/warranty-packages/list");
      } else {
        toast.error(res.message || "Failed to update warranty package");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-6 w-96 bg-muted animate-pulse rounded" />
        <div className="h-[480px] bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Warranty Package
        </h1>
        <p className="text-muted-foreground mt-2">
          Update warranty package details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package Information</CardTitle>
          <CardDescription>Edit the warranty package details</CardDescription>
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
                      <Input placeholder="e.g., Silver 1 Year" {...field} />
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
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Platinum">Platinum</SelectItem>
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
                        <Input type="number" min={0} step="0.01" {...field} />
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
                        <Input type="number" min={0} step="0.01" {...field} />
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
                        <Input type="number" min={0} step="0.01" {...field} />
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
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
                          )}
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
                        <Input type="number" min={0} {...field} />
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
                        <Input type="number" min={0} {...field} />
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
                        <Input type="number" min={0} step="0.01" {...field} />
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
                        <Input type="number" min={0} step="0.01" {...field} />
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
                        <Input type="number" min={0} step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
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
