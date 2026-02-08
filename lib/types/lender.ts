// Lender Profile Types
export interface LenderProfile {
  id: number;
  user_id: number;
  lender_type: LenderType | null;
  company_name: string | null;
  address: string | null;
  kyb_status: KybStatus;
  kyb_submitted_at: string | null;
  kyb_approved_at: string | null;
  kyb_rejection_reason: string | null;
  aml_status: string | null;
  aml_checked_at: string | null;
  accreditation_status: string | null;
  accreditation_expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: LenderUser;
}

export interface LenderUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  type: string;
  status: string;
}

export type LenderType = 'tier_1' | 'tier_2' | 'tier_3';

export type KybStatus = 'not_started' | 'pending' | 'under_review' | 'approved' | 'rejected';

// Lender KYB Document Types
export type LenderKybDocumentType =
  | 'kyb_lender_certificate_of_incorporation'
  | 'kyb_lender_business_license'
  | 'kyb_lender_beneficial_ownership'
  | 'kyb_lender_tax_certificate'
  | 'kyb_lender_address_proof';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface LenderDocument {
  id: number;
  document_type: LenderKybDocumentType;
  title: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  file_url: string;
  verification_status: VerificationStatus;
  verified_at: string | null;
  rejection_reason: string | null;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

export interface UploadLenderDocumentRequest {
  document_type: LenderKybDocumentType;
  title: string;
  file: File;
}

export interface BatchUploadLenderDocumentRequest {
  documents: UploadLenderDocumentRequest[];
}

// API Response Types
export interface LenderProfileResponse {
  success: boolean;
  data: LenderProfile;
  message?: string;
}

export interface LenderDocumentResponse {
  success: boolean;
  data: LenderDocument;
  message?: string;
}

export interface LenderDocumentListResponse {
  success: boolean;
  data: LenderDocument[];
}

export interface SubmitLenderKybResponse {
  success: boolean;
  message: string;
  data?: {
    kyb_status: KybStatus;
    kyb_submitted_at: string;
  };
  missing_documents?: { type: string; label: string }[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
