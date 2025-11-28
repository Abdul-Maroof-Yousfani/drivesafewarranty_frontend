"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createLeavesPolicies } from "@/lib/actions/leaves-policy";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AddLeavesPolicyPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [policies, setPolicies] = useState([{ id: 1, name: "", details: "" }]);

  const addRow = () => {
    setPolicies([...policies, { id: Date.now(), name: "", details: "" }]);
  };

  const removeRow = (id: number) => {
    if (policies.length > 1) {
      setPolicies(policies.filter((p) => p.id !== id));
    }
  };

  const updateField = (id: number, field: "name" | "details", value: string) => {
    setPolicies(
      policies.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = policies
      .map((p) => ({ name: p.name.trim(), details: p.details.trim() || undefined }))
      .filter((p) => p.name);

    if (items.length === 0) {
      toast.error("Please enter at least one policy name");
      return;
    }

    startTransition(async () => {
      const result = await createLeavesPolicies(items);
      if (result.status) {
        toast.success(result.message);
        router.push("/dashboard/master/leaves-policy/list");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/master/leaves-policy/list">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Leave Policies</CardTitle>
          <CardDescription>
            Create one or more leave policies for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {policies.map((policy, index) => (
              <div key={policy.id} className="space-y-4 border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">
                    Policy {index + 1}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(policy.id)}
                    disabled={policies.length === 1 || isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Policy Name *</Label>
                    <Input
                      placeholder="Policy name"
                      value={policy.name}
                      onChange={(e) => updateField(policy.id, "name", e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Details (Optional)</Label>
                    <Textarea
                      placeholder="Policy details"
                      value={policy.details}
                      onChange={(e) => updateField(policy.id, "details", e.target.value)}
                      disabled={isPending}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-2 justify-between">
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Create{" "}
                  {policies.length > 1
                    ? `${policies.length} Policies`
                    : "Policy"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
              <button
                type="button"
                onClick={addRow}
                disabled={isPending}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                + Add more
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
