"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Percent,
  Clock,
  Edit,
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";
import { DeveloperHeader } from "@/components/developer/developer-header";
import { ProjectStatusBadge, ProjectStatus } from "@/components/developer/project-status-badge";
import { DocumentUploadCard, DocumentStatus } from "@/components/developer/document-upload-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface LoanDocument {
  id: string;
  type: string;
  title: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  fileName?: string;
  rejectionReason?: string;
}

// Mock project data - will be replaced with API data
const mockProject = {
  id: "1",
  title: "Sunset Heights Residential Complex",
  type: "Residential",
  description: "A modern residential complex featuring 48 luxury apartments with stunning sunset views. The development includes premium amenities such as a rooftop garden, fitness center, and underground parking.",
  address: "123 Sunset Boulevard",
  city: "Sydney",
  country: "Australia",
  fundingGoal: 2500000,
  minInvestment: 1000,
  expectedReturn: 12,
  loanTermMonths: 24,
  ltvRatio: 70,
  status: "draft" as ProjectStatus,
  createdAt: "2026-02-01",
};

// Loan Application Documents required for Stage 1
const initialLoanDocuments: LoanDocument[] = [
  {
    id: "1",
    type: "drawings",
    title: "Architectural Drawings",
    description: "Complete architectural and engineering plans for the project",
    required: true,
    status: "not_uploaded",
  },
  {
    id: "2",
    type: "cost_calculation",
    title: "Cost Calculation",
    description: "Detailed budget breakdown and cost estimates",
    required: true,
    status: "not_uploaded",
  },
  {
    id: "3",
    type: "site_photos",
    title: "Site Photos",
    description: "Current photos of the property/site",
    required: true,
    status: "not_uploaded",
  },
  {
    id: "4",
    type: "land_title",
    title: "Land Title",
    description: "Proof of land ownership or control",
    required: true,
    status: "not_uploaded",
  },
  {
    id: "5",
    type: "bank_statement",
    title: "Bank Statement",
    description: "Recent bank statements showing available funds",
    required: true,
    status: "not_uploaded",
  },
  {
    id: "6",
    type: "revenue_evidence",
    title: "Revenue Evidence",
    description: "Evidence of business revenue and track record",
    required: false,
    status: "not_uploaded",
  },
];

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "documents">("overview");
  const [documents, setDocuments] = useState<LoanDocument[]>(initialLoanDocuments);

  const project = mockProject;
  const canEdit = project.status === "draft" || project.status === "rejected";
  const canSubmit = project.status === "draft";

  const uploadedCount = documents.filter(
    (d) => d.status === "uploaded" || d.status === "verified"
  ).length;
  const requiredCount = documents.filter((d) => d.required).length;
  const allRequiredUploaded = documents
    .filter((d) => d.required)
    .every((d) => d.status === "uploaded" || d.status === "verified");
  const progressPercentage = (uploadedCount / documents.length) * 100;

  const handleUpload = (docId: string, file: File) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, status: "uploading" as DocumentStatus } : d
      )
    );

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

  const handleSubmitForReview = () => {
    // In real implementation, call API to submit project
    console.log("Submitting project for review");
    router.push("/developer/dashboard/projects");
  };

  return (
    <div className="space-y-6">
      <DeveloperHeader title="Project Details" />

      {/* Back Link */}
      <Link
        href="/developer/dashboard/projects"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <ProjectStatusBadge status={project.status} />
              <span className="text-sm text-gray-500">{project.type}</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{project.address}, {project.city}, {project.country}</span>
            </div>
          </div>
          <div className="flex gap-3">
            {canEdit && (
              <Link href={`/developer/dashboard/projects/${project.id}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-[#E86A33] text-[#E86A33]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "documents"
                ? "border-[#E86A33] text-[#E86A33]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Loan Documents
            {!allRequiredUploaded && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                {requiredCount - documents.filter(d => d.required && (d.status === "uploaded" || d.status === "verified")).length} required
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">About This Project</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Location Details */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#E86A33]" />
                Location
              </h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Address</dt>
                  <dd className="font-medium">{project.address}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">City</dt>
                  <dd className="font-medium">{project.city}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Country</dt>
                  <dd className="font-medium">{project.country}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#E86A33]" />
                Financial Details
              </h2>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Funding Goal</dt>
                  <dd className="font-semibold">${project.fundingGoal.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Min Investment</dt>
                  <dd className="font-medium">${project.minInvestment.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Expected Return
                  </dt>
                  <dd className="font-medium text-green-600">{project.expectedReturn}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Loan Term
                  </dt>
                  <dd className="font-medium">{project.loanTermMonths} months</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">LTV Ratio</dt>
                  <dd className="font-medium">{project.ltvRatio}%</dd>
                </div>
              </dl>
            </div>

            {/* Project Info */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#E86A33]" />
                Project Info
              </h2>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Created</dt>
                  <dd className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status</dt>
                  <dd>
                    <ProjectStatusBadge status={project.status} />
                  </dd>
                </div>
              </dl>
            </div>

            {/* Submit for Review CTA */}
            {canSubmit && (
              <div className="rounded-xl border bg-amber-50 border-amber-200 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800">Ready to Submit?</h3>
                    <p className="text-sm text-amber-700 mt-1 mb-4">
                      Upload all required loan documents to submit this project for review.
                    </p>
                    <Button
                      onClick={() => setActiveTab("documents")}
                      className="bg-[#E86A33] hover:bg-[#d55a25]"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Documents
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Document Progress */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Loan Application Documents</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Upload the required documents to submit your project for review
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {uploadedCount} of {documents.length} uploaded
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />

            {allRequiredUploaded ? (
              <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-700">
                  All required documents uploaded. You can now submit your project for review.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-4">
                {requiredCount - documents.filter(d => d.required && (d.status === "uploaded" || d.status === "verified")).length} required documents remaining
              </p>
            )}
          </div>

          {/* Document Upload Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {documents.map((doc) => (
              <DocumentUploadCard
                key={doc.id}
                title={doc.title}
                description={doc.description}
                required={doc.required}
                status={doc.status}
                fileName={doc.fileName}
                rejectionReason={doc.rejectionReason}
                acceptedFormats={doc.type === "site_photos" ? "JPG, PNG" : "PDF, JPG, PNG"}
                onUpload={(file) => handleUpload(doc.id, file)}
                onRemove={() => handleRemove(doc.id)}
              />
            ))}
          </div>

          {/* Submit Button */}
          {canSubmit && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSubmitForReview}
                disabled={!allRequiredUploaded}
                className="bg-[#E86A33] hover:bg-[#d55a25] disabled:bg-gray-300"
              >
                <FileText className="mr-2 h-4 w-4" />
                Submit Project for Review
              </Button>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-xl border bg-blue-50 border-blue-200 p-6">
            <h3 className="font-medium text-blue-800 mb-2">What happens after submission?</h3>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Your project and documents will be reviewed by our team</li>
              <li>Review typically takes 2-3 business days</li>
              <li>You&apos;ll be notified once the review is complete</li>
              <li>If approved, your project will be listed for investor funding</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
