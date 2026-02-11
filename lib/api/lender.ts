import { apiClient, ApiResponse } from "./client";
import {
  LenderProfile,
  LenderProfileResponse,
  LenderDocument,
  LenderDocumentResponse,
  LenderDocumentListResponse,
  UploadLenderDocumentRequest,
  BatchUploadLenderDocumentRequest,
  SubmitLenderKybResponse,
  DeleteResponse,
  LenderProjectListResponse,
  LenderProjectResponse,
  LenderProposalListResponse,
  LenderProposalResponse,
  CreateLenderProposalRequest,
  CreateLenderProposalResponse,
  LenderDrawdownResponse,
  LenderMilestoneResponse,
  LenderMilestoneActionResponse,
  UploadPaymentProofData,
} from "../types/lender";
import {
  ProjectDocumentsResponse,
  MilestoneListResponse,
  ProjectPhotoListResponse,
} from "../types/developer";

// Update Lender Profile Request
export interface UpdateLenderProfileRequest {
  name?: string;
  phone?: string;
  company_name?: string;
  address?: string;
}

// Lender Profile Service
export const lenderProfileService = {
  async getProfile(): Promise<ApiResponse<LenderProfileResponse>> {
    return apiClient.get<LenderProfileResponse>("/lender/profile");
  },

  async updateProfile(
    data: UpdateLenderProfileRequest
  ): Promise<ApiResponse<LenderProfileResponse>> {
    return apiClient.put<LenderProfileResponse>("/lender/profile", data);
  },
};

// Lender KYB Service
export const lenderKybService = {
  async getDocuments(): Promise<ApiResponse<LenderDocumentListResponse>> {
    return apiClient.get<LenderDocumentListResponse>("/lender/kyb/documents");
  },

  async uploadDocument(
    data: UploadLenderDocumentRequest
  ): Promise<ApiResponse<LenderDocumentResponse>> {
    const formData = new FormData();
    // Backend expects array format: documents[0][field]
    formData.append("documents[0][document_type]", data.document_type);
    formData.append("documents[0][title]", data.title);
    formData.append("documents[0][file]", data.file);

    // Backend returns array, but we extract first document for single upload
    const response = await apiClient.upload<LenderDocumentListResponse>(
      "/lender/kyb/documents",
      formData
    );

    if (
      response.data?.data &&
      Array.isArray(response.data.data) &&
      response.data.data.length > 0
    ) {
      return {
        ...response,
        data: {
          success: response.data.success,
          data: response.data.data[0], // Extract first document
        },
      };
    }

    return response as unknown as ApiResponse<LenderDocumentResponse>;
  },

  async uploadDocuments(
    data: BatchUploadLenderDocumentRequest
  ): Promise<ApiResponse<LenderDocumentListResponse>> {
    const formData = new FormData();

    // Backend expects array format: documents[index][field]
    data.documents.forEach((doc, index) => {
      formData.append(`documents[${index}][document_type]`, doc.document_type);
      formData.append(`documents[${index}][title]`, doc.title);
      formData.append(`documents[${index}][file]`, doc.file);
    });

    return apiClient.upload<LenderDocumentListResponse>(
      "/lender/kyb/documents",
      formData
    );
  },

  async deleteDocument(id: number): Promise<ApiResponse<DeleteResponse>> {
    return apiClient.delete<DeleteResponse>(`/lender/kyb/documents/${id}`);
  },

  async submit(): Promise<ApiResponse<SubmitLenderKybResponse>> {
    return apiClient.post<SubmitLenderKybResponse>("/lender/kyb/submit");
  },
};

