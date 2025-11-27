"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";

export function HeaderNotifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <span className="font-medium">New leave request</span>
          <span className="text-xs text-muted-foreground">John Doe requested 3 days leave</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <span className="font-medium">Payroll processed</span>
          <span className="text-xs text-muted-foreground">November payroll has been processed</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <span className="font-medium">New employee added</span>
          <span className="text-xs text-muted-foreground">Sarah Smith joined the team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

