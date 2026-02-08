import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { ProposalStatus } from "@/lib/types/loan-proposal";

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
  proposalStatus?: ProposalStatus | null;
}

export function ProjectCard({ project, proposalStatus }: ProjectCardProps) {
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

  const getStatusBadge = () => {
    if (!proposalStatus) return null;

    switch (proposalStatus) {
      case "accepted":
        return (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Accepted
          </div>
        );
      case "rejected":
        return (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
            <XCircle className="h-3 w-3" />
            Rejected
          </div>
        );
      case "submitted":
      case "under_review":
        return (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
            <Clock className="h-3 w-3" />
            Pending
          </div>
        );
      default:
        return null;
    }
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
              className="w-fit"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {getStatusBadge()}
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

        <Link href={`/dashboard/marketplace/${project.id}`}>
          <Button className="w-full bg-[#E86A33] hover:bg-[#d55a23] text-white text-sm">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
