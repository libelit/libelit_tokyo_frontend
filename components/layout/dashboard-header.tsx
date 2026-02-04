"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileSidebar } from "./sidebar";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <Avatar className="h-10 w-10">
        <AvatarImage src="/images/avatar.png" alt="User" />
        <AvatarFallback className="bg-black text-white">S</AvatarFallback>
      </Avatar>
    </header>
  );
}
