"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { LenderProposalCard } from "@/components/dashboard/lender-proposal-card";
import { loanProposalsService, LoanProposal } from "@/lib/api/loan-proposals";
import { toast } from "sonner";

// Mock lender ID - in real app this would come from auth context
const MOCK_LENDER_ID = "lender-1";

// Mock project data - in real app this would come from API
const projectsData: Record<string, { name: string; location: string }> = {
  "1": { name: "Riverside Apartments", location: "Warsaw, Poland" },
  "2": { name: "Downtown Office Complex", location: "Tokyo, Japan" },
  "3": { name: "Suburban Villas", location: "London, UK" },
};

export default function MyProposalsPage() {
  const [proposals, setProposals] = useState<LoanProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await loanProposalsService.getByLender(MOCK_LENDER_ID);
      if (response.success) {
        setProposals(response.data);
        if (response.meta) {
          setStats(response.meta);
        }
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleUploadContract = async (proposalId: string, file: File) => {
    setUploadingId(proposalId);
    try {
      const response = await loanProposalsService.uploadContract(
        proposalId,
        "lender",
        file.name
      );
      if (response.success) {
        toast.success("Contract uploaded successfully");
        await fetchProposals();
      } else {
        toast.error(response.message || "Failed to upload contract");
      }
    } catch (error) {
      console.error("Error uploading contract:", error);
      toast.error("Failed to upload contract");
    } finally {
      setUploadingId(null);
    }
  };

  // Separate proposals by status
  const acceptedProposals = proposals.filter((p) => p.status === "accepted");
  const pendingProposals = proposals.filter(
    (p) => p.status === "submitted" || p.status === "under_review"
  );
  const rejectedProposals = proposals.filter((p) => p.status === "rejected");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Proposals</h1>
          <p className="text-gray-500 mt-1">Track all your submitted loan proposals</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#E86A33]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Proposals</h1>
        <p className="text-gray-500 mt-1">Track all your submitted loan proposals</p>
      </div>

      {/* Stats Overview */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#E86A33]" />
          Proposal Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Submitted</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-amber-600">Pending Review</p>
            </div>
            <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-600">Accepted</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600">Rejected</p>
            </div>
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Accepted Proposals */}
      {acceptedProposals.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-green-600 mb-3 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Accepted ({acceptedProposals.length})
          </h3>
          <div className="space-y-4">
            {acceptedProposals.map((proposal) => {
              const project = projectsData[proposal.projectId] || {
                name: "Project",
                location: "Location",
              };
              return (
                <LenderProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  projectName={project.name}
                  projectLocation={project.location}
                  onUploadContract={handleUploadContract}
                  isUploadingContract={uploadingId === proposal.id}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Proposals */}
      {pendingProposals.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-amber-600 mb-3 uppercase tracking-wide flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Review ({pendingProposals.length})
          </h3>
          <div className="space-y-4">
            {pendingProposals.map((proposal) => {
              const project = projectsData[proposal.projectId] || {
                name: "Project",
                location: "Location",
              };
              return (
                <LenderProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  projectName={project.name}
                  projectLocation={project.location}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Rejected Proposals */}
      {rejectedProposals.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-red-600 mb-3 uppercase tracking-wide flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedProposals.length})
          </h3>
          <div className="space-y-4">
            {rejectedProposals.map((proposal) => {
              const project = projectsData[proposal.projectId] || {
                name: "Project",
                location: "Location",
              };
              return (
                <LenderProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  projectName={project.name}
                  projectLocation={project.location}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {proposals.length === 0 && (
        <div className="rounded-xl border bg-white p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You haven&apos;t submitted any loan proposals yet. Browse the marketplace to find
            projects and submit your first proposal.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-xl border bg-blue-50 border-blue-200 p-6">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          About Your Proposals
        </h3>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Proposals are reviewed by developers within 2-5 business days</li>
          <li>If accepted, you&apos;ll need to upload your signed contract</li>
          <li>The loan becomes active once both parties sign the contract</li>
          <li>Rejected proposals show the reason provided by the developer</li>
        </ul>
      </div>
    </div>
  );
}
