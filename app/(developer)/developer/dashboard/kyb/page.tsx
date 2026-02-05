"use client";

import { useState } from "react";
import { CheckCircle2, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DeveloperHeader } from "@/components/developer/developer-header";
import { DocumentUploadCard, DocumentStatus } from "@/components/developer/document-upload-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type KybStatus = "not_started" | "pending" | "under_review" | "approved" | "rejected";

interface KybDocument {
  id: string;
  type: string;
  title: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  fileName?: string;
  rejectionReason?: string;
}

// Mock data - will be replaced with API data
const initialDocuments: KybDocument[] = [
  {
    id: "1",
    type: "company_registration",
    title: "Company Registration Certificate",
    description: "Official certificate proving your business is legally registered",
    required: true,
    status: "not_uploaded",
  },
  {
    id: "2",
    type: "director_id",
    title: "Director/Owner ID",
    description: "Government-issued identification of the company director or owner",
    required: true,
    status: "not_uploaded",
  },
  {
    id: "3",
    type: "address_proof",
    title: "Business Address Proof",
    description: "Utility bill or official letter showing your business address (within last 3 months)",
    required: true,
    status: "not_uploaded",
  },
];

const statusSteps = [
  { key: "not_started", label: "Upload Documents" },
  { key: "pending", label: "Submit for Review" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
];

export default function KybVerificationPage() {
  const [kybStatus, setKybStatus] = useState<KybStatus>("not_started");
  const [documents, setDocuments] = useState<KybDocument[]>(initialDocuments);

  const uploadedCount = documents.filter(
    (d) => d.status === "uploaded" || d.status === "verified"
  ).length;
  const requiredCount = documents.filter((d) => d.required).length;
  const allRequiredUploaded = documents
    .filter((d) => d.required)
    .every((d) => d.status === "uploaded" || d.status === "verified");
  const progressPercentage = (uploadedCount / documents.length) * 100;

  const handleUpload = (docId: string, file: File) => {
    // Simulate upload
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, status: "uploading" as DocumentStatus } : d
      )
    );

    // Simulate upload completion after 1 second
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? { ...d, status: "uploaded" as DocumentStatus, fileName: file.name }
            : d
        )
      );
    }, 1000);
  };

  const handleRemove = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, status: "not_uploaded" as DocumentStatus, fileName: undefined }
          : d
      )
    );
  };

  const handleSubmit = () => {
    if (allRequiredUploaded) {
      setKybStatus("pending");
      // In real implementation, call API to submit KYB
    }
  };

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex((s) => s.key === kybStatus);
  };

  return (
    <div className="space-y-6">
      <DeveloperHeader title="KYB Verification" />

      {/* Back Link */}
      <Link
        href="/developer/dashboard"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      {/* Status Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Verification Status</h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete your business verification to start submitting projects
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

        {/* Progress Steps */}
        <div className="relative">
          <div className="flex justify-between mb-2">
            {statusSteps.map((step, index) => {
              const currentIndex = getCurrentStepIndex();
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isPending = index > currentIndex;

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
              <DocumentUploadCard
                key={doc.id}
                title={doc.title}
                description={doc.description}
                required={doc.required}
                status={doc.status}
                fileName={doc.fileName}
                rejectionReason={doc.rejectionReason}
                onUpload={(file) => handleUpload(doc.id, file)}
                onRemove={() => handleRemove(doc.id)}
              />
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!allRequiredUploaded}
              className="bg-[#E86A33] hover:bg-[#d55a25] disabled:bg-gray-300"
            >
              Submit for Verification
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
            Business Verified
          </h2>
          <p className="text-green-700 max-w-md mx-auto mb-6">
            Congratulations! Your business has been verified. You can now create and submit projects for funding.
          </p>
          <Link href="/developer/dashboard/projects/new">
            <Button className="bg-[#E86A33] hover:bg-[#d55a25]">
              Create Your First Project
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
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-gray-500">{doc.fileName}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Uploaded
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
