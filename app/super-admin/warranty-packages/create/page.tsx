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
import { createWarrantyPackageAction, getWarrantyItemsAction } from "@/lib/actions/warranty-package";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  planLevel: z.enum(["Silver", "Gold", "Platinum"]),
  eligibility: z.string().min(1, "Eligibility is required"),
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
  durationValue: z.coerce
    .number()
    .int()
    .positive("Duration must be greater than 0"),
  durationUnit: z.enum(["months", "years"]),
  includedFeatures: z
    .array(z.object({ value: z.string().min(1, "Feature cannot be empty") }))
    .optional()
    .default([]),
  keyBenefits: z
    .array(z.object({ value: z.string().min(1, "Benefit cannot be empty") }))
    .min(1, "Select at least one benefit"),
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
      planLevel: "Silver",
      eligibility: "",
      excess: 100,
      labourRatePerHour: 50,
      fixedClaimLimit: 2000,
      price12Months: 0,
      price24Months: 0,
      price36Months: 0,
      durationValue: 12,
      durationUnit: "months",
      includedFeatures: [],
      keyBenefits: [],
    },
  });

  const [warrantyItems, setWarrantyItems] = useState<Array<{ id: string; label: string; type: string }>>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const res = await getWarrantyItemsAction();
      if (res.status && Array.isArray(res.data)) {
        setWarrantyItems(res.data.map((x) => ({ id: x.id, label: x.label, type: x.type })));
      }
    })();
  }, []);

  const onSubmit = async (data: PackageFormValues) => {
    setLoading(true);
    try {
      const selectedLabels = warrantyItems
        .filter((x) => selectedItemIds.includes(x.id))
        .map((x) => x.label);
      const keyBenefits = selectedLabels;
      const includedFeatures: string[] = [];

      const result = await createWarrantyPackageAction({
        name: data.name,
        description: data.description,
        planLevel: data.planLevel,
        eligibility: data.eligibility,
        excess: data.excess,
        labourRatePerHour: data.labourRatePerHour,
        fixedClaimLimit: data.fixedClaimLimit,
        price12Months: data.price12Months,
        price24Months: data.price24Months,
        price36Months: data.price36Months,
        durationValue: data.durationValue,
        durationUnit: data.durationUnit,
        context: "drive_safe",
        includedFeatures,
        keyBenefits,
      } as any);

      if (result.status) {
        toast.success(
          result.message || "Warranty package created successfully"
        );
        router.push("/super-admin/warranty-packages/list");
      } else {
        toast.error(result.message || "Failed to create warranty package");
      }
    } catch (error) {
      console.error("Error creating package:", error);
      toast.error("An unexpected error occurred");
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

              <div className="grid grid-cols-2 gap-4 ">
                <FormField
                  control={form.control}
                  name="durationUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="years">Years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration </FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <FormItem>
                <FormLabel>Coverage Benefits</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {warrantyItems.map((item) => (
                    <label key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedItemIds.includes(item.id)}
                        onCheckedChange={(checked) => {
                          setSelectedItemIds((prev) =>
                            checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                          );
                        }}
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
                <FormDescription>Select applicable benefits for this package.</FormDescription>
              </FormItem>

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
