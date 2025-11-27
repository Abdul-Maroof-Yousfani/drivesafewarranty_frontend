"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const employees = ["Ahmed Khan", "Sara Ali", "Muhammad Usman", "Fatima Zahra"];
const departments = ["IT", "HR", "Finance", "Marketing", "Operations", "Admin"];
const designations = ["Software Engineer", "Senior Engineer", "Manager", "Director", "Intern"];
const locations = ["Head Office", "Branch A", "Branch B", "Remote"];
const leavingReasons = ["Resignation", "Termination", "Contract End", "Retirement", "Other"];

export default function CreateExitClearancePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    employeeName: "",
    designation: "",
    department: "",
    location: "",
    leavingReason: "",
    contractEnd: "",
    lastWorkingDate: "",
    reportingManager: "",
    date: new Date().toISOString().split("T")[0],
    // IT Department
    itAccessControl: false,
    itPasswordInactivated: false,
    itLaptopReturned: false,
    itEquipment: false,
    itWifiDevice: false,
    itMobileDevice: false,
    itSimCard: false,
    itBillsSettlement: false,
    // Finance Department
    financeAdvance: false,
    financeLoan: false,
    financeOtherLiabilities: false,
    // Admin Department
    adminVehicle: false,
    adminKeys: false,
    adminOfficeAccessories: false,
    adminMobilePhone: false,
    adminVisitingCards: false,
    // HR Department
    hrEobi: false,
    hrProvidentFund: false,
    hrIdCard: false,
    hrMedical: false,
    hrThumbImpression: false,
    hrLeavesRemaining: false,
    hrOtherCompensation: false,
    // Note
    note: "",
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeName || !formData.lastWorkingDate) {
      toast.error("Please fill required fields");
      return;
    }
    startTransition(async () => {
      try {
        toast.success("Exit clearance created successfully");
        router.push("/dashboard/exit-clearance/view");
      } catch {
        toast.error("Failed to create exit clearance");
      }
    });
  };

  const CheckboxField = ({ id, label, checked }: { id: string; label: string; checked: boolean }) => (
    <div className="flex items-center gap-3 py-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(c) => updateField(id, !!c)} disabled={isPending} />
      <label htmlFor={id} className="text-sm cursor-pointer">{label}</label>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <Link href="/dashboard/exit-clearance/view">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to List</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Information */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>Basic details of the departing employee</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Employee Name *</Label>
              <Select value={formData.employeeName} onValueChange={(v) => updateField("employeeName", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Select value={formData.designation} onValueChange={(v) => updateField("designation", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{designations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={formData.department} onValueChange={(v) => updateField("department", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={formData.location} onValueChange={(v) => updateField("location", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Leaving Reason</Label>
              <Select value={formData.leavingReason} onValueChange={(v) => updateField("leavingReason", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{leavingReasons.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contract End</Label>
              <Input type="date" value={formData.contractEnd} onChange={(e) => updateField("contractEnd", e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Last Working Date *</Label>
              <Input type="date" value={formData.lastWorkingDate} onChange={(e) => updateField("lastWorkingDate", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Reporting Manager</Label>
              <Input value={formData.reportingManager} onChange={(e) => updateField("reportingManager", e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={formData.date} onChange={(e) => updateField("date", e.target.value)} disabled={isPending} />
            </div>
          </CardContent>
        </Card>

        {/* IT Department */}
        <Card>
          <CardHeader>
            <CardTitle>IT Department – Clearance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <CheckboxField id="itAccessControl" label="Access Control of Software" checked={formData.itAccessControl} />
            <CheckboxField id="itPasswordInactivated" label="Password Inactivated" checked={formData.itPasswordInactivated} />
            <CheckboxField id="itLaptopReturned" label="Laptop Returned" checked={formData.itLaptopReturned} />
            <CheckboxField id="itEquipment" label="IT Equipment (Power Bank / USB / Related Items)" checked={formData.itEquipment} />
            <CheckboxField id="itWifiDevice" label="WiFi Device / Related Equipment" checked={formData.itWifiDevice} />
            <CheckboxField id="itMobileDevice" label="Mobile Device" checked={formData.itMobileDevice} />
            <CheckboxField id="itSimCard" label="SIM Card" checked={formData.itSimCard} />
            <CheckboxField id="itBillsSettlement" label="Bills & Settlement Details" checked={formData.itBillsSettlement} />
          </CardContent>
        </Card>

        {/* Finance Department */}
        <Card>
          <CardHeader>
            <CardTitle>Finance Department – Clearance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <CheckboxField id="financeAdvance" label="Advance" checked={formData.financeAdvance} />
            <CheckboxField id="financeLoan" label="Loan" checked={formData.financeLoan} />
            <CheckboxField id="financeOtherLiabilities" label="Other Liabilities (if any)" checked={formData.financeOtherLiabilities} />
          </CardContent>
        </Card>

        {/* Admin Department */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Department – Clearance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <CheckboxField id="adminVehicle" label="Company-Owned Vehicle" checked={formData.adminVehicle} />
            <CheckboxField id="adminKeys" label="Keys" checked={formData.adminKeys} />
            <CheckboxField id="adminOfficeAccessories" label="Office Accessories" checked={formData.adminOfficeAccessories} />
            <CheckboxField id="adminMobilePhone" label="Mobile Phone / SIM Card" checked={formData.adminMobilePhone} />
            <CheckboxField id="adminVisitingCards" label="Visiting Cards" checked={formData.adminVisitingCards} />
          </CardContent>
        </Card>

        {/* HR Department */}
        <Card>
          <CardHeader>
            <CardTitle>HR Department – Clearance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <CheckboxField id="hrEobi" label="EOBI" checked={formData.hrEobi} />
            <CheckboxField id="hrProvidentFund" label="Provident Fund (PF)" checked={formData.hrProvidentFund} />
            <CheckboxField id="hrIdCard" label="Return of ID / Access Card" checked={formData.hrIdCard} />
            <CheckboxField id="hrMedical" label="Medical" checked={formData.hrMedical} />
            <CheckboxField id="hrThumbImpression" label="Thumb Impression" checked={formData.hrThumbImpression} />
            <CheckboxField id="hrLeavesRemaining" label="Leaves Remaining" checked={formData.hrLeavesRemaining} />
            <CheckboxField id="hrOtherCompensation" label="Any Other Compensation Details" checked={formData.hrOtherCompensation} />
          </CardContent>
        </Card>

        {/* Note */}
        <Card>
          <CardHeader>
            <CardTitle>Note</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={formData.note} onChange={(e) => updateField("note", e.target.value)} placeholder="Additional notes..." rows={4} disabled={isPending} />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-2 sticky bottom-4 bg-background p-4 border rounded-lg shadow-lg">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Clearance
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

