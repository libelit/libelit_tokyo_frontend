"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
} from "lucide-react";
import { LenderProposalCard } from "@/components/dashboard/lender-proposal-card";
import { lenderProposalsService } from "@/lib/api";
import { LenderLoanProposal, LenderProposalStatus } from "@/lib/types/lender";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type StatusFilter = "all" | LenderProposalStatus;

export default function MyProposalsPage() {
  const [proposals, setProposals] = useState<LenderLoanProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await lenderProposalsService.list({
        status: statusFilter,
        per_page: 15,
      });
      if (response.data?.success) {
        setProposals(response.data.data);
        console.log('backend response: ',response.data.data);

        setMeta(response.data.meta);
      } else if (response.error) {
        toast.error(response.error);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Calculate stats from proposals
  const stats = {
    total: meta.total,
    pending: proposals.filter(
      (p) => p.status === "submitted_by_lender" || p.status === "under_review"
    ).length,
    accepted: proposals.filter((p) => p.status === "accepted").length,
    rejected: proposals.filter((p) => p.status === "rejected").length,
  };

  // Group proposals by status for display
  const acceptedProposals = proposals.filter((p) => p.status === "accepted");
  const pendingProposals = proposals.filter(
    (p) => p.status === "submitted_by_lender" || p.status === "under_review"
  );
  const rejectedProposals = proposals.filter((p) => p.status === "rejected");
  const expiredProposals = proposals.filter((p) => p.status === "expired");

  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "submitted_by_lender", label: "Pending" },
    { value: "under_review", label: "Under Review" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Proposals</h1>
          <p className="text-gray-500 mt-1">
            Track all your submitted loan proposals
          </p>
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
        <p className="text-gray-500 mt-1">
          Track all your submitted loan proposals
        </p>
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

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-500">Filter:</span>
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(option.value)}
            className={
              statusFilter === option.value
                ? "bg-[#E86A33] hover:bg-[#d55a25]"
                : ""
            }
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Proposals List */}
      {statusFilter === "all" ? (
        <>
          {/* Accepted Proposals */}
          {acceptedProposals.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-green-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Accepted ({acceptedProposals.length})
              </h3>
              <div className="space-y-4">
                {acceptedProposals.map((proposal) => (
                  <LenderProposalCard key={proposal.id} proposal={proposal} />
                ))}
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
                {pendingProposals.map((proposal) => (
                  <LenderProposalCard key={proposal.id} proposal={proposal} />
                ))}
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
                {rejectedProposals.map((proposal) => (
                  <LenderProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            </div>
          )}

          {/* Expired Proposals */}
          {expiredProposals.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Expired ({expiredProposals.length})
              </h3>
              <div className="space-y-4">
                {expiredProposals.map((proposal) => (
                  <LenderProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Filtered view */
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <LenderProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {proposals.length === 0 && (
        <div className="rounded-xl border bg-white p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {statusFilter === "all"
              ? "You haven't submitted any loan proposals yet. Browse the marketplace to find projects and submit your first proposal."
              : `No ${filterOptions.find((f) => f.value === statusFilter)?.label.toLowerCase()} proposals found.`}
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
