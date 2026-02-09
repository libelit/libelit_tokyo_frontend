import { apiClient, ApiResponse } from "./client";
import {
  DeveloperProfile,
  DeveloperProfileResponse,
  UpdateDeveloperProfileRequest,
  Document,
  DocumentResponse,
  DocumentListResponse,
  UploadDocumentRequest,
  SubmitKybResponse,
  Project,
  ProjectResponse,
  ProjectListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectDocumentsResponse,
  SubmitProjectResponse,
  DeleteResponse,
  CreateMilestoneData,
  MilestoneListResponse,
  MilestoneStoreResponse,
  MilestoneActionResponse,
  UploadProofData,
  ProofListResponse,
  ProofUploadResponse,
  UploadProjectPhotoData,
  UpdateProjectPhotoData,
  ProjectPhotoListResponse,
  ProjectPhotoUploadResponse,
  ProjectPhotoResponse,
  DeveloperProposalStatus,
  DeveloperProjectProposalListResponse,
  DeveloperProjectProposalResponse,
} from "../types/developer";

// Developer Profile Service
export const developerProfileService = {
  async getProfile(): Promise<ApiResponse<DeveloperProfileResponse>> {
    return apiClient.get<DeveloperProfileResponse>("/developer/profile");
  },

  async updateProfile(
    data: UpdateDeveloperProfileRequest
  ): Promise<ApiResponse<DeveloperProfileResponse>> {
    return apiClient.put<DeveloperProfileResponse>("/developer/profile", data);
  },
};

// KYB Service
export const kybService = {
  async getDocuments(): Promise<ApiResponse<DocumentListResponse>> {
    return apiClient.get<DocumentListResponse>("/developer/kyb/documents");
  },

  async uploadDocument(
    data: UploadDocumentRequest
  ): Promise<ApiResponse<DocumentResponse>> {
    const formData = new FormData();
    // Backend expects array format: documents[0][field]
    formData.append("documents[0][document_type]", data.document_type);
    formData.append("documents[0][title]", data.title);
    formData.append("documents[0][file]", data.file);

    // Backend returns array, but we extract first document for single upload
    const response = await apiClient.upload<DocumentListResponse>("/developer/kyb/documents", formData);

    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return {
        ...response,
        data: {
          success: response.data.success,
          data: response.data.data[0], // Extract first document
        },
      };
    }

    return response as unknown as ApiResponse<DocumentResponse>;
  },

  async deleteDocument(id: number): Promise<ApiResponse<DeleteResponse>> {
    return apiClient.delete<DeleteResponse>(`/developer/kyb/documents/${id}`);
  },

  async submit(): Promise<ApiResponse<SubmitKybResponse>> {
    return apiClient.post<SubmitKybResponse>("/developer/kyb/submit");
  },
};

