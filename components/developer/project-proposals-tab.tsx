"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Loader2, CheckCircle2, XCircle, AlertCircle, Upload, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProposalCard } from "./proposal-card";
import { loanProposalsService } from "@/lib/api/loan-proposals";
import { LoanProposal } from "@/lib/types/loan-proposal";
import { toast } from "sonner";

interface ProjectProposalsTabProps {
  projectId: string;
}

export function ProjectProposalsTab({ projectId }: ProjectProposalsTabProps) {
  const [proposals, setProposals] = useState<LoanProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });

  // Accept/Reject state
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Contract upload state
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isUploadingContract, setIsUploadingContract] = useState(false);

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await loanProposalsService.getByProject(projectId);
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
  }, [projectId]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleAccept = async (proposalId: string) => {
    setAcceptingId(proposalId);
    try {
      const response = await loanProposalsService.accept(proposalId);
      if (response.success) {
        toast.success("Proposal accepted successfully");
        setShowAcceptDialog(null);
        await fetchProposals();
      } else {
        toast.error(response.message || "Failed to accept proposal");
      }
    } catch (error) {
      console.error("Error accepting proposal:", error);
      toast.error("Failed to accept proposal");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (proposalId: string) => {
    setRejectingId(proposalId);
    try {
      const response = await loanProposalsService.reject(proposalId, rejectReason || undefined);
      if (response.success) {
        toast.success("Proposal rejected");
        setShowRejectDialog(null);
        setRejectReason("");
        await fetchProposals();
      } else {
        toast.error(response.message || "Failed to reject proposal");
      }
    } catch (error) {
      console.error("Error rejecting proposal:", error);
      toast.error("Failed to reject proposal");
    } finally {
      setRejectingId(null);
    }
  };

  const handleContractUpload = async (proposalId: string) => {
    if (!contractFile) return;

    setIsUploadingContract(true);
    try {
      const response = await loanProposalsService.uploadContract(
        proposalId,
        "developer",
        contractFile.name
      );
      if (response.success) {
        toast.success("Contract uploaded successfully");
        setContractFile(null);
        await fetchProposals();
      } else {
        toast.error(response.message || "Failed to upload contract");
      }
    } catch (error) {
      console.error("Error uploading contract:", error);
      toast.error("Failed to upload contract");
    } finally {
      setIsUploadingContract(false);
    }
  };

  // Get the accepted proposal if any
  const acceptedProposal = proposals.find((p) => p.status === "accepted");
  const pendingProposals = proposals.filter(
    (p) => p.status === "submitted" || p.status === "under_review"
  );
  const rejectedProposals = proposals.filter((p) => p.status === "rejected");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#E86A33]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#E86A33]" />
          Loan Proposals
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Received</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-600">Pending Review</p>
            <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Accepted</p>
            <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">Rejected</p>
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Accepted Proposal Banner */}
      {acceptedProposal && (
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Proposal Accepted</h3>
              <p className="text-sm text-green-700 mt-1">
                You accepted the proposal from <strong>{acceptedProposal.lenderName}</strong>.
                {acceptedProposal.contractStatus === "pending" && (
                  <span> Please proceed with uploading the signed contract.</span>
                )}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-green-600">Amount:</span>{" "}
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: acceptedProposal.currency,
                      minimumFractionDigits: 0,
                    }).format(acceptedProposal.amountOffered)}
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Interest Rate:</span>{" "}
                  <span className="font-medium">{acceptedProposal.interestRate}%</span>
                </div>
                <div>
                  <span className="text-green-600">LTV:</span>{" "}
                  <span className="font-medium">{acceptedProposal.maxLTV}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Status & Upload */}
          <div className="pt-4 border-t border-green-200">
            <h4 className="font-medium text-green-800 mb-3">Contract Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lender Contract */}
              <div className={`p-4 rounded-lg border ${
                acceptedProposal.lenderContract
                  ? "bg-green-100 border-green-300"
                  : "bg-white border-gray-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {acceptedProposal.lenderContract ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  <span className="font-medium">Lender&apos;s Contract</span>
                </div>
                {acceptedProposal.lenderContract ? (
                  <div className="text-sm text-green-700">
                    <p>{acceptedProposal.lenderContract.name}</p>
                    <p className="text-xs mt-1">
                      Signed on {new Date(acceptedProposal.lenderContract.signedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Waiting for lender to sign</p>
                )}
              </div>

              {/* Developer Contract */}
              <div className={`p-4 rounded-lg border ${
                acceptedProposal.developerContract
                  ? "bg-green-100 border-green-300"
                  : "bg-white border-gray-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {acceptedProposal.developerContract ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  <span className="font-medium">Your Signed Contract</span>
                </div>
                {acceptedProposal.developerContract ? (
                  <div className="text-sm text-green-700">
                    <p>{acceptedProposal.developerContract.name}</p>
                    <p className="text-xs mt-1">
                      Signed on {new Date(acceptedProposal.developerContract.signedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">Upload your signed contract</p>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setContractFile(e.target.files?.[0] || null)}
                        className="flex-1 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleContractUpload(acceptedProposal.id)}
                        disabled={!contractFile || isUploadingContract}
                        className="bg-[#E86A33] hover:bg-[#d55a25] text-white"
                      >
                        {isUploadingContract ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contract Completed Message */}
            {acceptedProposal.contractStatus === "completed" && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Contract Signing Complete!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Both parties have signed the contract. The loan is now active.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Proposals */}
      {pendingProposals.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Pending Review ({pendingProposals.length})
          </h3>
          <div className="space-y-4">
            {pendingProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onAccept={() => setShowAcceptDialog(proposal.id)}
                onReject={() => setShowRejectDialog(proposal.id)}
                isAccepting={acceptingId === proposal.id}
                isRejecting={rejectingId === proposal.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Proposals */}
      {rejectedProposals.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Rejected ({rejectedProposals.length})
          </h3>
          <div className="space-y-4">
            {rejectedProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {proposals.length === 0 && (
        <div className="rounded-xl border bg-white p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Once your project is approved and listed in the marketplace, lenders will be able to
            submit loan proposals. You&apos;ll see them here.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-xl border bg-blue-50 border-blue-200 p-6">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          About Loan Proposals
        </h3>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Review each proposal carefully before making a decision</li>
          <li>Compare interest rates, LTV, and security packages</li>
          <li>Accepting a proposal will automatically reject all others</li>
          <li>After acceptance, both parties need to sign the contract</li>
        </ul>
      </div>

      {/* Accept Confirmation Dialog */}
      <Dialog open={!!showAcceptDialog} onOpenChange={() => setShowAcceptDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Accept Proposal
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this proposal? This action will:
            </DialogDescription>
          </DialogHeader>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 my-4 px-6">
            <li>Accept the selected proposal</li>
            <li>Automatically reject all other pending proposals</li>
            <li>Notify the lender about acceptance</li>
            <li>Move to the contract signing phase</li>
          </ul>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAcceptDialog(null)}
              disabled={!!acceptingId}
            >
              Cancel
            </Button>
            <Button
              onClick={() => showAcceptDialog && handleAccept(showAcceptDialog)}
              disabled={!!acceptingId}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {acceptingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Yes, Accept Proposal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={!!showRejectDialog} onOpenChange={() => setShowRejectDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Proposal
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this proposal? The lender will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 px-5">
            <Label htmlFor="rejectReason">Reason for rejection (optional)</Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide feedback to the lender..."
              className="mt-2"
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(null);
                setRejectReason("");
              }}
              disabled={!!rejectingId}
            >
              Cancel
            </Button>
            <Button
              onClick={() => showRejectDialog && handleReject(showRejectDialog)}
              disabled={!!rejectingId}
              variant="destructive"
            >
              {rejectingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Proposal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
