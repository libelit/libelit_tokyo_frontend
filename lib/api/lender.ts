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
} from "../types/lender";

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
