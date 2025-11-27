"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Printer,
  Download,
  MoreHorizontal,
  Eye,
  History,
  UserX,
} from "lucide-react";

interface Employee {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  contactNumber: string;
  officialEmail: string;
  bankName: string;
  accountNumber: string;
  currentAddress: string;
  city: string;
  salary: number;
  status: "active" | "inactive";
  joiningDate: string;
}

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const tableRef = useRef<HTMLTableElement>(null);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    // Sample data
    setEmployees([
      {
        id: 1,
        employeeId: "EMP001",
        employeeName: "Ahmed Khan",
        department: "IT",
        designation: "Software Engineer",
        contactNumber: "0300-1234567",
        officialEmail: "ahmed@company.com",
        bankName: "HBL",
        accountNumber: "1234567890",
        currentAddress: "House 123, Street 5",
        city: "Islamabad",
        salary: 150000,
        status: "active",
        joiningDate: "2023-01-15",
      },
      {
        id: 2,
        employeeId: "EMP002",
        employeeName: "Sara Ali",
        department: "HR",
        designation: "HR Manager",
        contactNumber: "0321-9876543",
        officialEmail: "sara@company.com",
        bankName: "MCB",
        accountNumber: "0987654321",
        currentAddress: "Flat 45, Block B",
        city: "Lahore",
        salary: 180000,
        status: "active",
        joiningDate: "2022-06-20",
      },
    ]);
    setLoading(false);
  }, []);

  const filteredEmployees = employees.filter(
    (e) =>
      e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (employee: Employee) => {
    setDeletingEmployee(employee);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmployee) return;
    startTransition(async () => {
      setEmployees(employees.filter((e) => e.id !== deletingEmployee.id));
      toast.success("Employee deleted successfully");
      setDeleteDialog(false);
    });
  };

  const handleToggleStatus = (employee: Employee) => {
    setEmployees(
      employees.map((e) =>
        e.id === employee.id
          ? { ...e, status: e.status === "active" ? "inactive" : "active" }
          : e
      )
    );
    toast.success(`Employee ${employee.status === "active" ? "deactivated" : "activated"}`);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Employee List</title>
      <style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#f4f4f4}h1{text-align:center}</style>
      </head><body><h1>Employee List</h1>
      <table><thead><tr><th>S.No</th><th>Emp ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Contact</th><th>Bank</th><th>Salary</th><th>Status</th></tr></thead>
      <tbody>${filteredEmployees.map((e, i) => `<tr><td>${i + 1}</td><td>${e.employeeId}</td><td>${e.employeeName}</td><td>${e.department}</td><td>${e.designation}</td><td>${e.contactNumber}</td><td>${e.bankName}</td><td>${e.salary.toLocaleString()}</td><td>${e.status}</td></tr>`).join("")}</tbody></table></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    const headers = ["S.No", "Emp ID", "Name", "Department", "Designation", "Contact", "Email", "Bank", "Account", "Address", "City", "Salary", "Status"];
    const rows = filteredEmployees.map((e, i) => [i + 1, e.employeeId, e.employeeName, e.department, e.designation, e.contactNumber, e.officialEmail, e.bankName, e.accountNumber, e.currentAddress, e.city, e.salary, e.status]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">Manage employee records</p>
        </div>
        <Link href="/dashboard/employee/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Employee List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant="outline" size="icon" onClick={handlePrint} title="Print"><Printer className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={handleExportCSV} title="Export CSV"><Download className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{search ? "No employees found" : "No employees. Create one to get started."}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table ref={tableRef}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">S.No</TableHead>
                    <TableHead>Emp Details</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp, index) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{emp.employeeName}</div>
                          <div className="text-xs text-muted-foreground">{emp.employeeId}</div>
                          <div className="text-xs text-muted-foreground">{emp.department} • {emp.designation}</div>
                          <div className="text-xs text-muted-foreground">{emp.contactNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{emp.bankName}</div>
                          <div className="text-xs text-muted-foreground">{emp.accountNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-[200px]">
                          <div className="text-sm truncate">{emp.currentAddress}</div>
                          <div className="text-xs text-muted-foreground">{emp.city}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">PKR {emp.salary.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={emp.status === "active" ? "default" : "secondary"}>
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><History className="h-4 w-4 mr-2" />View Log</DropdownMenuItem>
                            <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                            <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(emp)}>
                              <UserX className="h-4 w-4 mr-2" />{emp.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(emp)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingEmployee?.employeeName}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

