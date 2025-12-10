"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2, User, Edit } from "lucide-react";
import Link from "next/link";
import { getEmployeeById, type Employee } from "@/lib/actions/employee";

export default function ViewEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const result = await getEmployeeById(employeeId);
        if (result.status && result.data) {
          setEmployee(result.data as any);
        } else {
          toast.error(result.message || "Failed to fetch employee");
          router.push("/dashboard/employee/list");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        toast.error("Failed to fetch employee");
        router.push("/dashboard/employee/list");
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Employee not found</p>
        <Link href="/dashboard/employee/list">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </Link>
      </div>
    );
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatCNIC = (cnic: string) => {
    if (!cnic) return "N/A";
    const cleaned = cnic.replace(/-/g, "");
    if (cleaned.length === 13) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
    }
    return cnic;
  };

  return (
    <div className="max-w-[90%] mx-auto pb-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard/employee/list">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </Link>
        <Link href={`/dashboard/employee/edit/${employeeId}`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Employee
          </Button>
        </Link>
      </div>

      <div className="border rounded-xl p-4 space-y-6">
      
  {/* Profile Header */}
<Card className="border-none shadow-none">
  <CardHeader>
    <div className="flex flex-col items-center text-center gap-4">

      {/* Centered Profile Image */}
      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-border">
        <User className="w-16 h-16 text-muted-foreground" />
      </div>

      {/* Name, ID, Status */}
      <div>
        <CardTitle className="text-2xl">{employee.employeeName}</CardTitle>
        <CardDescription className="text-base mt-1">
          {employee.employeeId}
        </CardDescription>

        <div className="mt-2">
          <Badge variant={employee.status === "active" ? "default" : "secondary"}>
            {employee.status}
          </Badge>
        </div>
      </div>

    </div>
  </CardHeader>
</Card>


{/* Basic Information */}
<Card className="border-none shadow-none">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
    <CardDescription>Employee personal & job-related details</CardDescription>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      {/** REUSABLE INFO BLOCK */}
 {[
  { label: "Employee ID", value: employee.employeeId },
  { label: "Employee Name", value: employee.employeeName },
  { label: "Father / Husband Name", value: employee.fatherHusbandName || "N/A" },
  { label: "Department", value: (employee as any).departmentName || employee.department || "N/A" },
  { label: "Sub Department", value: (employee as any).subDepartmentName || employee.subDepartment || "N/A" },
  { label: "Employee Grade", value: (employee as any).employeeGradeName || employee.employeeGrade || "N/A" },
  { label: "Attendance ID", value: employee.attendanceId || "N/A" },
  { label: "Designation", value: (employee as any).designationName || employee.designation || "N/A" },
  { label: "Marital Status", value: (employee as any).maritalStatusName || employee.maritalStatus || "N/A" },
  { label: "Employment Status", value: (employee as any).employmentStatusName || employee.employmentStatus || "N/A" },
  { label: "Probation Expiry Date", value: formatDate(employee.probationExpiryDate) },
  { label: "CNIC Number", value: formatCNIC(employee.cnicNumber) },
  { label: "CNIC Expiry Date", value: employee.lifetimeCnic ? "Lifetime" : formatDate(employee.cnicExpiryDate) },
  { label: "Joining Date", value: formatDate(employee.joiningDate) },
  { label: "Date of Birth", value: formatDate(employee.dateOfBirth) },
  { label: "Nationality", value: employee.nationality || "N/A" },
  { label: "Gender", value: employee.gender || "N/A" },
  { label: "Contact Number", value: employee.contactNumber || "N/A" },
  { label: "Emergency Contact Number", value: employee.emergencyContactNumber || "N/A" },
  { label: "Emergency Contact Person", value: employee.emergencyContactPerson || "N/A" },
  { label: "Personal Email", value: employee.personalEmail || "N/A" },
  { label: "Official Email", value: employee.officialEmail || "N/A" },
  { label: "Country", value: employee.country || "N/A" },
  { label: "State / Province", value: (employee as any).provinceName || employee.province || "N/A" },
  { label: "City", value: (employee as any).cityName || employee.city || "N/A" },
  { label: "Employee Salary", value: `PKR ${Number(employee.employeeSalary).toLocaleString()}` },
  { label: "EOBI", value: employee.eobi ? "Yes" : "No" },
  ...(employee.eobi ? [{ label: "EOBI Number", value: employee.eobiNumber || "N/A" }] : []),
  { label: "Provident Fund", value: employee.providentFund ? "Yes" : "No" },
  { label: "Overtime Applicable", value: employee.overtimeApplicable ? "Yes" : "No" },
  { label: "Days Off", value: employee.daysOff || "N/A" },
  { label: "Reporting Manager", value: employee.reportingManager || "N/A" },
  { label: "Working Hours Policy", value: (employee as any).workingHoursPolicyName || employee.workingHoursPolicy || "N/A" },
  { label: "Branch", value: (employee as any).branchName || employee.branch || "N/A" },
  { label: "Leaves Policy", value: (employee as any).leavesPolicyName || employee.leavesPolicy || "N/A" },
  { label: "Allow Remote Attendance", value: employee.allowRemoteAttendance ? "Yes" : "No" },
].map((item, index) => (
  <div
    key={index}
    className="p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition"
  >
    <p className="text-xs text-muted-foreground">{item.label}</p>
    <p className="text-gray-900 font-semibold text-1xl mt-1">
      {item.value}
    </p>
  </div>
))}


    </div>
  </CardContent>
</Card>










{/* Address Information */}
<Card className="border-none shadow-none">
  <CardHeader>
    <CardTitle>Address Information</CardTitle>
  </CardHeader>

  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[
      { label: "Current Address", value: employee.currentAddress },
      { label: "Permanent Address", value: employee.permanentAddress },
    ].map((item, index) => (
      <div
        key={index}
        className="p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition"
      >
        <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
        <p className="text-gray-900 font-semibold text-1xl mt-1">
          {item.value || "N/A"}
        </p>
      </div>
    ))}
  </CardContent>
</Card>



{/* Bank Account Details */}
<Card className="border-none shadow-none">
  <CardHeader>
    <CardTitle>Bank Account Details</CardTitle>
  </CardHeader>

  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      { label: "Bank Name", value: employee.bankName },
      { label: "Account Number", value: employee.accountNumber },
      { label: "Account Title", value: employee.accountTitle },
    ].map((item, index) => (
      <div
        key={index}
        className="p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition"
      >
        <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
        <p className="text-gray-900 font-semibold text-1xl mt-1">
          {item.value || "N/A"}
        </p>
      </div>
    ))}
  </CardContent>
</Card>


{/* Equipment Issued */}
<Card className="border-none shadow-none">
  <CardHeader>
    <CardTitle>Equipment Issued</CardTitle>
  </CardHeader>

  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      { label: "Mouse", value: employee.mouse },
    ].map((item, index) => {
      const valStr = item.value ? "Issued" : "Not Issued";

      return (
        <div
          key={index}
          className="p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 transition"
        >
          <p className="text-xs font-medium text-muted-foreground">
            {item.label}
          </p>

          <p className="text-gray-900 font-semibold text-1xl mt-1">
            {valStr}
          </p>
        </div>
      );
    })}
  </CardContent>
</Card>





        {/* Login Credentials */}
        {(employee.accountType || employee.roles) && (
          <Card>
            <CardHeader>
              <CardTitle>Login Credentials</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employee.accountType && (
                <div>
                  <Label className="text-xs text-muted-foreground">Account Type</Label>
                  <p className="font-medium">{employee.accountType}</p>
                </div>
              )}
              {employee.roles && (
                <div>
                  <Label className="text-xs text-muted-foreground">Roles</Label>
                  <p className="font-medium">{employee.roles}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


