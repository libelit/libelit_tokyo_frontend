"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectCard, Project } from "@/components/dashboard/project-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

// Hardcoded mock projects data
const mockProjects: Project[] = [
  {
    id: "1",
    name: "Riverside Apartments",
    location: "Miami, FL",
    description:
      "Modern waterfront development featuring 24 luxury apartments with stunning ocean views and premium amenities.",
    price: 312500,
    downPayment: "12.5%",
    projectValue: 2500000,
    loanValue: 1000000,
    loanDuration: 216,
  },
  {
    id: "2",
    name: "Green Valley Homes",
    location: "Austin, TX",
    description:
      "Sustainable housing project with 12 eco-friendly single-family homes featuring solar panels and smart home technology.",
    price: 187500,
    downPayment: "12.5%",
    projectValue: 1500000,
    loanValue: 750000,
    loanDuration: 180,
  },
  {
    id: "3",
    name: "Downtown Plaza",
    location: "Chicago, IL",
    description:
      "Mixed-use commercial development in the heart of downtown, featuring retail spaces and office units.",
    price: 625000,
    downPayment: "12.5%",
    projectValue: 5000000,
    loanValue: 2500000,
    loanDuration: 365,
  },
  {
    id: "4",
    name: "Sunset Villas",
    location: "San Diego, CA",
    description:
      "Exclusive gated community with 8 Mediterranean-style villas, private pools, and landscaped gardens.",
    price: 437500,
    downPayment: "12.5%",
    projectValue: 3500000,
    loanValue: 1750000,
    loanDuration: 270,
  },
  {
    id: "5",
    name: "Harbor View Condos",
    location: "Seattle, WA",
    description:
      "Premium waterfront condominiums with 36 units offering panoramic harbor views and modern finishes.",
    price: 250000,
    downPayment: "12.5%",
    projectValue: 2000000,
    loanValue: 1000000,
    loanDuration: 240,
  },
  {
    id: "6",
    name: "Mountain Ridge Estate",
    location: "Denver, CO",
    description:
      "Luxury mountain retreat development with 6 custom-built chalets featuring ski-in/ski-out access.",
    price: 562500,
    downPayment: "12.5%",
    projectValue: 4500000,
    loanValue: 2250000,
    loanDuration: 300,
  },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter projects based on search query
  const filteredProjects = mockProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <DashboardHeader title="Marketplace" subtitle="Browse investment opportunities" />

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects by name, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredProjects.length} of {mockProjects.length} projects
        </p>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl border p-4 shadow-sm">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border">
          <p className="text-gray-500">No projects found matching your search.</p>
          <Button
            variant="link"
            onClick={() => setSearchQuery("")}
            className="text-[#E86A33] mt-2"
          >
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
