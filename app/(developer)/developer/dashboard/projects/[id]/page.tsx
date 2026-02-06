"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { DeveloperHeader } from "@/components/developer/developer-header";
import { ProjectStatusBadge } from "@/components/developer/project-status-badge";
import { DocumentUploadCard, DocumentStatus } from "@/components/developer/document-upload-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { projectsService, projectDocumentsService } from "@/lib/api/developer";
import {
  Project,
  Document,
  DocumentType,
  DocumentChecklistItem,
} from "@/lib/types/developer";
import { toast } from "sonner";

// Map document type to display info
const documentTypeInfo: Record<string, { title: string; description: string }> = {
  loan_drawings: {
    title: "Architectural Drawings",
    description: "Complete architectural and engineering plans for the project",
  },
  loan_cost_calculation: {
    title: "Cost Calculation",
    description: "Detailed budget breakdown and cost estimates",
  },
  loan_photos: {
    title: "Site Photos",
    description: "Current photos of the property/site",
  },
  loan_land_title: {
    title: "Land Title",
    description: "Proof of land ownership or control",
  },
  loan_bank_statement: {
    title: "Bank Statement",
    description: "Recent bank statements showing available funds",
  },
  loan_revenue_evidence: {
    title: "Revenue Evidence",
    description: "Evidence of business revenue and track record",
  },
};

