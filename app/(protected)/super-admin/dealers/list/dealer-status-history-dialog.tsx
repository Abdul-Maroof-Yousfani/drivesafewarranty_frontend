"use client";

import { useState } from "react";
import { History, User, Calendar } from "lucide-react";
import { getDealerStatusHistory, DealerStatusHistory } from "@/lib/actions/dealer";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface DealerStatusHistoryDialogProps {
  dealerId: string;
}

export function DealerStatusHistoryDialog({ dealerId }: DealerStatusHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<DealerStatusHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    const res = await getDealerStatusHistory(dealerId);
    if (res.status && res.data) {
      setHistory(res.data);
    } else {
      toast.error(res.message || "Failed to fetch status history");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if (val) fetchHistory();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
          title="View Status History"
        >
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <History className="h-5 w-5 text-primary" />
            Dealer Status History
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 mt-4 pr-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No history found for this dealer.</p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {history.map((item, idx) => (
                <div key={item.id} className="relative pl-8 pb-4">
                  {/* Timeline bar */}
                  {idx !== history.length - 1 && (
                    <div className="absolute left-[11px] top-4 w-[2px] h-full bg-border" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.statusTo === "active" ? "default" : "secondary"} className="uppercase font-bold tracking-tight">
                          {item.statusTo}
                        </Badge>
                        <span className="text-sm text-muted-foreground">from <span className="font-medium text-foreground">{item.statusFrom}</span></span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted px-2 py-1 rounded-full">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(item.createdAt), "PPP p")}
                      </span>
                    </div>
                    
                    {item.reason && (
                      <div className="text-sm bg-muted/50 p-3 rounded-lg border border-border italic text-foreground leading-relaxed shadow-sm">
                        "{item.reason}"
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80 pl-1">
                      <User className="h-3 w-3" />
                      <span>Changed by: <span className="text-foreground">{item.changedBy ? `${item.changedBy.firstName} ${item.changedBy.lastName}` : "System"}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
