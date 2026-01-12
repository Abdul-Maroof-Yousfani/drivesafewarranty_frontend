"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getWarrantyPresetsAction,
  deleteWarrantyPackageAction,
} from "@/lib/actions/warranty-package";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WarrantyPreset {
  id: string;
  name: string;
  description?: string | null;
  presetType?: string | null;
  planLevel?: string | null;
  price12Months?: number | null;
  price24Months?: number | null;
  price36Months?: number | null;
  items?: Array<{
    id: string;
    type: string;
    warrantyItem: {
      id: string;
      label: string;
    };
  }>;
  createdAt: string;
}

export default function WarrantyPlanPresetsPage() {
  const router = useRouter();
  const [presets, setPresets] = useState<WarrantyPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const result = await getWarrantyPresetsAction();
      if (result.status && Array.isArray(result.data)) {
        setPresets(result.data);
      } else {
        setPresets([]);
      }
    } catch (error) {
      console.error("Failed to load presets:", error);
      toast.error("Failed to load warranty plan presets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteWarrantyPackageAction(id);
      if (result.status) {
        toast.success("Preset deleted successfully");
        loadPresets();
      } else {
        toast.error(result.message || "Failed to delete preset");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete preset");
    } finally {
      setDeleteDialogOpen(false);
      setPresetToDelete(null);
    }
  };

  const getPresetTypeBadge = (presetType: string | null | undefined) => {
    if (!presetType) return null;
    const colors: Record<string, string> = {
      silver: "bg-gray-500",
      gold: "bg-yellow-500",
      platinum: "bg-purple-500",
    };
    return (
      <Badge className={colors[presetType] || "bg-gray-500"}>
        {presetType.charAt(0).toUpperCase() + presetType.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Warranty Plan Presets
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage predefined warranty plans (Silver, Gold, Platinum)
            that can be customized when assigned to dealers or customers
          </p>
        </div>
        <Button onClick={() => router.push("/super-admin/warranty-plan-presets/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Preset
        </Button>
      </div>

      {presets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No warranty plan presets found
            </p>
            <Button
              onClick={() => router.push("/super-admin/warranty-plan-presets/create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Preset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => {
            const benefitsCount =
              preset.items?.filter((item) => item.type === "benefit").length ||
              0;
            const featuresCount =
              preset.items?.filter((item) => item.type === "feature").length ||
              0;

            return (
              <Card key={preset.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{preset.name}</CardTitle>
                        {getPresetTypeBadge(preset.presetType)}
                      </div>
                      {preset.planLevel && (
                        <Badge variant="outline" className="mb-2">
                          {preset.planLevel}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {preset.description && (
                    <CardDescription className="line-clamp-2">
                      {preset.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Benefits:</span>
                      <span className="font-medium">{benefitsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Features:</span>
                      <span className="font-medium">{featuresCount}</span>
                    </div>
                    {(preset.price12Months ||
                      preset.price24Months ||
                      preset.price36Months) && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-muted-foreground mb-1">
                          Pricing:
                        </div>
                        <div className="space-y-1 text-sm">
                          {preset.price12Months && (
                            <div className="flex justify-between">
                              <span>12 months:</span>
                              <span className="font-medium">
                                £{Number(preset.price12Months).toFixed(2)}
                              </span>
                            </div>
                          )}
                          {preset.price24Months && (
                            <div className="flex justify-between">
                              <span>24 months:</span>
                              <span className="font-medium">
                                £{Number(preset.price24Months).toFixed(2)}
                              </span>
                            </div>
                          )}
                          {preset.price36Months && (
                            <div className="flex justify-between">
                              <span>36 months:</span>
                              <span className="font-medium">
                                £{Number(preset.price36Months).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link href={`/super-admin/warranty-plan-presets/view/${preset.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link href={`/super-admin/warranty-plan-presets/edit/${preset.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPresetToDelete(preset.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this preset? This action cannot
              be undone. Existing packages created from this preset will not be
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (presetToDelete) {
                  handleDelete(presetToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

