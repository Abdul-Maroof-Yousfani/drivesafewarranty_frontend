"use client";

import { useState } from "react";
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
import { Plus, Pencil, Trash2, Printer, FileDown, Search } from "lucide-react";
import { SalaryBreakup } from "@/lib/actions/salary-breakup";

type SalaryBreakupRow = {
  id: string;
  salaryType: string;
  percent: number;
  isTaxable: boolean;
  createdBy: string;
  status: "Active" | "Inactive";
};

export function SalaryBreakupList({
  initialSalaryBreakups,
}: {
  initialSalaryBreakups: SalaryBreakup[];
}) {
  type Entry = { typeName: string; percent: number; isTaxable: boolean };
  const rows: SalaryBreakupRow[] = initialSalaryBreakups.flatMap((sb) => {
    let details: Entry[] = [];
    if (Array.isArray(sb.details)) details = sb.details as Entry[];
    else if (typeof sb.details === "string" && sb.details) {
      try {
        details = JSON.parse(sb.details) as Entry[];
      } catch {
        details = [];
      }
    }
    return details.map((d, i) => ({
      id: `${sb.id}-${i}`,
      salaryType: d.typeName || "",
      percent: d.percent || 0,
      isTaxable: !!d.isTaxable,
      createdBy: sb.createdBy || "",
      status: sb.status === "active" ? "Active" : "Inactive",
    }));
  });

  const [search, setSearch] = useState("");
  const [data, setData] = useState<SalaryBreakupRow[]>(rows);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selected, setSelected] = useState<SalaryBreakupRow | null>(null);
  const [editForm, setEditForm] = useState({ salaryType: "", percent: "" });

  const filtered = data.filter((item) =>
    item.salaryType.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (item: SalaryBreakupRow) => {
    setSelected(item);
    setEditForm({ salaryType: item.salaryType, percent: item.percent.toString() });
    setEditDialog(true);
  };

  const handleEditSave = () => {
    if (!selected || !editForm.salaryType.trim()) return;
    setData(
      data.map((d) =>
        d.id === selected.id
          ? { ...d, salaryType: editForm.salaryType, percent: parseFloat(editForm.percent) }
          : d
      )
    );
    toast.success("Salary breakup updated successfully");
    setEditDialog(false);
  };

  const handleDelete = (item: SalaryBreakupRow) => {
    setSelected(item);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!selected) return;
    setData(data.filter((d) => d.id !== selected.id));
    toast.success("Salary breakup deleted successfully");
    setDeleteDialog(false);
  };

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    const csv = [
      ["S.No", "Salary Type", "Percent (%)", "Created By", "Status"],
      ...filtered.map((item, i) => [i + 1, item.salaryType, item.percent, item.createdBy, item.status]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "salary-breakup.csv";
    a.click();
    toast.success("CSV exported successfully");
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">View Salary Breakup List</h2>
          <p className="text-sm text-muted-foreground">Manage salary breakup types</p>
        </div>
        <Link href="/dashboard/master/salary-breakup/add">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Salary Breakup
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <CardTitle className="text-lg">Salary Breakup List</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} className="flex-1 sm:flex-none">
                  <Printer className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex-1 sm:flex-none">
                  <FileDown className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">S.No</TableHead>
                <TableHead>Salary Type</TableHead>
                <TableHead>Percent (%)</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.salaryType}</TableCell>
                  <TableCell>{item.percent}%</TableCell>
                  <TableCell>{item.createdBy}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Active" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Salary Breakup</DialogTitle>
            <DialogDescription>Update salary breakup details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Salary Type</Label>
              <Input
                value={editForm.salaryType}
                onChange={(e) => setEditForm({ ...editForm, salaryType: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Percent (%)</Label>
              <Input
                type="number"
                value={editForm.percent}
                onChange={(e) => setEditForm({ ...editForm, percent: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Salary Breakup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selected?.salaryType}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
