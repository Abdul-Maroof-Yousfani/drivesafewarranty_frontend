"use client";

import { cn } from "@/lib/utils";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DirectPurchasePackage } from "@/lib/actions/direct-purchase";

interface PlanCardProps {
  pkg: DirectPurchasePackage;
  isSelected: boolean;
  selectedDuration: 12 | 24 | 36;
  onSelect: () => void;
  onDurationChange: (duration: 12 | 24 | 36) => void;
  isFeatured?: boolean;
}

export function PlanCard({
  pkg,
  isSelected,
  selectedDuration,
  onSelect,
  onDurationChange,
  isFeatured = false,
}: PlanCardProps) {
  // Get price based on duration
  const getPrice = () => {
    switch (selectedDuration) {
      case 12:
        return Number(pkg.price12Months) || 0;
      case 24:
        return Number(pkg.price24Months) || 0;
      case 36:
        return Number(pkg.price36Months) || 0;
      default:
        return 0;
    }
  };

  const price = getPrice();
  const benefits = pkg.items?.filter((item) => item.type === "benefit") || [];

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 transition-all duration-300 cursor-pointer",
        isFeatured
          ? "bg-gradient-to-br from-[#00C853] to-[#00B4D8] text-white shadow-xl scale-105"
          : "bg-card border shadow-md hover:shadow-lg",
        isSelected && !isFeatured && "ring-2 ring-[#00C853] border-[#00C853]",
        isSelected && isFeatured && "ring-4 ring-white/50"
      )}
      onClick={onSelect}
    >
      {isFeatured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0D1B2A] text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Star className="h-3 w-3 fill-current" />
          RECOMMENDED
        </div>
      )}

      <div className="text-center mb-6">
        <h3
          className={cn(
            "text-xl font-bold mb-2",
            isFeatured ? "text-white" : "text-foreground"
          )}
        >
          {pkg.name}
        </h3>
        {pkg.description && (
          <p
            className={cn(
              "text-sm",
              isFeatured ? "text-white/80" : "text-muted-foreground"
            )}
          >
            {pkg.description}
          </p>
        )}
      </div>

      <div className="text-center mb-6">
        <div
          className={cn(
            "text-4xl font-bold",
            isFeatured ? "text-white" : "text-foreground"
          )}
        >
          ${price.toLocaleString()}
        </div>
        <div
          className={cn(
            "text-sm",
            isFeatured ? "text-white/70" : "text-muted-foreground"
          )}
        >
          for {selectedDuration} months
        </div>
      </div>

      <div className="mb-6" onClick={(e) => e.stopPropagation()}>
        <Select
          value={selectedDuration.toString()}
          onValueChange={(val) => onDurationChange(Number(val) as 12 | 24 | 36)}
        >
          <SelectTrigger
            className={cn(
              "w-full",
              isFeatured && "bg-white/20 border-white/30 text-white"
            )}
          >
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 Months</SelectItem>
            <SelectItem value="24">24 Months</SelectItem>
            <SelectItem value="36">36 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 mb-6">
        {benefits.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                isFeatured ? "bg-white/20" : "bg-[#00C853]/10"
              )}
            >
              <Check
                className={cn(
                  "h-3 w-3",
                  isFeatured ? "text-white" : "text-[#00C853]"
                )}
              />
            </div>
            <span
              className={cn(
                "text-sm",
                isFeatured ? "text-white/90" : "text-foreground"
              )}
            >
              {item.warrantyItem.label}
            </span>
          </div>
        ))}
        {benefits.length > 5 && (
          <div
            className={cn(
              "text-sm text-center",
              isFeatured ? "text-white/70" : "text-muted-foreground"
            )}
          >
            +{benefits.length - 5} more benefits
          </div>
        )}
      </div>

      <Button
        className={cn(
          "w-full font-semibold",
          isFeatured
            ? "bg-white text-[#00C853] hover:bg-white/90"
            : isSelected
              ? "bg-[#00C853] text-white hover:bg-[#00C853]/90"
              : "bg-muted text-foreground hover:bg-[#00C853]/10"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {isSelected ? "Selected ✓" : "Select Plan"}
      </Button>
    </div>
  );
}
