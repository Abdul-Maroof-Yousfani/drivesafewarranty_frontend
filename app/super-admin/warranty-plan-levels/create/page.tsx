"use client";

import { useEffect, useState } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  getWarrantyItemsAction,
  createWarrantyItemAction,
} from "@/lib/actions/warranty-package";
import { createWarrantyPlanLevelAction } from "@/lib/actions/warranty-plan-level";

const schema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  description: z.string().optional(),
  benefitIds: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

export default function CreateWarrantyPlanLevelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [warrantyItems, setWarrantyItems] = useState<
    Array<{ id: string; label: string; type: string }>
  >([]);
  const [newBenefit, setNewBenefit] = useState("");
  const [isCreatingBenefit, setIsCreatingBenefit] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      benefitIds: [],
    },
  });

  useEffect(() => {
    (async () => {
      const res = await getWarrantyItemsAction();
      if (res.status && Array.isArray(res.data)) {
        setWarrantyItems(
          res.data.map((x) => ({
            id: x.id,
            label: x.label,
            type: x.type,
          }))
        );
      }
    })();
  }, []);

  const handleCreateBenefit = async () => {
    if (!newBenefit.trim()) return;
    setIsCreatingBenefit(true);
    try {
      const result = await createWarrantyItemAction({
        label: newBenefit.trim(),
        type: "benefit",
      });
      if (result.status && result.data) {
        toast.success("Benefit created successfully");
        setNewBenefit("");
        setWarrantyItems((prev) => [...prev, result.data!]);
        const current = form.getValues("benefitIds") || [];
        form.setValue("benefitIds", [...current, result.data!.id], {
          shouldValidate: true,
        });
      } else {
        toast.error(result.message || "Failed to create benefit");
      }
    } catch (error) {
      console.error("Create benefit error:", error);
      toast.error("Failed to create benefit");
    } finally {
      setIsCreatingBenefit(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await createWarrantyPlanLevelAction({
        name: data.name,
        description: data.description,
        benefitIds: data.benefitIds,
      });
      if (res.status) {
        toast.success(res.message || "Plan level created successfully");
        router.push("/super-admin/warranty-plan-levels");
      } else {
        toast.error(res.message || "Failed to create plan level");
      }
    } catch (error) {
      console.error("Create plan level error:", error);
      toast.error("Failed to create plan level");
    } finally {
      setLoading(false);
    }
  };

  const benefitItems = warrantyItems.filter((item) => item.type === "benefit");

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create Warranty Plan Level
        </h1>
        <p className="text-muted-foreground mt-2">
          Define a new plan level and choose its default benefits. When this
          level is selected on a package, these benefits will be pre-selected.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Level Details</CardTitle>
          <CardDescription>
            Name and describe the plan level, then select its default benefits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Level Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Silver, Gold, Platinum" {...field} />
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
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this plan level offers"
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
                name="benefitIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Default Benefits</FormLabel>
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {benefitItems.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="benefitIds"
                            render={({ field }) => {
                              const isChecked = field.value?.includes(item.id);
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([
                                            ...(field.value || []),
                                            item.id,
                                          ]);
                                        } else {
                                          field.onChange(
                                            (field.value || []).filter(
                                              (val: string) => val !== item.id
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                      {item.label}
                                    </p>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <p className="text-sm font-medium">Quick add benefit</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="New benefit name"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={handleCreateBenefit}
                    disabled={isCreatingBenefit}
                  >
                    {isCreatingBenefit ? "Adding..." : "Add Benefit"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Plan Level"}
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


