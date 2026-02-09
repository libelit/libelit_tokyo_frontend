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

// Lender Marketplace Project Types
export interface LenderProjectPhoto {
  id: number;
  uuid: string;
  title: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  is_featured: boolean;
  sort_order: number;
}

export interface LenderProjectDeveloperUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LenderProjectDeveloper {
  id: number;
  user_id: number;
  company_name: string | null;
  company_registration_number: string | null;
  address: string | null;
  kyb_status: string;
  kyb_submitted_at: string | null;
  kyb_approved_at: string | null;
  kyb_rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  user?: LenderProjectDeveloperUser;
}

export type LenderProjectType = 'residential' | 'commercial' | 'mixed_use' | 'industrial' | 'land';
export type LenderProjectStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'funded' | 'completed';

export interface LenderProjectDocument {
  id: number;
  document_type: string;
  document_type_label: string;
  title: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_size_formatted: string;
  mime_type: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at: string | null;
  rejection_reason: string | null;
  expires_at: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  file_url: string;
}

export interface LenderProjectMilestone {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  sequence: number;
  amount: string;
  percentage: string;
  status: 'pending' | 'proof_submitted' | 'approved' | 'paid' | 'rejected';
  status_label: string;
  due_date: string | null;
  proof_submitted_at: string | null;
  approved_at: string | null;
  approved_by: number | null;
  paid_at: string | null;
  payment_reference: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  proofs: unknown[];
  can_complete: boolean;
}

export interface LenderProject {
  id: number;
  uuid: string;
  title: string;
  description: string | null;
  project_type: LenderProjectType;
  project_type_label: string;
  address: string | null;
  city: string | null;
  country: string | null;
  loan_amount: number;
  amount_raised: number;
  funding_progress: number;
  currency: string;
  min_investment: string;
  status: LenderProjectStatus;
  status_label: string;
  submitted_at: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  listed_at: string | null;
  funded_at: string | null;
  construction_start_date: string | null;
  construction_end_date: string | null;
  created_at: string;
  updated_at: string;
  developer: LenderProjectDeveloper | null;
  documents?: LenderProjectDocument[];
  documents_count?: number;
  milestones?: LenderProjectMilestone[];
  milestones_count: number;
  lenders_count: number;
  cover_photo_url: string | null;
  photos: LenderProjectPhoto[];
  photos_count: number;
}

export interface LenderProjectListResponse {
  success: boolean;
  data: LenderProject[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LenderProjectResponse {
  success: boolean;
  data: LenderProject;
  message?: string;
}

// Lender Loan Proposal Types
export type LenderProposalStatus =
  | 'submitted_by_lender'
  | 'under_review_by_developer'
  | 'accepted_by_developer'
  | 'rejected_by_developer'
  | 'signed_by_developer'
  | 'signed_by_lender'
  | 'loan_term_fully_executed';

export type LenderSecurityPackageType =
  | 'mortgage'
  | 'spv_charge'
  | 'guarantees'
  | 'personal_guarantee'
  | 'corporate_guarantee';

export interface LenderProposalDocument {
  id: number;
  document_type: string;
  document_type_label: string;
  title: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_size_formatted: string;
  mime_type: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_at: string | null;
  rejection_reason: string | null;
  expires_at: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  file_url: string;
}

export interface LenderProposalProject {
  id: number;
  uuid: string;
  title: string;
  description: string | null;
  project_type: LenderProjectType;
  project_type_label: string;
  address: string | null;
  city: string | null;
  country: string | null;
  loan_amount: number;
  amount_raised: number;
  funding_progress: number;
  currency: string;
  min_investment: string;
  status: LenderProjectStatus;
  status_label: string;
  submitted_at: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  listed_at: string | null;
  funded_at: string | null;
  construction_start_date: string | null;
  construction_end_date: string | null;
  created_at: string;
  updated_at: string;
  developer: LenderProjectDeveloper | null;
  lenders_count: number;
  cover_photo_url: string | null;
}

export interface LenderLoanProposal {
  id: number;
  uuid: string;
  loan_amount_offered: number;
  currency: string;
  interest_rate: number;
  loan_maturity_date: string;
  security_packages: LenderSecurityPackageType[];
  max_ltv_accepted: number;
  bid_expiry_date: string;
  additional_conditions: string | null;
  status: LenderProposalStatus;
  status_label: string;
  rejection_reason: string | null;
  accepted_at: string | null;
  developer_signed_at: string | null;
  lender_signed_at: string | null;
  created_at: string;
  updated_at: string;
  project: LenderProposalProject;
  documents: LenderProposalDocument[];
  documents_count: number;
}

export interface LenderProposalListResponse {
  success: boolean;
  data: LenderLoanProposal[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LenderProposalResponse {
  success: boolean;
  data: LenderLoanProposal;
  message?: string;
}

// Security Package Labels for display
export const lenderSecurityPackageLabels: Record<LenderSecurityPackageType, string> = {
  mortgage: 'Mortgage',
  spv_charge: 'SPV Charge',
  guarantees: 'Guarantees',
  personal_guarantee: 'Personal Guarantee',
  corporate_guarantee: 'Corporate Guarantee',
};

// Status Labels and Colors for display
export const lenderProposalStatusConfig: Record<LenderProposalStatus, { label: string; color: string; bgColor: string }> = {
  submitted_by_lender: { label: 'Pending Review', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  under_review_by_developer: { label: 'Under Review', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  accepted_by_developer: { label: 'Accepted', color: 'text-green-700', bgColor: 'bg-green-50' },
  rejected_by_developer: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-50' },
  signed_by_developer: { label: 'Developer Signed', color: 'text-green-700', bgColor: 'bg-green-50' },
  signed_by_lender: { label: 'Lender Signed', color: 'text-green-700', bgColor: 'bg-green-50' },
  loan_term_fully_executed: { label: 'Loan Active', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
};

// Create Loan Proposal Request
export interface CreateLenderProposalRequest {
  project_id: number;
  loan_amount_offered: number;
  currency: string;
  interest_rate: number;
  loan_maturity_date: string;
  security_packages: LenderSecurityPackageType[];
  max_ltv_accepted: number;
  bid_expiry_date: string;
  additional_conditions?: string;
  loan_term_agreement?: File;
}

export interface CreateLenderProposalResponse {
  success: boolean;
  message: string;
  data: LenderLoanProposal;
}
