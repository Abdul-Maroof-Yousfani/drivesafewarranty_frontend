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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, Key, X } from "lucide-react";
import Link from "next/link";

const departments = ["IT", "HR", "Finance", "Marketing", "Operations", "Sales"];
const subDepartments = ["Development", "QA", "DevOps", "Support", "Admin"];
const designations = ["Software Engineer", "Senior Engineer", "Manager", "Director", "Intern"];
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];
const employmentStatuses = ["Permanent", "Contract", "Probation", "Internship"];
const nationalities = ["Pakistani", "American", "British", "Canadian", "Other"];
const genders = ["Male", "Female", "Other"];
const provinces = ["Punjab", "Sindh", "KPK", "Balochistan", "Islamabad", "AJK", "Gilgit-Baltistan"];
const cities = ["Islamabad", "Karachi", "Lahore", "Peshawar", "Quetta", "Multan", "Faisalabad"];
const banks = ["HBL", "UBL", "MCB", "Allied Bank", "Bank Alfalah", "Meezan Bank", "Standard Chartered"];
const accountTypes = ["Admin", "Employee", "Manager", "HR"];
const roles = ["Super Admin", "Admin", "HR Manager", "Employee", "Viewer"];
const daysOff = ["Sunday", "Saturday-Sunday", "Friday", "Friday-Saturday"];

