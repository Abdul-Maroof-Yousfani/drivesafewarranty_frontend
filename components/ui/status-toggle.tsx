"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface StatusToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusToggle({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: StatusToggleProps) {
  const handleToggle = () => {
    if (disabled) return;
    onCheckedChange(!checked);
  };

  return (
    <div 
      className={cn(
        "relative flex items-center h-8 w-28 rounded-full cursor-pointer p-1 transition-colors duration-300 shadow-inner",
        checked ? "bg-primary/20" : "bg-muted",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={handleToggle}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute h-6 w-14 rounded-full shadow-sm flex items-center justify-center text-[10px] font-bold uppercase tracking-wider z-10",
          checked 
            ? "bg-primary text-primary-foreground left-[calc(100%-3.5rem-4px)]" 
            : "bg-background text-muted-foreground left-1"
        )}
      >
        {checked ? activeLabel : inactiveLabel}
      </motion.div>
      
      <div className="flex w-full justify-between items-center px-3 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/50 select-none">
        <span className={cn("transition-opacity", checked ? "opacity-0" : "opacity-100")}>Off</span>
        <span className={cn("transition-opacity", checked ? "opacity-100" : "opacity-0")}>On</span>
      </div>
    </div>
  );
}
