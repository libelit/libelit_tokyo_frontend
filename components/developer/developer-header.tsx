"use client";

import { Bell } from "lucide-react";
import { DeveloperMobileSidebar } from "@/components/layout/developer-sidebar";

interface DeveloperHeaderProps {
  title: string;
}

export function DeveloperHeader({ title }: DeveloperHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <DeveloperMobileSidebar />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
        <Bell className="h-5 w-5 text-gray-600" />
      </button>
    </header>
  );
}