export default function CreateEmployeePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Basic Information
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    fatherHusbandName: "",
    department: "",
    subDepartment: "",
    employeeGrade: "",
    attendanceId: "",
    designation: "",
    maritalStatus: "",
    employmentStatus: "",
    probationExpiryDate: "",
    cnicNumber: "",
    cnicExpiryDate: "",
    lifetimeCnic: false,
    joiningDate: "",
    dateOfBirth: "",
    nationality: "",
    gender: "",
    contactNumber: "",
    emergencyContactNumber: "",
    emergencyContactPersonName: "",
    personalEmail: "",
    officialEmail: "",
    country: "Pakistan",
    province: "",
    city: "",
    area: "",
    employeeSalary: "",
    eobi: false,
    eobiNumber: "",
    providentFund: false,
    overtimeApplicable: false,
    daysOff: "",
    reportingManager: "",
    workingHoursPolicy: "",
    branch: "",
    leavesPolicy: "",
    allowRemoteAttendance: false,
    // Address
    currentAddress: "",
    permanentAddress: "",
    // Bank
    bankName: "",
    accountNumber: "",
    accountTitle: "",
    // Items Issued
    laptop: false,
    card: false,
    mobileSim: false,
    key: false,
    tools: false,
    // Login
    accountType: "",
    password: "",
    roles: "",
  });

  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    cv: null,
    educationDegrees: null,
    passportPhotos: null,
    cnic: null,
    clearanceLetter: null,
    fitProperCriteria: null,
    serviceRulesAffirmation: null,
    codeOfConduct: null,
    nda: null,
    secrecyForm: null,
    investmentDisclosure: null,
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateField("password", password);
    toast.success("Password generated!");
  };

  const handleFileChange = (key: string, file: File | null) => {
    setDocuments((prev) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.employeeName || !formData.officialEmail) {
      toast.error("Please fill all required fields");
      return;
    }

    startTransition(async () => {
      try {
        // In real implementation, you'd send formData and documents to the API
        toast.success("Employee created successfully");
        router.push("/dashboard/employee/list");
      } catch (error) {
        toast.error("Failed to create employee");
      }
    });
  };

  const FileUploadField = ({ label, fieldKey }: { label: string; fieldKey: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          onChange={(e) => handleFileChange(fieldKey, e.target.files?.[0] || null)}
          className="flex-1"
          disabled={isPending}
        />
        {documents[fieldKey] && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleFileChange(fieldKey, null)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {documents[fieldKey] && (
        <p className="text-xs text-muted-foreground">{documents[fieldKey]?.name}</p>
      )}
    </div>
  );

  return (
    <div className=" max-w-[90%] mx-auto pb-10">
      <div className="mb-6">
        <Link href="/dashboard/employee/list">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </Link>
      </div>
<div className="border rounded-xl p-4 "> 
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
            <CardDescription>Enter employee's basic details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Employee ID *</Label>
              <Input value={formData.employeeId} onChange={(e) => updateField("employeeId", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Employee Name *</Label>
              <Input value={formData.employeeName} onChange={(e) => updateField("employeeName", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Father / Husband Name *</Label>
              <Input value={formData.fatherHusbandName} onChange={(e) => updateField("fatherHusbandName", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={formData.department} onValueChange={(v) => updateField("department", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sub Department *</Label>
              <Select value={formData.subDepartment} onValueChange={(v) => updateField("subDepartment", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{subDepartments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employee Grade *</Label>
              <Input value={formData.employeeGrade} onChange={(e) => updateField("employeeGrade", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Attendance ID *</Label>
              <Input value={formData.attendanceId} onChange={(e) => updateField("attendanceId", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Designation *</Label>
              <Select value={formData.designation} onValueChange={(v) => updateField("designation", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{designations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Marital Status *</Label>
              <Select value={formData.maritalStatus} onValueChange={(v) => updateField("maritalStatus", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{maritalStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employment Status *</Label>
              <Select value={formData.employmentStatus} onValueChange={(v) => updateField("employmentStatus", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{employmentStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Probation / Internship Expiry Date *</Label>
              <Input type="date" value={formData.probationExpiryDate} onChange={(e) => updateField("probationExpiryDate", e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>CNIC Number *</Label>
              <Input placeholder="00000-0000000-0" value={formData.cnicNumber} onChange={(e) => updateField("cnicNumber", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>CNIC Expiry Date</Label>
              <Input type="date" value={formData.cnicExpiryDate} onChange={(e) => updateField("cnicExpiryDate", e.target.value)} disabled={isPending || formData.lifetimeCnic} />
              <div className="flex items-center gap-2 mt-1">
                <Checkbox id="lifetimeCnic" checked={formData.lifetimeCnic} onCheckedChange={(c) => updateField("lifetimeCnic", !!c)} />
                <label htmlFor="lifetimeCnic" className="text-sm">Lifetime CNIC</label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Joining Date *</Label>
              <Input type="date" value={formData.joiningDate} onChange={(e) => updateField("joiningDate", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <Input type="date" value={formData.dateOfBirth} onChange={(e) => updateField("dateOfBirth", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Nationality *</Label>
              <Select value={formData.nationality} onValueChange={(v) => updateField("nationality", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{nationalities.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select value={formData.gender} onValueChange={(v) => updateField("gender", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{genders.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contact Number *</Label>
              <Input placeholder="03XX-XXXXXXX" value={formData.contactNumber} onChange={(e) => updateField("contactNumber", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Number</Label>
              <Input value={formData.emergencyContactNumber} onChange={(e) => updateField("emergencyContactNumber", e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Person Name</Label>
              <Input value={formData.emergencyContactPersonName} onChange={(e) => updateField("emergencyContactPersonName", e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Personal Email</Label>
              <Input type="email" value={formData.personalEmail} onChange={(e) => updateField("personalEmail", e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Official Email *</Label>
              <Input type="email" value={formData.officialEmail} onChange={(e) => updateField("officialEmail", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Country *</Label>
              <Input value={formData.country} onChange={(e) => updateField("country", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Province *</Label>
              <Select value={formData.province} onValueChange={(v) => updateField("province", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{provinces.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Select value={formData.city} onValueChange={(v) => updateField("city", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Area</Label>
              <Input value={formData.area} onChange={(e) => updateField("area", e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Employee Salary (Compensation) *</Label>
              <Input type="number" value={formData.employeeSalary} onChange={(e) => updateField("employeeSalary", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>EOBI</Label>
              <div className="flex items-center gap-4 h-10">
                <Checkbox id="eobi" checked={formData.eobi} onCheckedChange={(c) => updateField("eobi", !!c)} />
                <label htmlFor="eobi" className="text-sm">Applicable</label>
              </div>
            </div>
            {formData.eobi && (
              <div className="space-y-2">
                <Label>EOBI Number</Label>
                <Input value={formData.eobiNumber} onChange={(e) => updateField("eobiNumber", e.target.value)} disabled={isPending} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Provident Fund</Label>
              <div className="flex items-center gap-4 h-10">
                <Checkbox id="pf" checked={formData.providentFund} onCheckedChange={(c) => updateField("providentFund", !!c)} />
                <label htmlFor="pf" className="text-sm">Applicable</label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Overtime Applicable</Label>
              <div className="flex items-center gap-4 h-10">
                <Checkbox id="ot" checked={formData.overtimeApplicable} onCheckedChange={(c) => updateField("overtimeApplicable", !!c)} />
                <label htmlFor="ot" className="text-sm">Yes</label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Days Off</Label>
              <Select value={formData.daysOff} onValueChange={(v) => updateField("daysOff", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{daysOff.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reporting Manager *</Label>
              <Input value={formData.reportingManager} onChange={(e) => updateField("reportingManager", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Working Hours Policy *</Label>
              <Input value={formData.workingHoursPolicy} onChange={(e) => updateField("workingHoursPolicy", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Branch *</Label>
              <Input value={formData.branch} onChange={(e) => updateField("branch", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Leaves Policy *</Label>
              <Input value={formData.leavesPolicy} onChange={(e) => updateField("leavesPolicy", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Allow Remote Attendance</Label>
              <div className="flex items-center gap-4 h-10">
                <Checkbox id="remote" checked={formData.allowRemoteAttendance} onCheckedChange={(c) => updateField("allowRemoteAttendance", !!c)} />
                <label htmlFor="remote" className="text-sm">Yes</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Address</Label>
              <Textarea value={formData.currentAddress} onChange={(e) => updateField("currentAddress", e.target.value)} disabled={isPending} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Permanent Address</Label>
              <Textarea value={formData.permanentAddress} onChange={(e) => updateField("permanentAddress", e.target.value)} disabled={isPending} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Bank Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Account Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Bank Name *</Label>
              <Select value={formData.bankName} onValueChange={(v) => updateField("bankName", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{banks.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Account Number *</Label>
              <Input value={formData.accountNumber} onChange={(e) => updateField("accountNumber", e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label>Account Title *</Label>
              <Input value={formData.accountTitle} onChange={(e) => updateField("accountTitle", e.target.value)} required disabled={isPending} />
            </div>
          </CardContent>
        </Card>

        {/* Employee Items Issued */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Items Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              {[
                { id: "laptop", label: "Laptop" },
                { id: "card", label: "Card" },
                { id: "mobileSim", label: "Mobile / Sim" },
                { id: "key", label: "Key" },
                { id: "tools", label: "Tools" },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    id={item.id}
                    checked={formData[item.id as keyof typeof formData] as boolean}
                    onCheckedChange={(c) => updateField(item.id, !!c)}
                  />
                  <label htmlFor={item.id} className="text-sm">{item.label}</label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Document Uploads</CardTitle>
            <CardDescription>Upload required documents (multiple files supported)</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUploadField label="Upload CV" fieldKey="cv" />
            <FileUploadField label="Upload Education Degrees" fieldKey="educationDegrees" />
            <FileUploadField label="Upload Passport Size Photos (2)" fieldKey="passportPhotos" />
            <FileUploadField label="Upload CNIC" fieldKey="cnic" />
            <FileUploadField label="Clearance Letter (if any)" fieldKey="clearanceLetter" />
            <FileUploadField label="Fit & Proper Criteria Form" fieldKey="fitProperCriteria" />
            <FileUploadField label="Affirmation – Company Service Rules" fieldKey="serviceRulesAffirmation" />
            <FileUploadField label="Affirmation – VIS Code of Conduct 2019" fieldKey="codeOfConduct" />
            <FileUploadField label="Upload Non-Disclosure Agreement (NDA)" fieldKey="nda" />
            <FileUploadField label="Information Secrecy / Confidentiality Form" fieldKey="secrecyForm" />
            <FileUploadField label="Investment Disclosure Form" fieldKey="investmentDisclosure" />
          </CardContent>
        </Card>

        {/* Login Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>Login Credentials</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select value={formData.accountType} onValueChange={(v) => updateField("accountType", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{accountTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex gap-2">
                <Input value={formData.password} onChange={(e) => updateField("password", e.target.value)} disabled={isPending} />
                <Button type="button" variant="outline" onClick={generatePassword} disabled={isPending}>
                  <Key className="h-4 w-4 mr-1" />
                  Generate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Roles</Label>
              <Select value={formData.roles} onValueChange={(v) => updateField("roles", v)} disabled={isPending}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-2 justify-center bottom-4 bg-background p-4  rounded-lg shadow-lg">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Employee
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}

