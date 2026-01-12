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
import {
  createWarrantyPackageAction,
  getWarrantyItemsAction,
  createWarrantyItemAction,
} from "@/lib/actions/warranty-package";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

const presetSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  presetType: z.enum(["silver", "gold", "platinum"]),
  planLevel: z.string().min(1, "Plan level is required"),
  keyBenefits: z.array(z.string()).min(1, "Select at least one benefit"),
});

type PresetFormValues = z.infer<typeof presetSchema>;

export default function CreatePresetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [warrantyItems, setWarrantyItems] = useState<
    Array<{ id: string; label: string; type: string }>
  >([]);
  const [newBenefit, setNewBenefit] = useState("");
  const [isCreatingBenefit, setIsCreatingBenefit] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);

  const form = useForm<PresetFormValues>({
    resolver: zodResolver(presetSchema) as any,
    defaultValues: {
      name: "",
      presetType: "silver",
      planLevel: "",
      keyBenefits: [],
    },
  });

  useEffect(() => {
    loadWarrantyItems();
  }, []);

  const loadWarrantyItems = async () => {
    try {
      const result = await getWarrantyItemsAction();
      if (result.status && Array.isArray(result.data)) {
        setWarrantyItems(result.data);
      }
    } catch (error) {
      console.error("Failed to load warranty items:", error);
    }
  };

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
        const current = form.getValues("keyBenefits") || [];
        form.setValue("keyBenefits", [...current, result.data!.id], {
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

  const handleCreateFeature = async () => {
    if (!newFeature.trim()) return;
    setIsCreatingFeature(true);
    try {
      const result = await createWarrantyItemAction({
        label: newFeature.trim(),
        type: "feature",
      });
      if (result.status && result.data) {
        toast.success("Feature created successfully");
        setNewFeature("");
        setWarrantyItems((prev) => [...prev, result.data!]);
      } else {
        toast.error(result.message || "Failed to create feature");
      }
    } catch (error) {
      console.error("Create feature error:", error);
      toast.error("Failed to create feature");
    } finally {
      setIsCreatingFeature(false);
    }
  };

  const onSubmit = async (data: PresetFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        isPreset: true,
        status: "active",
      };

      const result = await createWarrantyPackageAction(payload as any);
      if (result.status) {
        toast.success("Warranty plan preset created successfully");
        router.push("/super-admin/warranty-plan-presets");
      } else {
        toast.error(result.message || "Failed to create preset");
      }
    } catch (error) {
      console.error("Create preset error:", error);
      toast.error("Failed to create preset");
    } finally {
      setLoading(false);
    }
  };

  const benefits = warrantyItems.filter((item) => item.type === "benefit");
  const features = warrantyItems.filter((item) => item.type === "feature");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create Warranty Plan Preset
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a predefined warranty plan template (Silver, Gold, Platinum)
          that can be customized when assigned to dealers or customers
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define the plan and preset type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preset Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Silver Plan" />
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
                    <FormLabel>Plan Level *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Silver, Gold, Platinum"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="presetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preset Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preset type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Benefits *</CardTitle>
              <CardDescription>
                Assign key benefits and create new benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new benefit name"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateBenefit();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleCreateBenefit}
                  disabled={isCreatingBenefit || !newBenefit.trim()}
                >
                  {isCreatingBenefit ? (
                    "Adding..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto border rounded-md p-4">
                {benefits.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="keyBenefits"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              {benefits.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No benefits available. Add one above.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Create new features for future use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new feature name"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateFeature();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleCreateFeature}
                  disabled={isCreatingFeature || !newFeature.trim()}
                >
                  {isCreatingFeature ? (
                    "Adding..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </div>

              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                {features.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No features available yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {features.map((item) => (
                      <div key={item.id} className="text-sm">
                        {item.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Preset"}
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
