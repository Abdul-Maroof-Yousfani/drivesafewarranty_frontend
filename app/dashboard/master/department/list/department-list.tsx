"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Department, updateDepartment, deleteDepartment } from "@/lib/actions/department";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";

interface DepartmentListProps {
  initialDepartments: Department[];
}

export function DepartmentList({ initialDepartments }: DepartmentListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Edit dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);

  const filteredDepartments = initialDepartments.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setEditDialog(true);
  };

  const handleEditSubmit = async (formData: FormData) => {
    if (!editingDept) return;

    startTransition(async () => {
      const result = await updateDepartment(editingDept.id, formData);
      if (result.status) {
        toast.success(result.message);
        setEditDialog(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = (dept: Department) => {
    setDeletingDept(dept);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDept) return;

    startTransition(async () => {
      const result = await deleteDepartment(deletingDept.id);
      if (result.status) {
        toast.success(result.message);
        setDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">Manage your organization departments</p>
        </div>
        <Link href="/dashboard/master/department/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Department List</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDepartments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? "No departments found matching your search" : "No departments found. Create one to get started."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Sub-departments</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((dept, index) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.subDepartments?.length || 0}</TableCell>
                    <TableCell>{new Date(dept.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(dept)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(dept)}>
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
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update the department name</DialogDescription>
          </DialogHeader>
          <form action={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Department Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingDept?.name}
                  disabled={isPending}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingDept?.name}&quot;? This will also delete all sub-departments under it. This action cannot be undone.
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

