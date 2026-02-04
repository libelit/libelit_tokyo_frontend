import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  downPayment: string;
  projectValue: number;
  loanValue: number;
  loanDuration: number;
  imageUrl?: string;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPrice = (value: number) => {
    return `$ ${value.toLocaleString("en-US").replace(/,/g, " ")}`;
  };

  return (
    <Card className="overflow-hidden shadow-none border-none">
      <CardContent className="space-y-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">
              {project.name} | {project.location}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#E86A33]">
            {formatPrice(project.price)} (12.5%)
          </span>
          <span className="text-xs text-muted-foreground">Down payment</span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Project value:</span>
            <span className="font-medium">{formatPrice(project.projectValue)}.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Loan Value:</span>
            <span className="font-medium">{formatPrice(project.loanValue)}.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Loan Duration:</span>
            <span className="font-medium text-[#E86A33]">
              {project.loanDuration} days
            </span>
          </div>
        </div>

        <Button className="w-full bg-[#E86A33] hover:bg-[#d55a23] text-white text-sm">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
