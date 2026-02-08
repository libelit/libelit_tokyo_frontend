"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Percent,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Circle,
  Upload,
  Loader2,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LoanProposal,
  securityPackageLabels,
  proposalStatusConfig,
} from "@/lib/types/loan-proposal";
import { cn } from "@/lib/utils";

interface LenderProposalCardProps {
  proposal: LoanProposal;
  projectName?: string;
  projectLocation?: string;
  onUploadContract?: (proposalId: string, file: File) => Promise<void>;
  isUploadingContract?: boolean;
}

export function LenderProposalCard({
  proposal,
  projectName = "Project Name",
  projectLocation = "City, Country",
  onUploadContract,
  isUploadingContract = false,
}: LenderProposalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const statusConfig = proposalStatusConfig[proposal.status];

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

  const handleUpload = async () => {
    if (contractFile && onUploadContract) {
      await onUploadContract(proposal.id, contractFile);
      setContractFile(null);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden transition-shadow hover:shadow-md",
        proposal.status === "accepted" && "border-green-200",
        proposal.status === "rejected" && "border-red-200"
      )}
    >
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          {/* Project Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{projectName}</h3>
              <p className="text-sm text-gray-500">{projectLocation}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Submitted {formatDate(proposal.submittedAt)}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                statusConfig.bgColor,
                statusConfig.color
              )}
            >
              {proposal.status === "accepted" && <CheckCircle2 className="h-3.5 w-3.5" />}
              {proposal.status === "rejected" && <XCircle className="h-3.5 w-3.5" />}
              {statusConfig.label}
            </div>
          </div>
        </div>

        {/* Your Proposal Details */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Your Proposal</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Amount Offered</p>
              <p className="text-sm font-bold text-[#E86A33]">
                {formatCurrency(proposal.amountOffered, proposal.currency)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Percent className="h-3 w-3 text-gray-400" />
                <p className="text-xs text-gray-500">Interest Rate</p>
              </div>
              <p className="text-sm font-bold">{proposal.interestRate}% p.a.</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Shield className="h-3 w-3 text-gray-400" />
                <p className="text-xs text-gray-500">Max LTV</p>
              </div>
              <p className="text-sm font-bold">{proposal.maxLTV}%</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <p className="text-xs text-gray-500">Maturity</p>
              </div>
              <p className="text-sm font-bold">{formatDate(proposal.maturityDate)}</p>
            </div>
          </div>
        </div>

        {/* Rejection Reason */}
        {proposal.status === "rejected" && proposal.rejectionReason && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason</p>
            <p className="text-sm text-red-700">{proposal.rejectionReason}</p>
          </div>
        )}

        {/* Contract Section for Accepted Proposals */}
        {proposal.status === "accepted" && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xs font-medium text-green-800 mb-3 uppercase tracking-wide">Contract Status</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Your Contract */}
              <div className={cn(
                "p-3 rounded-lg border",
                proposal.lenderContract ? "bg-green-100 border-green-200" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {proposal.lenderContract ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300" />
                  )}
                  <span className="text-sm font-medium">Your Contract</span>
                </div>
                {proposal.lenderContract ? (
                  <div className="text-xs text-green-700">
                    <p className="truncate">{proposal.lenderContract.name}</p>
                    <p className="mt-1 text-green-600">
                      Signed {formatDate(proposal.lenderContract.signedAt)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Upload your signed contract</p>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setContractFile(e.target.files?.[0] || null)}
                        className="flex-1 text-xs h-8"
                      />
                      <Button
                        size="sm"
                        onClick={handleUpload}
                        disabled={!contractFile || isUploadingContract}
                        className="bg-[#E86A33] hover:bg-[#d55a25] text-white h-8 px-3"
                      >
                        {isUploadingContract ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Developer Contract */}
              <div className={cn(
                "p-3 rounded-lg border",
                proposal.developerContract ? "bg-green-100 border-green-200" : "bg-gray-50 border-gray-200"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {proposal.developerContract ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300" />
                  )}
                  <span className="text-sm font-medium">Developer&apos;s Contract</span>
                </div>
                {proposal.developerContract ? (
                  <div className="text-xs text-green-700">
                    <p className="truncate">{proposal.developerContract.name}</p>
                    <p className="mt-1 text-green-600">
                      Signed {formatDate(proposal.developerContract.signedAt)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Waiting for developer</p>
                )}
              </div>
            </div>

            {/* Contract Complete */}
            {proposal.contractStatus === "completed" && (
              <div className="mt-4 p-3 bg-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-700" />
                <span className="text-sm font-medium text-green-800">
                  Contract signing complete! Loan is now active.
                </span>
              </div>
            )}
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
              <p className="text-sm font-medium">{formatDate(proposal.bidExpiry)}</p>
            </div>

            {/* Conditions */}
            {proposal.conditions && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Your Conditions</p>
                <p className="text-sm text-gray-700">{proposal.conditions}</p>
              </div>
            )}

            {/* Uploaded Documents */}
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
          </div>
        )}
      </div>

      {/* Footer - View Project Link */}
      <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
        <Link
          href={`/dashboard/marketplace/${proposal.projectId}`}
          className="text-sm text-[#E86A33] hover:text-[#d55a25] font-medium inline-flex items-center gap-1"
        >
          View Project
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