// Lender Projects Service (for marketplace - viewing submitted projects)
export const lenderProjectsService = {
  async list(params?: {
    search?: string;
    status?: string;
    project_type?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<LenderProjectListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.project_type) searchParams.append("project_type", params.project_type);
    if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
    if (params?.page) searchParams.append("page", params.page.toString());

    const queryString = searchParams.toString();
    const endpoint = `/lender/projects${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<LenderProjectListResponse>(endpoint);
  },

  async get(id: number): Promise<ApiResponse<LenderProjectResponse>> {
    return apiClient.get<LenderProjectResponse>(`/lender/projects/${id}`);
  },
};

// Lender Project Documents Service (read-only access to project documents)
export const lenderProjectDocumentsService = {
  async list(projectId: number): Promise<ApiResponse<ProjectDocumentsResponse>> {
    return apiClient.get<ProjectDocumentsResponse>(
      `/lender/projects/${projectId}/documents`
    );
  },
};

// Lender Project Milestones Service (read-only access to project milestones)
export const lenderMilestonesService = {
  async list(projectId: number): Promise<ApiResponse<MilestoneListResponse>> {
    return apiClient.get<MilestoneListResponse>(
      `/lender/projects/${projectId}/milestones`
    );
  },
};

// Lender Project Photos Service (read-only access to project photos)
export const lenderProjectPhotosService = {
  async list(projectId: number): Promise<ApiResponse<ProjectPhotoListResponse>> {
    return apiClient.get<ProjectPhotoListResponse>(
      `/lender/projects/${projectId}/photos`
    );
  },
};

// Lender Proposals Service
export const lenderProposalsService = {
  async list(params?: {
    status?: 'all' | 'submitted_by_lender' | 'under_review_by_developer' | 'accepted_by_developer' | 'rejected_by_developer' | 'signed_by_developer' | 'signed_by_lender' | 'loan_term_fully_executed';
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<LenderProposalListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
    if (params?.page) searchParams.append("page", params.page.toString());

    const queryString = searchParams.toString();
    const endpoint = `/lender/loan-proposals${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<LenderProposalListResponse>(endpoint);
  },

  async get(id: number): Promise<ApiResponse<LenderProposalResponse>> {
    return apiClient.get<LenderProposalResponse>(`/lender/loan-proposals/${id}`);
  },

  async create(data: CreateLenderProposalRequest): Promise<ApiResponse<CreateLenderProposalResponse>> {
    const formData = new FormData();

    formData.append("project_id", data.project_id.toString());
    formData.append("loan_amount_offered", data.loan_amount_offered.toString());
    formData.append("currency", data.currency);
    formData.append("interest_rate", data.interest_rate.toString());
    formData.append("loan_maturity_date", data.loan_maturity_date);
    formData.append("max_ltv_accepted", data.max_ltv_accepted.toString());
    formData.append("bid_expiry_date", data.bid_expiry_date);

    // Append security packages as array
    data.security_packages.forEach((pkg) => {
      formData.append("security_packages[]", pkg);
    });

    if (data.additional_conditions) {
      formData.append("additional_conditions", data.additional_conditions);
    }

    if (data.loan_term_agreement) {
      formData.append("loan_term_agreement", data.loan_term_agreement);
    }

    return apiClient.upload<CreateLenderProposalResponse>(
      "/lender/loan-proposals",
      formData
    );
  },

  async sign(proposalId: number): Promise<ApiResponse<LenderProposalResponse>> {
    return apiClient.patch<LenderProposalResponse>(
      `/lender/loan-proposals/${proposalId}`,
      { action: "sign" }
    );
  },
};

// Lender Drawdown Service (Milestone Review & Payment)
export const lenderDrawdownService = {
  // List all milestones for a specific project
  async listMilestones(projectId: number): Promise<ApiResponse<LenderDrawdownResponse>> {
    return apiClient.get<LenderDrawdownResponse>(
      `/lender/projects/${projectId}/milestones`
    );
  },

  // Get single milestone details
  async getMilestone(
    projectId: number,
    milestoneId: number
  ): Promise<ApiResponse<LenderMilestoneResponse>> {
    return apiClient.get<LenderMilestoneResponse>(
      `/lender/projects/${projectId}/milestones/${milestoneId}`
    );
  },

  // Approve a milestone
  async approveMilestone(
    projectId: number,
    milestoneId: number
  ): Promise<ApiResponse<LenderMilestoneActionResponse>> {
    return apiClient.post<LenderMilestoneActionResponse>(
      `/lender/projects/${projectId}/milestones/${milestoneId}/approve`
    );
  },

  // Reject a milestone with reason
  async rejectMilestone(
    projectId: number,
    milestoneId: number,
    rejectionReason: string
  ): Promise<ApiResponse<LenderMilestoneActionResponse>> {
    return apiClient.post<LenderMilestoneActionResponse>(
      `/lender/projects/${projectId}/milestones/${milestoneId}/reject`,
      { rejection_reason: rejectionReason }
    );
  },

  // Upload payment proof for an approved milestone
  async uploadPaymentProof(
    projectId: number,
    milestoneId: number,
    proofs: UploadPaymentProofData[],
    paymentReference?: string
  ): Promise<ApiResponse<LenderMilestoneActionResponse>> {
    const formData = new FormData();

    proofs.forEach((proof, index) => {
      formData.append(`proofs[${index}][title]`, proof.title);
      formData.append(`proofs[${index}][file]`, proof.file);
    });

    if (paymentReference) {
      formData.append("payment_reference", paymentReference);
    }

    return apiClient.upload<LenderMilestoneActionResponse>(
      `/lender/projects/${projectId}/milestones/${milestoneId}/payment-proof`,
      formData
    );
  },
};