// Map verification status to document status
const mapVerificationToDocStatus = (
  verificationStatus: string | undefined
): DocumentStatus => {
  if (!verificationStatus) return "not_uploaded";
  switch (verificationStatus) {
    case "approved":
      return "verified";
    case "rejected":
      return "rejected";
    case "pending":
    default:
      return "uploaded";
  }
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  const [activeTab, setActiveTab] = useState<"overview" | "documents">("overview");
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [checklist, setChecklist] = useState<DocumentChecklistItem[]>([]);
  const [allRequiredUploaded, setAllRequiredUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const response = await projectsService.get(projectId);
      if (response.data?.success) {
        setProject(response.data.data);
      } else {
        toast.error("Failed to load project");
        router.push("/developer/dashboard/projects");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project");
      router.push("/developer/dashboard/projects");
    }
  }, [projectId, router]);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await projectDocumentsService.list(projectId);
      if (response.data?.success) {
        setDocuments(response.data.data.documents);
        setChecklist(response.data.data.document_checklist);
        setAllRequiredUploaded(response.data.data.all_required_uploaded);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, [projectId]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProject(), fetchDocuments()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchProject, fetchDocuments]);

  const canEdit = project?.status === "draft" || project?.status === "rejected";
  const canSubmit = project?.status === "draft";

  // Get document for a checklist item
  const getDocumentForType = (type: DocumentType): Document | undefined => {
    return documents.find((d) => d.document_type === type);
  };

  // Calculate progress
  const uploadedCount = checklist.filter((item) => item.uploaded).length;
  const progressPercentage = checklist.length > 0
    ? (uploadedCount / checklist.length) * 100
    : 0;
  const requiredRemaining = checklist.filter((item) => item.required && !item.uploaded).length;

  const handleUpload = async (docType: DocumentType, file: File) => {
    setUploadingDocType(docType);
    try {
      const response = await projectDocumentsService.upload(projectId, {
        document_type: docType,
        title: documentTypeInfo[docType]?.title || docType,
        file,
      });
      if (response.data?.success) {
        toast.success("Document uploaded successfully");
        await fetchDocuments();
      } else {
        toast.error(response.data?.message || "Failed to upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleRemove = async (docId: number) => {
    if (!confirm("Are you sure you want to remove this document?")) return;

    setDeletingDocId(docId);
    try {
      const response = await projectDocumentsService.delete(projectId, docId);
      if (response.data?.success) {
        toast.success("Document removed");
        await fetchDocuments();
      } else {
        toast.error(response.data?.message || "Failed to remove document");
      }
    } catch (error) {
      console.error("Error removing document:", error);
      toast.error("Failed to remove document");
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleSubmitForReview = async () => {
    if (!allRequiredUploaded) {
      toast.error("Please upload all required documents first");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await projectsService.submit(projectId);
      if (response.data?.success) {
        toast.success("Project submitted for review");
        await fetchProject();
      } else {
        if (response.data?.missing_documents) {
          const missing = response.data.missing_documents.map((d) => d.label).join(", ");
          toast.error(`Missing documents: ${missing}`);
        } else {
          toast.error(response.data?.message || "Failed to submit project");
        }
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error("Failed to submit project");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DeveloperHeader title="Project Details" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#E86A33]" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <DeveloperHeader title="Project Details" />
        <div className="rounded-xl border bg-white p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Project not found</h2>
          <Link href="/developer/dashboard/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

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
              <span className="text-sm text-gray-500 capitalize">
                {project.project_type.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>
                {[project.address, project.city, project.country]
                  .filter(Boolean)
                  .join(", ") || "Location not set"}
              </span>
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

      {/* Rejection Reason */}
      {project.status === "rejected" && project.rejection_reason && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Project Rejected</h3>
              <p className="text-sm text-red-700 mt-1">{project.rejection_reason}</p>
            </div>
          </div>
        </div>
      )}

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
            {requiredRemaining > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                {requiredRemaining} required
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
              <p className="text-gray-600 whitespace-pre-wrap">
                {project.description || "No description provided."}
              </p>
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
                  <dd className="font-medium">{project.address || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">City</dt>
                  <dd className="font-medium">{project.city || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Country</dt>
                  <dd className="font-medium">{project.country || "-"}</dd>
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
                  <dd className="font-semibold">${project.funding_goal.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Min Investment</dt>
                  <dd className="font-medium">${project.min_investment.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Expected Return
                  </dt>
                  <dd className="font-medium text-green-600">{project.expected_return}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Loan Term
                  </dt>
                  <dd className="font-medium">{project.loan_term_months} months</dd>
                </div>
                {project.ltv_ratio && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">LTV Ratio</dt>
                    <dd className="font-medium">{project.ltv_ratio}%</dd>
                  </div>
                )}
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
                    {new Date(project.created_at).toLocaleDateString()}
                  </dd>
                </div>
                {project.submitted_at && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Submitted</dt>
                    <dd className="font-medium">
                      {new Date(project.submitted_at).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {project.approved_at && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Approved</dt>
                    <dd className="font-medium">
                      {new Date(project.approved_at).toLocaleDateString()}
                    </dd>
                  </div>
                )}
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
                {uploadedCount} of {checklist.length} uploaded
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
                {requiredRemaining} required documents remaining
              </p>
            )}
          </div>

          {/* Document Upload Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {checklist.map((item) => {
              const doc = getDocumentForType(item.type);
              const info = documentTypeInfo[item.type] || { title: item.label, description: "" };
              const isUploading = uploadingDocType === item.type;
              const isDeleting = doc && deletingDocId === doc.id;

              let status: DocumentStatus = "not_uploaded";
              if (isUploading) {
                status = "uploading";
              } else if (doc) {
                status = mapVerificationToDocStatus(doc.verification_status);
              }

              return (
                <div key={item.type} className="relative">
                  {isDeleting && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
                      <Loader2 className="h-6 w-6 animate-spin text-[#E86A33]" />
                    </div>
                  )}
                  <DocumentUploadCard
                    title={info.title}
                    description={info.description}
                    required={item.required}
                    status={status}
                    fileName={doc?.file_name}
                    rejectionReason={doc?.rejection_reason || undefined}
                    acceptedFormats={item.type === "loan_photos" ? "JPG, PNG" : "PDF, JPG, PNG"}
                    onUpload={(file) => handleUpload(item.type, file)}
                    onRemove={() => doc && handleRemove(doc.id)}
                  />
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          {canSubmit && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSubmitForReview}
                disabled={!allRequiredUploaded || isSubmitting}
                className="bg-[#E86A33] hover:bg-[#d55a25] disabled:bg-gray-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Submit Project for Review
                  </>
                )}
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
