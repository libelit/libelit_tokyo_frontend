import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <DashboardHeader title={title} />
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Construction className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm">This page is under construction.</p>
      </div>
    </div>
  );
}
