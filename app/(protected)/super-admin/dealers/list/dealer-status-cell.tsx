"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateDealer } from "@/lib/actions/dealer";
import { cn } from "@/lib/utils";
import { StatusToggle } from "@/components/ui/status-toggle";

interface DealerStatusCellProps {
  dealerId: string;
  initialStatus: string;
}

export function DealerStatusCell({ dealerId, initialStatus }: DealerStatusCellProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const handleToggle = () => {
    const nextStatus = status === "active" ? "inactive" : "active";
    setPendingStatus(nextStatus);
    setReason("");
    setShowReasonDialog(true);
  };

  const handleConfirmStatusChange = () => {
    if (!pendingStatus) return;
    
    startTransition(async () => {
      const res = await updateDealer(dealerId, { 
        status: pendingStatus,
        reason: reason.trim() || undefined 
      });
      
      if (res.status) {
        setStatus(pendingStatus);
        toast.success(`Dealer ${pendingStatus === "active" ? "activated" : "deactivated"}`);
        setShowReasonDialog(false);
      } else {
        toast.error(res.message || "Failed to update status");
      }
    });
  };

  const isActive = status === "active";

  return (
    <div className="flex items-center">
      <StatusToggle 
        checked={isActive}
        onCheckedChange={handleToggle}
      />

      {/* Reason Dialog */}
      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reason for Status Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Why are you changing this dealer to <span className="font-semibold uppercase text-primary">{pendingStatus}</span>?</Label>
              <Textarea 
                placeholder="Enter reason here (e.g., Policy violation, Re-verified credentials...)" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReasonDialog(false)} disabled={isPending}>Cancel</Button>
            <Button onClick={handleConfirmStatusChange} disabled={isPending}>
              {isPending ? "Updating..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
