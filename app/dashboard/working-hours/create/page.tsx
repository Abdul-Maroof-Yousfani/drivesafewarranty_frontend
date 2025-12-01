"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createWorkingHoursPolicy } from "@/lib/actions/working-hours-policy";

export default function CreateWorkingHoursPolicyPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Working Hours Details
  const [policyName, setPolicyName] = useState("");
  const [startWorkingHours, setStartWorkingHours] = useState("");
  const [endWorkingHours, setEndWorkingHours] = useState("");
  const [shortDayUnit, setShortDayUnit] = useState<"hours" | "mins">("mins");
  const [shortDayValue, setShortDayValue] = useState("");
  const [startBreakTime, setStartBreakTime] = useState("");
  const [endBreakTime, setEndBreakTime] = useState("");
  const [halfDayStartTime, setHalfDayStartTime] = useState("");
  const [lateStartTime, setLateStartTime] = useState("");

  // Deductions For Late
  const [lateDeductionType, setLateDeductionType] = useState("");
  const [applyDeductionAfterLates, setApplyDeductionAfterLates] = useState("");
  const [lateDeductionPercent, setLateDeductionPercent] = useState("");

  // Deductions For Half-Day
  const [halfDayDeductionType, setHalfDayDeductionType] = useState("");
  const [applyDeductionAfterHalfDays, setApplyDeductionAfterHalfDays] =
    useState("");
  const [halfDayDeductionAmount, setHalfDayDeductionAmount] = useState("");

  // Deductions For Short-Day
  const [shortDayDeductionType, setShortDayDeductionType] = useState("");
  const [applyDeductionAfterShortDays, setApplyDeductionAfterShortDays] =
    useState("");
  const [shortDayDeductionAmount, setShortDayDeductionAmount] = useState("");

  // Overtime Rates
  const [overtimeRate, setOvertimeRate] = useState("");
  const [gazzetedOvertimeRate, setGazzetedOvertimeRate] = useState("");

  const overtimeRateOptions = [
    { value: "0.5", label: "x0.5" },
    { value: "1", label: "x1" },
    { value: "1.5", label: "x1.5" },
    { value: "2", label: "x2" },
    { value: "2.5", label: "x2.5" },
    { value: "3", label: "x3" },
  ];

  const calculateShortDayMins = (): number => {
    if (!shortDayValue) return 0;
    const value = parseFloat(shortDayValue);
    if (isNaN(value)) return 0;
    return shortDayUnit === "hours" ? value * 60 : value;
  };

  // Time picker helper functions
  const formatTimeForDisplay = (time: string): string => {
    if (!time) return "--:--";
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
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

    // Update local state when value prop changes
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!policyName.trim()) {
      toast.error("Working Hours Policy Name is required");
      return;
    }

    if (!startWorkingHours) {
      toast.error("Start Working Hours Time is required");
      return;
    }

    if (!endWorkingHours) {
      toast.error("End Working Hours Time is required");
      return;
    }

    const shortDayMins = calculateShortDayMins();

    const formData = {
      name: policyName.trim(),
      startWorkingHours,
      endWorkingHours,
      shortDayMins,
      startBreakTime: startBreakTime || null,
      endBreakTime: endBreakTime || null,
      halfDayStartTime: halfDayStartTime || null,
      lateStartTime: lateStartTime || null,
      lateDeductionType: lateDeductionType || null,
      applyDeductionAfterLates: applyDeductionAfterLates
        ? parseInt(applyDeductionAfterLates)
        : null,
      lateDeductionPercent: lateDeductionPercent
        ? parseFloat(lateDeductionPercent)
        : null,
      halfDayDeductionType: halfDayDeductionType || null,
      applyDeductionAfterHalfDays: applyDeductionAfterHalfDays
        ? parseInt(applyDeductionAfterHalfDays)
        : null,
      halfDayDeductionAmount: halfDayDeductionAmount
        ? parseFloat(halfDayDeductionAmount)
        : null,
      shortDayDeductionType: shortDayDeductionType || null,
      applyDeductionAfterShortDays: applyDeductionAfterShortDays
        ? parseInt(applyDeductionAfterShortDays)
        : null,
      shortDayDeductionAmount: shortDayDeductionAmount
        ? parseFloat(shortDayDeductionAmount)
        : null,
      overtimeRate: overtimeRate ? parseFloat(overtimeRate) : null,
      gazzetedOvertimeRate: gazzetedOvertimeRate
        ? parseFloat(gazzetedOvertimeRate)
        : null,
    };

    startTransition(async () => {
      const result = await createWorkingHoursPolicy(formData);
      if (result.status) {
        toast.success(
          result.message || "Working Hours Policy created successfully"
        );
        router.push("/dashboard/working-hours/view");
      } else {
        toast.error(result.message || "Failed to create working hours policy");
      }
    });
  };

  const handleClear = () => {
    setPolicyName("");
    setStartWorkingHours("");
    setEndWorkingHours("");
    setShortDayUnit("mins");
    setShortDayValue("");
    setStartBreakTime("");
    setEndBreakTime("");
    setHalfDayStartTime("");
    setLateStartTime("");
    setLateDeductionType("");
    setApplyDeductionAfterLates("");
    setLateDeductionPercent("");
    setHalfDayDeductionType("");
    setApplyDeductionAfterHalfDays("");
    setHalfDayDeductionAmount("");
    setShortDayDeductionType("");
    setApplyDeductionAfterShortDays("");
    setShortDayDeductionAmount("");
    setOvertimeRate("");
    setGazzetedOvertimeRate("");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/working-hours/view">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Working Hours Policy Form</CardTitle>
          <CardDescription>
            Define working hours, deductions, and overtime rates for your
            organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Working Hours Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Working Hours Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Working Hours Policy Name{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Enter policy name"
                    value={policyName}
                    onChange={(e) => setPolicyName(e.target.value)}
                    disabled={isPending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Start Working Hours Time (Hour){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <TimePicker
                    value={startWorkingHours}
                    onChange={setStartWorkingHours}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    End Working Hours Time (Hour){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <TimePicker
                    value={endWorkingHours}
                    onChange={setEndWorkingHours}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Short Day Mins</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="eg: 270"
                      value={shortDayValue}
                      onChange={(e) => setShortDayValue(e.target.value)}
                      disabled={isPending}
                      className="flex-1"
                    />
                    <Select
                      value={shortDayUnit}
                      onValueChange={(value: "hours" | "mins") =>
                        setShortDayUnit(value)
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
                  {shortDayValue && (
                    <p className="text-xs text-muted-foreground">
                      Will be saved as: {calculateShortDayMins()} minutes
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Start Break Time</Label>
                  <TimePicker
                    value={startBreakTime}
                    onChange={setStartBreakTime}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Break Time</Label>
                  <TimePicker
                    value={endBreakTime}
                    onChange={setEndBreakTime}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Half Day Start Time</Label>
                  <TimePicker
                    value={halfDayStartTime}
                    onChange={setHalfDayStartTime}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Late Start Time</Label>
                  <TimePicker
                    value={lateStartTime}
                    onChange={setLateStartTime}
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            {/* Deductions For Late/Half/Short-Day Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Deductions For Late/Half/Short-Day
              </h3>

              {/* Late Deduction */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Late Deduction Type</Label>
                  <Select
                    value={lateDeductionType || undefined}
                    onValueChange={(value) => {
                      if (value === "__clear__") {
                        setLateDeductionType("");
                        setLateDeductionPercent("");
                        setApplyDeductionAfterLates("");
                      } else {
                        setLateDeductionType(value);
                      }
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Deduction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        Deduct as Percentage
                      </SelectItem>
                      {lateDeductionType && (
                        <SelectItem value="__clear__">
                          Clear Selection
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Apply Deduction After (Number of Lates)</Label>
                  <Select
                    value={applyDeductionAfterLates}
                    onValueChange={setApplyDeductionAfterLates}
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
                    value={lateDeductionPercent}
                    onChange={(e) => setLateDeductionPercent(e.target.value)}
                    disabled={isPending || !lateDeductionType}
                  />
                </div>
              </div>

              {/* Half-Day Deduction */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Half-Day Deduction Type</Label>
                  <Select
                    value={halfDayDeductionType || undefined}
                    onValueChange={(value) => {
                      if (value === "__clear__") {
                        setHalfDayDeductionType("");
                        setHalfDayDeductionAmount("");
                        setApplyDeductionAfterHalfDays("");
                      } else {
                        setHalfDayDeductionType(value);
                      }
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Deduction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        Deduct as Percentage
                      </SelectItem>
                      {halfDayDeductionType && (
                        <SelectItem value="__clear__">
                          Clear Selection
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Apply Deduction After (Number of Half-Days)</Label>
                  <Select
                    value={applyDeductionAfterHalfDays}
                    onValueChange={setApplyDeductionAfterHalfDays}
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
                    value={halfDayDeductionAmount}
                    onChange={(e) => setHalfDayDeductionAmount(e.target.value)}
                    disabled={isPending || !halfDayDeductionType}
                  />
                </div>
              </div>

              {/* Short-Day Deduction */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Short-Day Deduction Type</Label>
                  <Select
                    value={shortDayDeductionType || undefined}
                    onValueChange={(value) => {
                      if (value === "__clear__") {
                        setShortDayDeductionType("");
                        setShortDayDeductionAmount("");
                        setApplyDeductionAfterShortDays("");
                      } else {
                        setShortDayDeductionType(value);
                      }
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Deduction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        Deduct as Percentage
                      </SelectItem>
                      {shortDayDeductionType && (
                        <SelectItem value="__clear__">
                          Clear Selection
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Apply Deduction After (Number of Short-Days)</Label>
                  <Select
                    value={applyDeductionAfterShortDays}
                    onValueChange={setApplyDeductionAfterShortDays}
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
                    value={shortDayDeductionAmount}
                    onChange={(e) => setShortDayDeductionAmount(e.target.value)}
                    disabled={isPending || !shortDayDeductionType}
                  />
                </div>
              </div>
            </div>

            {/* Overtime Rates Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Overtime Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Overtime Rate</Label>
                  <Select
                    value={overtimeRate}
                    onValueChange={setOvertimeRate}
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
                    value={gazzetedOvertimeRate}
                    onValueChange={setGazzetedOvertimeRate}
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={isPending}
              >
                Clear Form
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
