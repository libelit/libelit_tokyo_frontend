"use client";

import { useState } from "react";
import { CheckCircle2, Clock, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { LenderDocumentUploadCard, LenderDocumentStatus } from "@/components/dashboard/lender-document-upload-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Hardcoded KYB status - change this to test different states:
// "not_started" | "pending" | "under_review" | "approved" | "rejected"
const HARDCODED_KYB_STATUS = "not_started";
const HARDCODED_REJECTION_REASON = "Documents were unclear. Please resubmit with better quality images.";

type LenderKybStatus = "not_started" | "pending" | "under_review" | "approved" | "rejected";

interface LenderKybDocument {
  id: string;
  type: string;
  title: string;
  description: string;
  required: boolean;
  status: LenderDocumentStatus;
  fileName?: string;
  rejectionReason?: string;
}

// Document configurations for lenders
const documentConfigs = [
  {
    type: "government_id",
    title: "Government-Issued ID",
    description: "Passport, driver's license, or national ID card",
    required: true,
  },
  {
    type: "proof_of_address",
    title: "Proof of Address",
    description: "Utility bill or bank statement (within last 3 months)",
    required: true,
  },
  {
    type: "source_of_funds",
    title: "Source of Funds Declaration",
    description: "Document explaining the origin of your investment funds",
    required: true,
  },
];

const statusSteps = [
  { key: "not_started", label: "Upload Documents" },
  { key: "pending", label: "Submit for Review" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
];

export default function LenderKybVerificationPage() {
  // Hardcoded status - in real implementation this would come from API
  const [kybStatus] = useState<LenderKybStatus>(HARDCODED_KYB_STATUS);

  // Initialize documents with hardcoded initial state
  const [documents, setDocuments] = useState<LenderKybDocument[]>(
    documentConfigs.map((config) => ({
      id: config.type,
      type: config.type,
      title: config.title,
      description: config.description,
      required: config.required,
      status: "not_uploaded" as LenderDocumentStatus,
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadedCount = documents.filter(
    (d) => d.status === "uploaded" || d.status === "verified"
  ).length;
  const requiredCount = documents.filter((d) => d.required).length;
  const allRequiredUploaded = documents
    .filter((d) => d.required)
    .every((d) => d.status === "uploaded" || d.status === "verified");
  const progressPercentage = documents.length > 0 ? (uploadedCount / documents.length) * 100 : 0;

  const handleUpload = (docType: string, file: File) => {
    // Simulate upload - in real implementation this would call an API
    setDocuments((prev) =>
      prev.map((d) =>
        d.type === docType
          ? { ...d, status: "uploading" as LenderDocumentStatus }
          : d
      )
    );

    // Simulate upload delay
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.type === docType
            ? {
                ...d,
                status: "uploaded" as LenderDocumentStatus,
                fileName: file.name,
              }
            : d
        )
      );
    }, 1500);
  };

  const handleRemove = (docType: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.type === docType
          ? { ...d, status: "not_uploaded" as LenderDocumentStatus, fileName: undefined }
          : d
      )
    );
  };

  const handleSubmit = () => {
    if (!allRequiredUploaded) return;

    setIsSubmitting(true);
    setError(null);

    // Simulate submission - in real implementation this would call an API
    setTimeout(() => {
      setIsSubmitting(false);
      // For now, just show a message since this is hardcoded
      alert("Documents submitted successfully! (This is a demo - in production, the status would update to 'pending')");
    }, 2000);
  };

  const getCurrentStepIndex = () => {
    const index = statusSteps.findIndex((s) => s.key === kybStatus);
    return index >= 0 ? index : 0;
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="KYB Verification" />

      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 text-xs mt-1 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Verification Status</h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete your identity verification to start investing in projects
            </p>
          </div>
          {kybStatus === "approved" && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Verified
            </span>
          )}
          {kybStatus === "under_review" && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Under Review
            </span>
          )}
          {kybStatus === "pending" && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Pending Review
            </span>
          )}
          {kybStatus === "rejected" && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              Rejected
            </span>
          )}
        </div>

        {/* Rejection Reason */}
        {kybStatus === "rejected" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>Rejection Reason:</strong> {HARDCODED_REJECTION_REASON}
            </p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="relative">
          <div className="flex justify-between mb-2">
            {statusSteps.map((step, index) => {
              const currentIndex = getCurrentStepIndex();
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div
                  key={step.key}
                  className={`flex flex-col items-center flex-1 ${
                    index < statusSteps.length - 1 ? "relative" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-[#E86A33] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      isCurrent ? "text-[#E86A33] font-medium" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress Line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0 mx-16" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-[#E86A33] -z-0 mx-16 transition-all"
            style={{
              width: `${(getCurrentStepIndex() / (statusSteps.length - 1)) * 100}%`,
              maxWidth: "calc(100% - 8rem)",
            }}
          />
        </div>
      </div>

      {/* Document Upload Section */}
      {(kybStatus === "not_started" || kybStatus === "rejected") && (
        <>
          {/* Progress Summary */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upload Documents</h2>
              <span className="text-sm text-gray-500">
                {uploadedCount} of {documents.length} uploaded
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">
              {allRequiredUploaded
                ? "All required documents uploaded. You can now submit for verification."
                : `Upload all required documents (${requiredCount - uploadedCount} remaining) to submit for verification.`}
            </p>
          </div>

          {/* Document Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <LenderDocumentUploadCard
                key={doc.type}
                title={doc.title}
                description={doc.description}
                required={doc.required}
                status={doc.status}
                fileName={doc.fileName}
                rejectionReason={doc.rejectionReason}
                onUpload={(file) => handleUpload(doc.type, file)}
                onRemove={() => handleRemove(doc.type)}
              />
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!allRequiredUploaded || isSubmitting}
              className="bg-[#E86A33] hover:bg-[#d55a25] disabled:bg-gray-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit for Verification"
              )}
            </Button>
          </div>
        </>
      )}

      {/* Pending/Under Review State */}
      {(kybStatus === "pending" || kybStatus === "under_review") && (
        <div className="rounded-xl border bg-white p-8 shadow-sm text-center">
          <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {kybStatus === "pending" ? "Documents Submitted" : "Under Review"}
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {kybStatus === "pending"
              ? "Your documents have been submitted successfully. Our team will review them shortly."
              : "Our team is currently reviewing your documents. This usually takes 1-2 business days."}
          </p>
          <p className="text-sm text-gray-400 mt-4">
            You will be notified once the review is complete.
          </p>
        </div>
      )}

      {/* Approved State */}
      {kybStatus === "approved" && (
        <div className="rounded-xl border bg-green-50 border-green-200 p-8 shadow-sm text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-green-800">
            Identity Verified
          </h2>
          <p className="text-green-700 max-w-md mx-auto mb-6">
            Congratulations! Your identity has been verified. You can now start investing in projects.
          </p>
          <Link href="/dashboard/marketplace">
            <Button className="bg-[#E86A33] hover:bg-[#d55a25]">
              Browse Projects
            </Button>
          </Link>
        </div>
      )}

      {/* Submitted Documents List */}
      {(kybStatus === "pending" || kybStatus === "under_review" || kybStatus === "approved") && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Submitted Documents</h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.type}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {doc.status === "verified" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : doc.status === "rejected" ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-gray-500">{doc.fileName || "document.pdf"}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === "verified"
                      ? "bg-green-100 text-green-700"
                      : doc.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {doc.status === "verified"
                    ? "Verified"
                    : doc.status === "rejected"
                    ? "Rejected"
                    : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
