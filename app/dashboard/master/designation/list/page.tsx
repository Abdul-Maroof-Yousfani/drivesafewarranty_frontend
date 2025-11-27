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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search, Printer, Download } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

interface Designation {
  id: number;
  name: string;
  createdBy?: string;
  status?: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export default function DesignationListPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const tableRef = useRef<HTMLTableElement>(null);

  // Edit dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [editName, setEditName] = useState("");

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingDesignation, setDeletingDesignation] = useState<Designation | null>(null);

  const fetchDesignations = async () => {
    try {
      const res = await fetch(`${API_BASE}/designations`);
      const data = await res.json();
      if (data.status && data.data.length > 0) {
        setDesignations(data.data);
      } else {
        // Sample data when API returns empty or fails
        setDesignations([
          { id: 1, name: "Software Engineer", createdBy: "Admin", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch designations:", error);
      // Sample data when API fails
      setDesignations([
        { id: 1, name: "Software Engineer", createdBy: "Admin", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const filteredDesignations = designations.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (designation: Designation) => {
    setEditingDesignation(designation);
    setEditName(designation.name);
    setEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!editingDesignation || !editName.trim()) return;

    startTransition(async () => {
      try {
        const res = await fetch(`${API_BASE}/designations/${editingDesignation.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editName }),
        });
        const data = await res.json();
        if (data.status) {
          toast.success(data.message || "Designation updated successfully");
          setEditDialog(false);
          fetchDesignations();
        } else {
          toast.error(data.message || "Failed to update designation");
        }
      } catch (error) {
        toast.error("Failed to update designation");
      }
    });
  };

  const handleDelete = (designation: Designation) => {
    setDeletingDesignation(designation);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDesignation) return;

    startTransition(async () => {
      try {
        const res = await fetch(`${API_BASE}/designations/${deletingDesignation.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.status) {
          toast.success(data.message || "Designation deleted successfully");
          setDeleteDialog(false);
          fetchDesignations();
        } else {
          toast.error(data.message || "Failed to delete designation");
        }
      } catch (error) {
        toast.error("Failed to delete designation");
      }
    });
  };

  const handlePrint = () => {
    const printContent = tableRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Designation List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            h1 { text-align: center; }
            .no-print { display: none; }
          </style>
        </head>
        <body>
          <h1>Designation List</h1>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Designation Name</th>
                <th>Created By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDesignations
                .map(
                  (d, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${d.name}</td>
                  <td>${d.createdBy || "Admin"}</td>
                  <td>${d.status || "Active"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    const headers = ["S.No", "Designation Name", "Created By", "Status", "Created At"];
    const rows = filteredDesignations.map((d, i) => [
      i + 1,
      d.name,
      d.createdBy || "Admin",
      d.status || "Active",
      new Date(d.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `designations_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("CSV exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Designations</h2>
          <p className="text-muted-foreground">Manage designations for your organization</p>
        </div>
        <Link href="/dashboard/master/designation/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Designation
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Designation List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search designations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon" onClick={handlePrint} title="Print">
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleExportCSV} title="Export CSV">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDesignations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search
                ? "No designations found matching your search"
                : "No designations found. Create one to get started."}
            </div>
          ) : (
            <Table ref={tableRef}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S.No</TableHead>
                  <TableHead>Designation Name</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDesignations.map((designation, index) => (
                  <TableRow key={designation.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{designation.name}</TableCell>
                    <TableCell>{designation.createdBy || "Admin"}</TableCell>
                    <TableCell>
                      <Badge variant={designation.status === "inactive" ? "secondary" : "default"}>
                        {designation.status || "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(designation)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(designation)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Designation</DialogTitle>
            <DialogDescription>Update the designation name</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Designation Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={isPending}
                placeholder="Enter designation name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Designation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingDesignation?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