// Projects Service
export const projectsService = {
  async list(params?: {
    status?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<ProjectListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
    if (params?.page) searchParams.append("page", params.page.toString());

    const queryString = searchParams.toString();
    const endpoint = `/developer/projects${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<ProjectListResponse>(endpoint);
  },

  async get(id: number): Promise<ApiResponse<ProjectResponse>> {
    return apiClient.get<ProjectResponse>(`/developer/projects/${id}`);
  },

  async create(data: CreateProjectRequest): Promise<ApiResponse<ProjectResponse>> {
    return apiClient.post<ProjectResponse>("/developer/projects", data);
  },

  async update(
    id: number,
    data: UpdateProjectRequest
  ): Promise<ApiResponse<ProjectResponse>> {
    return apiClient.put<ProjectResponse>(`/developer/projects/${id}`, data);
  },

  async delete(id: number): Promise<ApiResponse<DeleteResponse>> {
    return apiClient.delete<DeleteResponse>(`/developer/projects/${id}`);
  },

  async submit(id: number): Promise<ApiResponse<SubmitProjectResponse>> {
    return apiClient.post<SubmitProjectResponse>(`/developer/projects/${id}/submit`);
  },
};

// Project Documents Service
export const projectDocumentsService = {
  async list(projectId: number): Promise<ApiResponse<ProjectDocumentsResponse>> {
    return apiClient.get<ProjectDocumentsResponse>(
      `/developer/projects/${projectId}/documents`
    );
  },

  async upload(
    projectId: number,
    data: UploadDocumentRequest
  ): Promise<ApiResponse<DocumentResponse>> {
    const formData = new FormData();
    // Backend expects array format: documents[0][field]
    formData.append("documents[0][document_type]", data.document_type);
    formData.append("documents[0][title]", data.title);
    formData.append("documents[0][file]", data.file);

    // Backend returns array, but we extract first document for single upload
    const response = await apiClient.upload<DocumentListResponse>(
      `/developer/projects/${projectId}/documents`,
      formData
    );

    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return {
        ...response,
        data: {
          success: response.data.success,
          data: response.data.data[0], // Extract first document
        },
      };
    }

    return response as unknown as ApiResponse<DocumentResponse>;
  },

  async delete(
    projectId: number,
    documentId: number
  ): Promise<ApiResponse<DeleteResponse>> {
    return apiClient.delete<DeleteResponse>(
      `/developer/projects/${projectId}/documents/${documentId}`
    );
  },
};

// Project Milestones Service
export const milestonesService = {
  async list(projectId: number): Promise<ApiResponse<MilestoneListResponse>> {
    return apiClient.get<MilestoneListResponse>(
      `/developer/projects/${projectId}/milestones`
    );
  },

  async save(
    projectId: number,
    milestones: CreateMilestoneData[]
  ): Promise<ApiResponse<MilestoneStoreResponse>> {
    return apiClient.post<MilestoneStoreResponse>(
      `/developer/projects/${projectId}/milestones`,
      { milestones }
    );
  },

  async complete(
    projectId: number,
    milestoneId: number,
    proofs: UploadProofData[]
  ): Promise<ApiResponse<MilestoneActionResponse>> {
    const formData = new FormData();
    proofs.forEach((proof, index) => {
      formData.append(`proofs[${index}][proof_type]`, proof.proof_type);
      formData.append(`proofs[${index}][title]`, proof.title);
      if (proof.description) {
        formData.append(`proofs[${index}][description]`, proof.description);
      }
      formData.append(`proofs[${index}][file]`, proof.file);
    });

    return apiClient.upload<MilestoneActionResponse>(
      `/developer/projects/${projectId}/milestones/${milestoneId}/complete`,
      formData
    );
  },

  async listProofs(
    projectId: number,
    milestoneId: number
  ): Promise<ApiResponse<ProofListResponse>> {
    return apiClient.get<ProofListResponse>(
      `/developer/projects/${projectId}/milestones/${milestoneId}/proofs`
    );
  },

  async deleteProof(
    projectId: number,
    milestoneId: number,
    proofId: number
  ): Promise<ApiResponse<DeleteResponse>> {
    return apiClient.delete<DeleteResponse>(
      `/developer/projects/${projectId}/milestones/${milestoneId}/proofs/${proofId}`
    );
  },
};

// Project Photos Service
export const projectPhotosService = {
  async list(projectId: number): Promise<ApiResponse<ProjectPhotoListResponse>> {
    return apiClient.get<ProjectPhotoListResponse>(
      `/developer/projects/${projectId}/photos`
    );
  },

  async upload(
    projectId: number,
    photos: UploadProjectPhotoData[]
  ): Promise<ApiResponse<ProjectPhotoUploadResponse>> {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append(`photos[${index}][file]`, photo.file);
      if (photo.title) {
        formData.append(`photos[${index}][title]`, photo.title);
      }
      formData.append(`photos[${index}][is_featured]`, photo.is_featured ? 'true' : 'false');
    });

    return apiClient.upload<ProjectPhotoUploadResponse>(
      `/developer/projects/${projectId}/photos`,
      formData
    );
  },

  async update(
    projectId: number,
    photoId: number,
    data: UpdateProjectPhotoData
  ): Promise<ApiResponse<ProjectPhotoResponse>> {
    return apiClient.put<ProjectPhotoResponse>(
      `/developer/projects/${projectId}/photos/${photoId}`,
      data
    );
  },

  async delete(
    projectId: number,
    photoId: number
  ): Promise<ApiResponse<DeleteResponse>> {
    return apiClient.delete<DeleteResponse>(
      `/developer/projects/${projectId}/photos/${photoId}`
    );
  },
};

// Project Loan Proposals Service (proposals received from lenders)
export const projectProposalsService = {
  async list(
    projectId: number,
    params?: {
      status?: "all" | DeveloperProposalStatus;
      per_page?: number;
      page?: number;
    }
  ): Promise<ApiResponse<DeveloperProjectProposalListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
    if (params?.page) searchParams.append("page", params.page.toString());

    const queryString = searchParams.toString();
    const endpoint = `/developer/projects/${projectId}/loan-proposals${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<DeveloperProjectProposalListResponse>(endpoint);
  },

  async get(
    projectId: number,
    proposalId: number
  ): Promise<ApiResponse<DeveloperProjectProposalResponse>> {
    return apiClient.get<DeveloperProjectProposalResponse>(
      `/developer/projects/${projectId}/loan-proposals/${proposalId}`
    );
  },

  async startReview(
    proposalId: number
  ): Promise<ApiResponse<DeveloperProjectProposalResponse>> {
    return apiClient.patch<DeveloperProjectProposalResponse>(
      `/developer/loan-proposals/${proposalId}`,
      { action: "start_review" }
    );
  },

  async accept(
    proposalId: number
  ): Promise<ApiResponse<DeveloperProjectProposalResponse>> {
    return apiClient.patch<DeveloperProjectProposalResponse>(
      `/developer/loan-proposals/${proposalId}`,
      { action: "accept" }
    );
  },

  async reject(
    proposalId: number,
    reason?: string
  ): Promise<ApiResponse<DeveloperProjectProposalResponse>> {
    return apiClient.patch<DeveloperProjectProposalResponse>(
      `/developer/loan-proposals/${proposalId}`,
      { action: "reject", rejection_reason: reason }
    );
  },

  async sign(
    proposalId: number
  ): Promise<ApiResponse<DeveloperProjectProposalResponse>> {
    return apiClient.patch<DeveloperProjectProposalResponse>(
      `/developer/loan-proposals/${proposalId}`,
      { action: "sign" }
    );
  },
};
