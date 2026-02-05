"use client";

import { cn } from "@/lib/utils";

export type ProjectStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "tokenizing"
  | "listed"
  | "funding"
  | "funded"
  | "in_progress"
  | "completed"
  | "defaulted";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700",
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-100 text-blue-700",
  },
  under_review: {
    label: "Under Review",
    className: "bg-yellow-100 text-yellow-700",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-700",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700",
  },
  tokenizing: {
    label: "Tokenizing",
    className: "bg-purple-100 text-purple-700",
  },
  listed: {
    label: "Listed",
    className: "bg-indigo-100 text-indigo-700",
  },
  funding: {
    label: "Funding",
    className: "bg-orange-100 text-orange-700",
  },
  funded: {
    label: "Funded",
    className: "bg-green-100 text-green-700",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "Completed",
    className: "bg-teal-100 text-teal-700",
  },
  defaulted: {
    label: "Defaulted",
    className: "bg-red-100 text-red-700",
  },
};

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
