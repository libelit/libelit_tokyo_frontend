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
    formData.append("document_type", data.document_type);
    formData.append("title", data.title);
    formData.append("file", data.file);

    return apiClient.upload<DocumentResponse>("/developer/kyb/documents", formData);
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
    formData.append("document_type", data.document_type);
    formData.append("title", data.title);
    formData.append("file", data.file);

    return apiClient.upload<DocumentResponse>(
      `/developer/projects/${projectId}/documents`,
      formData
    );
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
