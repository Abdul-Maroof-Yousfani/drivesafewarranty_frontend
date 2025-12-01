"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HighlightText } from "@/components/common/data-table";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EllipsisIcon, Loader2, Pencil, Trash2, Clock } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WorkingHoursPolicy, updateWorkingHoursPolicy, deleteWorkingHoursPolicy } from "@/lib/actions/working-hours-policy";
import { cn } from "@/lib/utils";

export type WorkingHoursPolicyRow = WorkingHoursPolicy & { id: string; sno?: number };

export const columns: ColumnDef<WorkingHoursPolicyRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 28,
  },
  {
    header: "S.No",
    accessorKey: "sno",
    size: 60,
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return pageIndex * pageSize + row.index + 1;
    },
    enableSorting: false,
  },
  {
    header: "Policy Name",
    accessorKey: "name",
    size: 200,
    enableSorting: true,
    cell: ({ row }) => <HighlightText text={row.original.name} />,
  },
  {
    header: "Start Time",
    accessorKey: "startWorkingHours",
    size: 120,
    enableSorting: true,
    cell: ({ row }) => (
      <HighlightText text={row.original.startWorkingHours || "N/A"} />
    ),
  },
  {
    header: "End Time",
    accessorKey: "endWorkingHours",
    size: 120,
    enableSorting: true,
    cell: ({ row }) => (
      <HighlightText text={row.original.endWorkingHours || "N/A"} />
    ),
  },
  {
    header: "Late Time",
    accessorKey: "lateStartTime",
    size: 120,
    enableSorting: true,
    cell: ({ row }) => (
      <HighlightText text={row.original.lateStartTime || "N/A"} />
    ),
  },
  {
    header: "Half Day Time",
    accessorKey: "halfDayStartTime",
    size: 130,
    enableSorting: true,
    cell: ({ row }) => (
      <HighlightText text={row.original.halfDayStartTime || "N/A"} />
    ),
  },
  {
    header: "Created By",
    accessorKey: "createdBy",
    size: 150,
    enableSorting: true,
    cell: ({ row }) => (
      <HighlightText text={row.original.createdBy || "N/A"} />
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    size: 100,
    enableSorting: true,
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "inactive" ? "secondary" : "default"}
      >
        {row.original.status || "active"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];

type RowActionsProps = {
  row: Row<WorkingHoursPolicyRow>;
};

const TimePicker = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const currentHours = value ? value.split(":")[0] : "";
  const currentMinutes = value ? value.split(":")[1] : "";
  const [hours, setHours] = useState(currentHours);
  const [minutes, setMinutes] = useState(currentMinutes);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHours(h || "");
      setMinutes(m || "");
    } else {
      setHours("");
      setMinutes("");
    }
  }, [value]);

  const handleHourChange = (h: string) => {
    setHours(h);
    if (h && minutes) {
      onChange(`${h.padStart(2, "0")}:${minutes.padStart(2, "0")}`);
    } else if (h && !minutes) {
      setMinutes("00");
      onChange(`${h.padStart(2, "0")}:00`);
    }
  };

  const handleMinuteChange = (m: string) => {
    setMinutes(m);
    if (hours && m) {
      onChange(`${hours.padStart(2, "0")}:${m.padStart(2, "0")}`);
    } else if (!hours && m) {
      setHours("00");
      onChange(`00:${m.padStart(2, "0")}`);
    }
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const formatTimeForDisplay = (time: string): string => {
    if (!time) return "--:--";
    const [h, m] = time.split(":");
    return `${h}:${m}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTimeForDisplay(value) : "--:--"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex gap-2 items-center">
          <div className="space-y-2">
            <Label className="text-xs">Hour</Label>
            <Select
              value={hours}
              onValueChange={handleHourChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {hourOptions.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-2xl font-bold mt-6">:</span>
          <div className="space-y-2">
            <Label className="text-xs">Minute</Label>
            <Select
              value={minutes}
              onValueChange={handleMinuteChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {minuteOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

function RowActions({ row }: RowActionsProps) {
  const policy = row.original;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  const [editData, setEditData] = useState({
    name: policy.name,
    startWorkingHours: policy.startWorkingHours,
    endWorkingHours: policy.endWorkingHours,
    shortDayUnit: "mins" as "hours" | "mins",
    shortDayValue: policy.shortDayMins ? policy.shortDayMins.toString() : "",
    startBreakTime: policy.startBreakTime || "",
    endBreakTime: policy.endBreakTime || "",
    halfDayStartTime: policy.halfDayStartTime || "",
    lateStartTime: policy.lateStartTime || "",
    lateDeductionType: policy.lateDeductionType || "",
    applyDeductionAfterLates: policy.applyDeductionAfterLates?.toString() || "",
    lateDeductionPercent: policy.lateDeductionPercent?.toString() || "",
    halfDayDeductionType: policy.halfDayDeductionType || "",
    applyDeductionAfterHalfDays: policy.applyDeductionAfterHalfDays?.toString() || "",
    halfDayDeductionAmount: policy.halfDayDeductionAmount?.toString() || "",
    shortDayDeductionType: policy.shortDayDeductionType || "",
    applyDeductionAfterShortDays: policy.applyDeductionAfterShortDays?.toString() || "",
    shortDayDeductionAmount: policy.shortDayDeductionAmount?.toString() || "",
    overtimeRate: policy.overtimeRate?.toString() || "",
    gazzetedOvertimeRate: policy.gazzetedOvertimeRate?.toString() || "",
    status: policy.status,
  });

  useEffect(() => {
    if (policy.shortDayMins) {
      if (policy.shortDayMins % 60 === 0) {
        setEditData(prev => ({
          ...prev,
          shortDayUnit: "hours",
          shortDayValue: (policy.shortDayMins! / 60).toString(),
        }));
      } else {
        setEditData(prev => ({
          ...prev,
          shortDayUnit: "mins",
          shortDayValue: policy.shortDayMins!.toString(),
        }));
      }
    }
  }, [policy.shortDayMins]);

  const calculateShortDayMins = (): number | null => {
    if (!editData.shortDayValue) return null;
    const value = parseFloat(editData.shortDayValue);
    if (isNaN(value)) return null;
    return editData.shortDayUnit === "hours" ? value * 60 : value;
  };

  const overtimeRateOptions = [
    { value: "0.5", label: "x0.5" },
    { value: "1", label: "x1" },
    { value: "1.5", label: "x1.5" },
    { value: "2", label: "x2" },
    { value: "2.5", label: "x2.5" },
    { value: "3", label: "x3" },
  ];

  const handleEditSubmit = async () => {
    if (!editData.name.trim()) {
      toast.error("Policy name is required");
      return;
    }

    if (!editData.startWorkingHours || !editData.endWorkingHours) {
      toast.error("Start and end working hours are required");
      return;
    }

    const shortDayMins = calculateShortDayMins();

    startTransition(async () => {
      const result = await updateWorkingHoursPolicy(policy.id, {
        name: editData.name.trim(),
        startWorkingHours: editData.startWorkingHours,
        endWorkingHours: editData.endWorkingHours,
        shortDayMins,
        startBreakTime: editData.startBreakTime || null,
        endBreakTime: editData.endBreakTime || null,
        halfDayStartTime: editData.halfDayStartTime || null,
        lateStartTime: editData.lateStartTime || null,
        lateDeductionType: editData.lateDeductionType || null,
        applyDeductionAfterLates: editData.applyDeductionAfterLates ? parseInt(editData.applyDeductionAfterLates) : null,
        lateDeductionPercent: editData.lateDeductionPercent ? parseFloat(editData.lateDeductionPercent) : null,
        halfDayDeductionType: editData.halfDayDeductionType || null,
        applyDeductionAfterHalfDays: editData.applyDeductionAfterHalfDays ? parseInt(editData.applyDeductionAfterHalfDays) : null,
        halfDayDeductionAmount: editData.halfDayDeductionAmount ? parseFloat(editData.halfDayDeductionAmount) : null,
        shortDayDeductionType: editData.shortDayDeductionType || null,
        applyDeductionAfterShortDays: editData.applyDeductionAfterShortDays ? parseInt(editData.applyDeductionAfterShortDays) : null,
        shortDayDeductionAmount: editData.shortDayDeductionAmount ? parseFloat(editData.shortDayDeductionAmount) : null,
        overtimeRate: editData.overtimeRate ? parseFloat(editData.overtimeRate) : null,
        gazzetedOvertimeRate: editData.gazzetedOvertimeRate ? parseFloat(editData.gazzetedOvertimeRate) : null,
        status: editData.status,
      });
      if (result.status) {
        toast.success(result.message || "Working hours policy updated successfully");
        setEditDialog(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update working hours policy");
      }
    });
  };

  const handleDeleteConfirm = async () => {
    startTransition(async () => {
      const result = await deleteWorkingHoursPolicy(policy.id);
      if (result.status) {
        toast.success(result.message || "Working hours policy deleted successfully");
        setDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete working hours policy");
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button
              size="icon"
              variant="ghost"
              className="shadow-none"
              aria-label="Actions"
            >
              <EllipsisIcon size={16} />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditDialog(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Working Hours Policy</DialogTitle>
            <DialogDescription>
              Update the working hours policy details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Working Hours Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Working Hours Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Policy Name *</Label>
                  <Input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    disabled={isPending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Working Hours Time *</Label>
                  <TimePicker
                    value={editData.startWorkingHours}
                    onChange={(value) =>
                      setEditData({ ...editData, startWorkingHours: value })
                    }
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Working Hours Time *</Label>
                  <TimePicker
                    value={editData.endWorkingHours}
                    onChange={(value) =>
                      setEditData({ ...editData, endWorkingHours: value })
                    }
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Short Day Mins</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="eg: 270"
                      value={editData.shortDayValue}
                      onChange={(e) =>
                        setEditData({ ...editData, shortDayValue: e.target.value })
                      }
                      disabled={isPending}
                      className="flex-1"
                    />
                    <Select
                      value={editData.shortDayUnit}
                      onValueChange={(value: "hours" | "mins") =>
                        setEditData({ ...editData, shortDayUnit: value })
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="mins">Mins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Start Break Time</Label>
                  <TimePicker
                    value={editData.startBreakTime}
                    onChange={(value) =>
                      setEditData({ ...editData, startBreakTime: value })
                    }
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Break Time</Label>
                  <TimePicker
                    value={editData.endBreakTime}
                    onChange={(value) =>
                      setEditData({ ...editData, endBreakTime: value })
                    }
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Half Day Start Time</Label>
                  <TimePicker
                    value={editData.halfDayStartTime}
                    onChange={(value) =>
                      setEditData({ ...editData, halfDayStartTime: value })
                    }
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Late Start Time</Label>
                  <TimePicker
                    value={editData.lateStartTime}
                    onChange={(value) =>
                      setEditData({ ...editData, lateStartTime: value })
                    }
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Deductions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Late Deduction Type</Label>
                  <Select
                    value={editData.lateDeductionType || undefined}
                    onValueChange={(value) =>
                      setEditData({ ...editData, lateDeductionType: value })
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Deduction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Deduct as Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Apply Deduction After (Number of Lates)</Label>
                  <Select
                    value={editData.applyDeductionAfterLates || undefined}
                    onValueChange={(value) =>
                      setEditData({ ...editData, applyDeductionAfterLates: value })
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          After {num} Late{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Late Deduction Percent</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter percentage"
                    value={editData.lateDeductionPercent}
                    onChange={(e) =>
                      setEditData({ ...editData, lateDeductionPercent: e.target.value })
                    }
                    disabled={isPending || !editData.lateDeductionType}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Half-Day Deduction Type</Label>
                  <Select
                    value={editData.halfDayDeductionType || undefined}
                    onValueChange={(value) =>
                      setEditData({ ...editData, halfDayDeductionType: value })
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Deduction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Deduct as Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Apply Deduction After (Number of Half-Days)</Label>
                  <Select
                    value={editData.applyDeductionAfterHalfDays || undefined}
                    onValueChange={(value) =>
                      setEditData({ ...editData, applyDeductionAfterHalfDays: value })
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          After {num} Half-Day{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Deduction Percent</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter deduction percent"
                    value={editData.halfDayDeductionAmount}
                    onChange={(e) =>
                      setEditData({ ...editData, halfDayDeductionAmount: e.target.value })
                    }
                    disabled={isPending || !editData.halfDayDeductionType}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Short-Day Deduction Type</Label>
                  <Select
                    value={editData.shortDayDeductionType || undefined}
                    onValueChange={(value) =>
                      setEditData({ ...editData, shortDayDeductionType: value })
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Deduction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Deduct as Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Apply Deduction After (Number of Short-Days)</Label>
                  <Select
                    value={editData.applyDeductionAfterShortDays || undefined}
                    onValueChange={(value) =>
                      setEditData({ ...editData, applyDeductionAfterShortDays: value })
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          After {num} Short-Day{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Deduction Percent</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter deduction percent"
                    value={editData.shortDayDeductionAmount}
                    onChange={(e) =>
                      setEditData({ ...editData, shortDayDeductionAmount: e.target.value })
                    }
                    disabled={isPending || !editData.shortDayDeductionType}
                  />
                </div>
              </div>
            </div>

            {/* Overtime Rates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Overtime Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Overtime Rate</Label>
                  <Select
                    value={editData.overtimeRate || undefined}
                    onValueChange={(value) =>
                      setEditData({ ...editData, overtimeRate: value })
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select overtime rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {overtimeRateOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Gazzeted Overtime Rate</Label>
                  <Select
                    value={editData.gazzetedOvertimeRate || undefined}
                    onValueChange={(value) =>
                      setEditData({ ...editData, gazzetedOvertimeRate: value })
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gazzeted overtime rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {overtimeRateOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Working Hours Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{policy.name}&quot;? This action cannot be undone.
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
    </>
  );
}

