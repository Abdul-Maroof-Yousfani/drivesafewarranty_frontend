"use client";

import { useState } from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { createSalaryBreakup } from "@/lib/actions/salary-breakup";

type SalaryBreakupEntry = {
  id: number;
  typeName: string;
  percent: string;
  isTaxable: string;
};

export default function AddSalaryBreakupPage() {
  const [name, setName] = useState("");
  const [entries, setEntries] = useState<SalaryBreakupEntry[]>([
    { id: 1, typeName: "", percent: "", isTaxable: "" },
  ]);
  const [isPending, startTransition] = useTransition();

  const addMore = () => {
    setEntries([...entries, { id: Date.now(), typeName: "", percent: "", isTaxable: "" }]);
  };

  const removeEntry = (id: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  const updateEntry = (id: number, field: keyof SalaryBreakupEntry, value: string) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = entries.filter((e) => e.typeName && e.percent && e.isTaxable);
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (valid.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }
    startTransition(async () => {
      const payload = valid.map((v) => ({
        typeName: v.typeName,
        percent: parseFloat(v.percent),
        isTaxable: v.isTaxable === "yes",
      }));
      const res = await createSalaryBreakup(name.trim(), payload);
      if (res.status) {
        toast.success("Salary breakup created successfully");
        setName("");
        setEntries([{ id: 1, typeName: "", percent: "", isTaxable: "" }]);
      } else {
        toast.error(res.message || "Failed to create salary breakup");
      }
    });
  };

  const handleClear = () => {
    setEntries([{ id: 1, typeName: "", percent: "", isTaxable: "" }]);
  };

  return (
    <div className="w-full px-10">
      <div className="mb-6">
        <Link href="/dashboard/master/salary-breakup/list">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Salary Breakup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>
                Name <span className="text-destructive">*</span>
              </Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Default Breakup" />
            </div>
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-end gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                  <div className="space-y-2">
                    <Label>
                      Type Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={entry.typeName}
                      onChange={(e) => updateEntry(entry.id, "typeName", e.target.value)}
                      placeholder="e.g., Basic, House Rent"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Percent (%) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entry.percent}
                      onChange={(e) => updateEntry(entry.id, "percent", e.target.value)}
                      placeholder="e.g., 10, 20"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Is Taxable <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={entry.isTaxable}
                      onValueChange={(value) => updateEntry(entry.id, "isTaxable", value)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {entries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeEntry(entry.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={addMore} disabled={isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Add More
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
              <Button type="button" variant="outline" onClick={handleClear} disabled={isPending}>
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

