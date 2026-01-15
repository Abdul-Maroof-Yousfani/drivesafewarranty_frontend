"use client";

import { useEffect, useState, useTransition, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  getWarrantyPlanLevelsAction,
  updateWarrantyPlanLevelAction,
} from "@/lib/actions/warranty-plan-level";
import { getWarrantyItemsAction, type WarrantyItem } from "@/lib/actions/warranty-item";

export default function PlanLevelBenefitsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [allBenefits, setAllBenefits] = useState<WarrantyItem[]>([]);
  const [selectedBenefitIds, setSelectedBenefitIds] = useState<string[]>([]);
  const [planLevelName, setPlanLevelName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [isManaging, setIsManaging] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [benefitsRes, planRes] = await Promise.all([
        getWarrantyItemsAction(),
        getWarrantyPlanLevelsAction(),
      ]);

      if (benefitsRes.status && Array.isArray(benefitsRes.data)) {
        setAllBenefits(benefitsRes.data.filter((i) => i.type === "benefit"));
      }

      if (planRes.status && Array.isArray(planRes.data)) {
        const plan = planRes.data.find((p: any) => p.id === id);
        if (plan) {
          setPlanLevelName(plan.name);
          setPlanDescription(plan.description || "");
          const activeBenefitIds =
            plan.benefits
              ?.map((b: any) => b.warrantyItemId)
              .filter(Boolean) || [];
          setSelectedBenefitIds(activeBenefitIds);
        } else {
          toast.error("Plan level not found");
          router.push("/super-admin/warranty-plan-levels");
        }
      }
      setLoading(false);
    })();
  }, [id, router]);

  const handleToggleBenefit = (benefitId: string) => {
    setSelectedBenefitIds((prev) =>
      prev.includes(benefitId)
        ? prev.filter((id) => id !== benefitId)
        : [...prev, benefitId]
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateWarrantyPlanLevelAction(id, {
        benefitIds: selectedBenefitIds,
      });

      if (res.status) {
        toast.success("Benefits updated successfully");
        setIsManaging(false);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update benefits");
      }
    });
  };

  const assignedBenefits = allBenefits.filter((b) =>
    selectedBenefitIds.includes(b.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Loading plan details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {planLevelName} Tier Details
            </h1>
            <p className="text-muted-foreground">
              {isManaging
                ? "Select benefits to include in this warranty tier."
                : "View details and benefits assigned to this warranty tier."}
            </p>
          </div>
        </div>
        {!isManaging ? (
          <Button onClick={() => setIsManaging(true)}>Edit This Tier</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsManaging(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle>Tier Information</CardTitle>
          <CardDescription>Basic details about this warranty tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid ">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </h4>
            <p className="text-lg ">
              {planDescription || "No description provided for this tier."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {isManaging ? "All Available Benefits" : "Assigned Benefits"}
            </CardTitle>
            <CardDescription className="mt-2">
              {isManaging
                ? "Select from the master list of benefits"
                : `Total ${assignedBenefits.length} benefits included in this tier`}
            </CardDescription>
          </div>
          {isManaging && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedBenefitIds.length} Selected
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isManaging ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allBenefits.length === 0 ? (
                <div className="col-span-full text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                  No global benefits found. Please add some first.
                </div>
              ) : (
                allBenefits.map((benefit) => (
                  <div
                    key={benefit.id}
                    className={`flex items-start space-x-3 p-4 border rounded-lg transition-all cursor-pointer ${
                      selectedBenefitIds.includes(benefit.id)
                        ? "bg-primary/5 border-primary shadow-sm"
                        : "hover:bg-accent/50"
                    }`}
                    onClick={() => handleToggleBenefit(benefit.id)}
                  >
                    <Checkbox
                      id={benefit.id}
                      checked={selectedBenefitIds.includes(benefit.id)}
                      onCheckedChange={() => handleToggleBenefit(benefit.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={benefit.id}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {benefit.label}
                      </Label>
                      {benefit.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {benefit.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {assignedBenefits.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>No benefits have been assigned to this tier yet.</p>
                  <Button
                    variant="link"
                    onClick={() => setIsManaging(true)}
                    className="mt-2"
                  >
                    Click here to add benefits
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedBenefits.map((benefit) => (
                    <div
                      key={benefit.id}
                      className="flex items-start gap-3 p-4 border rounded-lg bg-card"
                    >
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">{benefit.label}</h4>
                        {benefit.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {benefit.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isManaging && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setIsManaging(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
