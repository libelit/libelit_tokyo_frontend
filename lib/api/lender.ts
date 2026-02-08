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
} from "../types/lender";
import {
  ProjectDocumentsResponse,
  MilestoneListResponse,
  ProjectPhotoListResponse,
} from "../types/developer";

// Lender Profile Service
export const lenderProfileService = {
  async getProfile(): Promise<ApiResponse<LenderProfileResponse>> {
    return apiClient.get<LenderProfileResponse>("/lender/profile");
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
    project_type?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<LenderProjectListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
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
