"use client";

import * as React from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Preset color palette for quick selection
const presetColors = [
  // Row 1 - Brand/Modern
  "#0f172a", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6", "#ec4899",
  // Row 2 - Soft/Pastel
  "#f1f5f9", "#dbeafe", "#d1fae5", "#fef3c7", "#fee2e2", "#e0e7ff", "#ede9fe", "#fce7f3",
];

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(inputValue)) {
      setInputValue(value);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 gap-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div
            className="h-4 w-4 rounded-full border shadow-sm flex-shrink-0"
            style={{ backgroundColor: value || "#ffffff" }}
          />
          <span className="flex-1 truncate font-mono text-xs uppercase">
            {value || "Select color"}
          </span>
          <Paintbrush className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-3 border-slate-200 shadow-xl" align="start">
        <div className="space-y-4">
          {/* Visual Picker */}
          <div className="custom-color-picker">
            <HexColorPicker color={value} onChange={onChange} className="!w-full !h-32" />
          </div>

          <style jsx global>{`
            .custom-color-picker .react-colorful {
              width: 100% !important;
              height: 140px !important;
            }
            .custom-color-picker .react-colorful__saturation {
              border-radius: 6px 6px 0 0;
            }
            .custom-color-picker .react-colorful__hue {
              height: 12px;
              border-radius: 0 0 6px 6px;
              margin-top: 8px;
            }
          `}</style>

          {/* Preset Colors */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Presets</p>
            <div className="grid grid-cols-8 gap-1.5">
              {presetColors.map((cp) => (
                <button
                  key={cp}
                  className={cn(
                    "h-5 w-5 rounded-md border border-slate-200 transition-all hover:scale-110",
                    value.toLowerCase() === cp.toLowerCase() && "ring-2 ring-blue-500 ring-offset-2"
                  )}
                  style={{ backgroundColor: cp }}
                  onClick={() => onChange(cp)}
                  type="button"
                />
              ))}
            </div>
          </div>

          {/* Hex Input */}
          <div className="flex gap-2 items-center pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400">HEX</div>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="h-8 px-2 text-xs font-mono uppercase bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
