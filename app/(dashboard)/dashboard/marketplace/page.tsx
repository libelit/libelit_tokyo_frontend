"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectCard, Project } from "@/components/dashboard/project-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, AlertCircle, Loader2 } from "lucide-react";
import { loanProposalsService } from "@/lib/api/loan-proposals";
import { lenderProfileService } from "@/lib/api";
import { ProposalStatus } from "@/lib/types/loan-proposal";
import type { LenderProfile, KybStatus } from "@/lib/types/lender";
import Link from "next/link";

// Mock lender ID - in real app this would come from auth context
const MOCK_LENDER_ID = "lender-1";

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

function KybBlockedMessage({ kybStatus }: { kybStatus: KybStatus }) {
  const getMessage = () => {
    switch (kybStatus) {
      case "not_started":
        return {
          title: "Complete KYB Verification",
          description: "You need to complete your business verification before you can browse and invest in projects.",
          buttonText: "Start Verification",
        };
      case "pending":
        return {
          title: "KYB Verification Pending",
          description: "Your documents have been submitted and are awaiting review. You'll be able to access the marketplace once verified.",
          buttonText: "View Status",
        };
      case "under_review":
        return {
          title: "KYB Under Review",
          description: "Our team is currently reviewing your documents. This usually takes 1-2 business days.",
          buttonText: "View Status",
        };
      case "rejected":
        return {
          title: "KYB Verification Rejected",
          description: "Your verification was rejected. Please review the feedback and resubmit your documents.",
          buttonText: "Resubmit Documents",
        };
      default:
        return {
          title: "Verification Required",
          description: "Please complete your business verification to access the marketplace.",
          buttonText: "Start Verification",
        };
    }
  };

  const message = getMessage();

  return (
    <div className="space-y-6">
      <DashboardHeader title="Marketplace" subtitle="Browse investment opportunities" />

      <div className="rounded-xl border bg-white p-8 shadow-sm text-center max-w-lg mx-auto mt-12">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-[#E86A33]" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{message.title}</h2>
        <p className="text-gray-500 mb-6">{message.description}</p>
        <Link href="/dashboard/kyb">
          <Button className="bg-[#E86A33] hover:bg-[#d55a25]">
            {message.buttonText}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [proposalStatuses, setProposalStatuses] = useState<Record<string, ProposalStatus>>({});
  const [profile, setProfile] = useState<LenderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch lender profile to check KYB status
  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const response = await lenderProfileService.getProfile();
        if (response.data?.data) {
          setProfile(response.data.data);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Fetch proposal statuses for all projects
  const fetchProposalStatuses = useCallback(async () => {
    try {
      const response = await loanProposalsService.getByLender(MOCK_LENDER_ID);
      if (response.success) {
        const statuses: Record<string, ProposalStatus> = {};
        response.data.forEach((proposal) => {
          statuses[proposal.projectId] = proposal.status;
        });
        setProposalStatuses(statuses);
      }
    } catch (error) {
      console.error("Error fetching proposal statuses:", error);
    }
  }, []);

  useEffect(() => {
    if (profile?.kyb_status === "approved") {
      fetchProposalStatuses();
    }
  }, [fetchProposalStatuses, profile?.kyb_status]);

  // Filter projects based on search query
  const filteredProjects = mockProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader title="Marketplace" subtitle="Browse investment opportunities" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#E86A33]" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <DashboardHeader title="Marketplace" subtitle="Browse investment opportunities" />
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // KYB not approved - show blocked message
  const kybStatus = profile?.kyb_status || "not_started";
  if (kybStatus !== "approved") {
    return <KybBlockedMessage kybStatus={kybStatus} />;
  }

  // KYB approved - show marketplace
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
              <ProjectCard
                project={project}
                proposalStatus={proposalStatuses[project.id] || null}
              />
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
