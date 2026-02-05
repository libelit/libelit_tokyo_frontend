"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Building2, AlertCircle } from "lucide-react";
import { DeveloperHeader } from "@/components/developer/developer-header";
import { ProjectCard } from "@/components/developer/project-card";
import { ProjectStatusBadge, ProjectStatus } from "@/components/developer/project-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  title: string;
  type: string;
  location: string;
  fundingGoal: number;
  status: ProjectStatus;
  createdAt: string;
  imageUrl?: string;
}

// Mock data - will be replaced with API data
const mockProjects: Project[] = [
  {
    id: "1",
    title: "Sunset Heights Residential Complex",
    type: "Residential",
    location: "Sydney, Australia",
    fundingGoal: 2500000,
    status: "draft",
    createdAt: "2026-02-01",
  },
  {
    id: "2",
    title: "Central Business Tower",
    type: "Commercial",
    location: "Melbourne, Australia",
    fundingGoal: 5000000,
    status: "submitted",
    createdAt: "2026-01-28",
  },
  {
    id: "3",
    title: "Riverside Mixed Development",
    type: "Mixed-Use",
    location: "Brisbane, Australia",
    fundingGoal: 3500000,
    status: "under_review",
    createdAt: "2026-01-25",
  },
  {
    id: "4",
    title: "Green Valley Homes",
    type: "Residential",
    location: "Perth, Australia",
    fundingGoal: 1800000,
    status: "approved",
    createdAt: "2026-01-20",
  },
];

// For demo purposes - set to true to show projects, false to show empty state
const mockKybApproved = true;
const mockHasProjects = true;

const statusFilters: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All Projects" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "funding", label: "Funding" },
  { value: "completed", label: "Completed" },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");

  const isKybApproved = mockKybApproved;
  const projects = mockHasProjects ? mockProjects : [];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteProject = (id: string) => {
    // In real implementation, call API to delete
    console.log("Delete project:", id);
  };

  // KYB not approved state
  if (!isKybApproved) {
    return (
      <div className="space-y-6">
        <DeveloperHeader title="Projects" />
        <div className="rounded-xl border bg-amber-50 border-amber-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Complete KYB Verification</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            You need to complete your business verification before you can create and submit projects.
          </p>
          <Link href="/developer/dashboard/kyb">
            <Button className="bg-[#E86A33] hover:bg-[#d55a25]">
              Start KYB Verification
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DeveloperHeader title="Projects" />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "all")}
            className="px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]"
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
        {/* Create Button */}
        <Link href="/developer/dashboard/projects/new">
          <Button className="bg-[#E86A33] hover:bg-[#d55a25]">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : projects.length > 0 ? (
        // No results from filter
        <div className="rounded-xl border bg-white p-12 text-center">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No projects found</h2>
          <p className="text-gray-500 mb-4">
            No projects match your search criteria. Try adjusting your filters.
          </p>
          <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        // Empty state - no projects at all
        <div className="rounded-xl border bg-white p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            You haven&apos;t created any projects yet. Create your first project to start the funding process.
          </p>
          <Link href="/developer/dashboard/projects/new">
            <Button className="bg-[#E86A33] hover:bg-[#d55a25]">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Summary */}
      {projects.length > 0 && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Project Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50">
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {projects.filter((p) => p.status === "submitted" || p.status === "under_review").length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50">
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {projects.filter((p) => ["approved", "tokenizing", "listed", "funding", "funded", "in_progress", "completed"].includes(p.status)).length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50">
              <p className="text-sm text-gray-500">Total Funding Goal</p>
              <p className="text-2xl font-bold text-blue-600">
                ${projects.reduce((sum, p) => sum + p.fundingGoal, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
