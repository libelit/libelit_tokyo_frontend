"use client";

import { useState } from "react";
import { Building2, Calendar, Percent, Shield, Clock, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LoanProposal,
  securityPackageLabels,
  proposalStatusConfig,
} from "@/lib/types/loan-proposal";
import { cn } from "@/lib/utils";

interface ProposalCardProps {
  proposal: LoanProposal;
  onAccept?: (proposalId: string) => void;
  onReject?: (proposalId: string) => void;
  onViewDetails?: (proposalId: string) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

export function ProposalCard({
  proposal,
  onAccept,
  onReject,
  onViewDetails,
  isAccepting = false,
  isRejecting = false,
}: ProposalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusConfig = proposalStatusConfig[proposal.status];
  const isActionable = proposal.status === "submitted" || proposal.status === "under_review";
  const isExpired = new Date(proposal.bidExpiry) < new Date();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const daysUntilExpiry = () => {
    const now = new Date();
    const expiry = new Date(proposal.bidExpiry);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden transition-shadow hover:shadow-md",
        proposal.status === "accepted" && "border-green-200 bg-green-50/30",
        proposal.status === "rejected" && "border-red-200 bg-red-50/30"
      )}
    >
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          {/* Lender Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{proposal.lenderName}</h3>
              <p className="text-xs text-gray-500">
                Submitted {formatDate(proposal.submittedAt)}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium self-start",
              statusConfig.bgColor,
              statusConfig.color
            )}
          >
            {isExpired && isActionable ? "Expired" : statusConfig.label}
          </div>
        </div>

        {/* Key Stats - Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Amount */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Amount Offered</p>
            <p className="text-sm sm:text-base font-bold text-[#E86A33]">
              {formatCurrency(proposal.amountOffered, proposal.currency)}
            </p>
          </div>

          {/* Interest Rate */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Percent className="h-3 w-3 text-gray-400" />
              <p className="text-xs text-gray-500">Interest Rate</p>
            </div>
            <p className="text-sm sm:text-base font-bold">{proposal.interestRate}% p.a.</p>
          </div>

          {/* Max LTV */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Shield className="h-3 w-3 text-gray-400" />
              <p className="text-xs text-gray-500">Max LTV</p>
            </div>
            <p className="text-sm sm:text-base font-bold">{proposal.maxLTV}%</p>
          </div>

          {/* Maturity */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <p className="text-xs text-gray-500">Maturity</p>
            </div>
            <p className="text-sm sm:text-base font-bold">{formatDate(proposal.maturityDate)}</p>
          </div>
        </div>

        {/* Expiry Warning */}
        {isActionable && !isExpired && daysUntilExpiry() <= 7 && (
          <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">
              Expires in {daysUntilExpiry()} day{daysUntilExpiry() !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Expandable Details */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              View details
            </>
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {/* Security Package */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Security Package</p>
              <div className="flex flex-wrap gap-2">
                {proposal.securityPackage.map((pkg) => (
                  <span
                    key={pkg}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700"
                  >
                    {securityPackageLabels[pkg]}
                  </span>
                ))}
              </div>
            </div>

            {/* Bid Expiry */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Bid Expiry Date</p>
              <p className="text-sm font-medium">
                {formatDate(proposal.bidExpiry)}
                {isExpired && (
                  <span className="ml-2 text-red-500 text-xs">(Expired)</span>
                )}
              </p>
            </div>

            {/* Conditions */}
            {proposal.conditions && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Additional Conditions</p>
                <p className="text-sm text-gray-700">{proposal.conditions}</p>
              </div>
            )}

            {/* Supporting Documents */}
            {proposal.proposalDocuments && proposal.proposalDocuments.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Supporting Documents</p>
                <div className="space-y-2">
                  {proposal.proposalDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-gray-400">
                          {(doc.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {proposal.status === "rejected" && proposal.rejectionReason && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 font-medium mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700">{proposal.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isActionable && !isExpired && (
        <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject?.(proposal.id)}
            disabled={isRejecting || isAccepting}
            className="rounded-full order-2 sm:order-1"
          >
            {isRejecting ? "Rejecting..." : "Reject"}
          </Button>
          <Button
            size="sm"
            onClick={() => onAccept?.(proposal.id)}
            disabled={isAccepting || isRejecting}
            className="bg-[#E86A33] hover:bg-[#d55a25] text-white rounded-full order-1 sm:order-2"
          >
            {isAccepting ? "Accepting..." : "Accept Proposal"}
          </Button>
        </div>
      )}

      {/* Accepted State - Contract Upload Prompt */}
      {proposal.status === "accepted" && proposal.contractStatus === "pending" && (
        <div className="px-4 sm:px-5 py-3 bg-green-50 border-t border-green-100">
          <p className="text-sm text-green-700">
            Proposal accepted. Waiting for contract signatures.
          </p>
        </div>
      )}
    </div>
  );
}
