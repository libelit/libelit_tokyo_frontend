// Developer Profile Types
export interface DeveloperProfile {
  id: number;
  user_id: number;
  company_name: string | null;
  company_registration_number: string | null;
  address: string | null;
  company_address: string | null;
  company_city: string | null;
  company_country: string | null;
  company_phone: string | null;
  company_website: string | null;
  years_in_business: number | null;
  total_projects_completed: number | null;
  bio: string | null;
  kyb_status: KybStatus;
  kyb_submitted_at: string | null;
  kyb_verified_at: string | null;
  kyb_rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  user?: DeveloperUser;
}

export interface DeveloperUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  type: string;
  status: string;
}

export type KybStatus = 'not_started' | 'pending' | 'under_review' | 'approved' | 'rejected';

export interface UpdateDeveloperProfileRequest {
  // User fields
  name?: string;
  phone?: string;
  // Profile fields
  company_name?: string;
  company_registration_number?: string;
  address?: string;
}

// Document Types
export interface Document {
  id: number;
  document_type: DocumentType;
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

export type DocumentType =
  | 'kyb_certificate'
  | 'kyb_id'
  | 'kyb_address_proof'
  | 'loan_drawings'
  | 'loan_cost_calculation'
  | 'loan_photos'
  | 'loan_land_title'
  | 'loan_bank_statement'
  | 'loan_revenue_evidence';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UploadDocumentRequest {
  document_type: DocumentType;
  title: string;
  file: File;
}

// Project Types
export interface Project {
  id: number;
  uuid: string;
  developer_profile_id: number;
  title: string;
  description: string | null;
  project_type: ProjectType;
  address: string | null;
  city: string | null;
  country: string | null;
  loan_amount: number;
  min_investment: number;
  currency: string;
  construction_start_date: string | null;
  construction_end_date: string | null;
  amount_raised?: number;
  status: ProjectStatus;
  submitted_at: string | null;
  approved_at: string | null;
  funded_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  documents_count?: number;
  documents?: Document[];
  photos?: ProjectPhoto[];
  cover_photo?: ProjectPhoto | null;
  cover_photo_url?: string | null;
  vr_tour_link: string | null;
  live_camera_link: string | null;
}

export type ProjectType = 'residential' | 'commercial' | 'mixed_use' | 'industrial' | 'land';

export type ProjectStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'funded'
  | 'completed';

export interface CreateProjectRequest {
  title: string;
  description?: string;
  project_type: ProjectType;
  address?: string;
  city?: string;
  country?: string;
  loan_amount: number;
  min_investment: number;
  currency: string;
  construction_start_date: string;
  construction_end_date: string;
  vr_tour_link?: string;
  live_camera_link?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  project_type?: ProjectType;
  address?: string;
  city?: string;
  country?: string;
  loan_amount?: number;
  min_investment?: number;
  currency?: string;
  construction_start_date?: string;
  construction_end_date?: string;
  vr_tour_link?: string;
  live_camera_link?: string;
}

// API Response Types
export interface DeveloperProfileResponse {
  success: boolean;
  data: DeveloperProfile;
  message?: string;
}

export interface DocumentResponse {
  success: boolean;
  data: Document;
  message?: string;
}

export interface DocumentListResponse {
  success: boolean;
  data: Document[];
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
  message?: string;
}

export interface ProjectListResponse {
  success: boolean;
  data: Project[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ProjectDocumentsResponse {
  success: boolean;
  data: {
    documents: Document[];
    document_checklist: DocumentChecklistItem[];
    all_required_uploaded: boolean;
  };
}

export interface DocumentChecklistItem {
  type: DocumentType;
  label: string;
  required: boolean;
  uploaded: boolean;
}

export interface SubmitKybResponse {
  success: boolean;
  message: string;
  data?: {
    kyb_status: KybStatus;
    kyb_submitted_at: string;
  };
  missing_documents?: { type: string; label: string }[];
}

export interface SubmitProjectResponse {
  success: boolean;
  message: string;
  data?: Project;
  missing_documents?: { type: string; label: string }[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// Project Photo Types
export interface ProjectPhoto {
  id: number;
  uuid: string;
  file_url: string;
  file_name: string;
  title: string | null;
  is_featured: boolean;
  sort_order: number;
}

export interface UploadProjectPhotoData {
  file: File;
  title?: string;
  is_featured?: boolean;
}

export interface UpdateProjectPhotoData {
  title?: string;
  is_featured?: boolean;
  sort_order?: number;
}

export interface ProjectPhotoResponse {
  success: boolean;
  message: string;
  data: ProjectPhoto;
}

export interface ProjectPhotoListResponse {
  success: boolean;
  data: ProjectPhoto[];
}

export interface ProjectPhotoUploadResponse {
  success: boolean;
  message: string;
  data: ProjectPhoto[];
}

// Milestone Types
export type MilestoneStatus =
  | 'pending'
  | 'proof_submitted'
  | 'approved'
  | 'rejected'
  | 'paid';

export type MilestoneProofType =
  | 'photo'
  | 'invoice'
  | 'inspection_report'
  | 'bank_statement'
  | 'other';

export interface MilestoneProof {
  id: number;
  milestone_id: number;
  proof_type: MilestoneProofType;
  proof_type_label: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  file_url: string;
  uploaded_by: number;
  is_payment_proof: boolean;
  payment_uploaded_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  sequence: number;
  amount: number;
  percentage: number;
  status: MilestoneStatus;
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
  proofs?: MilestoneProof[];
  milestone_proofs?: MilestoneProof[];
  payment_proofs?: MilestoneProof[];
  proofs_count?: number;
  can_complete: boolean;
}

// Drawdown Types
export interface DrawdownMilestone extends ProjectMilestone {
  project: {
    id: number;
    title: string;
    status: ProjectStatus;
    status_label: string;
  };
}

export interface DrawdownStatistics {
  total_milestones: number;
  pending_milestones: number;
  pending_review: number;
  approved_milestones: number;
  rejected_milestones: number;
  paid_milestones: number;
  total_amount: number;
  paid_amount: number;
  approved_amount: number;
  pending_amount: number;
}

export interface DeveloperDrawdownResponse {
  success: boolean;
  data: DrawdownMilestone[];
  statistics: DrawdownStatistics;
}

export interface MilestoneStatistics {
  total_milestones: number;
  completed_milestones: number;
  progress_percentage: number;
  total_amount: number;
  paid_amount: number;
  loan_amount: number;
  allocation_complete: boolean;
}

export interface CreateMilestoneData {
  title: string;
  description?: string;
  amount: number;
  due_date?: string;
}

export interface MilestoneListResponse {
  success: boolean;
  data: {
    milestones: ProjectMilestone[];
    statistics: MilestoneStatistics;
  };
}

export interface MilestoneStoreResponse {
  success: boolean;
  message: string;
  data?: {
    milestones: ProjectMilestone[];
    count: number;
  };
}

export interface MilestoneActionResponse {
  success: boolean;
  message: string;
  data?: ProjectMilestone;
}

export interface UploadProofData {
  proof_type: MilestoneProofType;
  title: string;
  description?: string;
  file: File;
}

export interface ProofListResponse {
  success: boolean;
  data: {
    proofs: MilestoneProof[];
    count: number;
  };
}

export interface ProofUploadResponse {
  success: boolean;
  message: string;
  data?: MilestoneProof[];
}

// Developer Project Loan Proposal Types (proposals received from lenders)
export type DeveloperProposalStatus =
  | 'submitted_by_lender'
  | 'under_review_by_developer'
  | 'accepted_by_developer'
  | 'rejected_by_developer'
  | 'signed_by_developer'
  | 'signed_by_lender'
  | 'loan_term_fully_executed';

export type DeveloperSecurityPackageType =
  | 'mortgage'
  | 'spv_charge'
  | 'guarantees'
  | 'personal_guarantee'
  | 'corporate_guarantee';

export interface DeveloperProposalLenderUser {
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

export interface DeveloperProposalLender {
  id: number;
  user_id: number;
  lender_type: string | null;
  company_name: string | null;
  address: string | null;
  kyb_status: string;
  kyb_submitted_at: string | null;
  kyb_approved_at: string | null;
  kyb_rejection_reason: string | null;
  aml_status: string;
  aml_checked_at: string | null;
  accreditation_status: string;
  accreditation_expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: DeveloperProposalLenderUser;
}

export interface DeveloperProposalDocument {
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

export interface DeveloperProjectProposal {
  id: number;
  uuid: string;
  loan_amount_offered: number;
  currency: string;
  interest_rate: number;
  loan_maturity_date: string;
  security_packages: DeveloperSecurityPackageType[];
  max_ltv_accepted: number;
  bid_expiry_date: string;
  additional_conditions: string | null;
  status: DeveloperProposalStatus;
  status_label: string;
  rejection_reason: string | null;
  accepted_at: string | null;
  developer_signed_at: string | null;
  lender_signed_at: string | null;
  created_at: string;
  updated_at: string;
  lender: DeveloperProposalLender;
  documents: DeveloperProposalDocument[];
  documents_count: number;
}

export interface DeveloperProjectProposalListResponse {
  success: boolean;
  data: DeveloperProjectProposal[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface DeveloperProjectProposalResponse {
  success: boolean;
  data: DeveloperProjectProposal;
  message?: string;
}

// Security Package Labels for display
export const developerSecurityPackageLabels: Record<DeveloperSecurityPackageType, string> = {
  mortgage: 'Mortgage',
  spv_charge: 'SPV Charge',
  guarantees: 'Guarantees',
  personal_guarantee: 'Personal Guarantee',
  corporate_guarantee: 'Corporate Guarantee',
};

// Status Labels and Colors for display
export const developerProposalStatusConfig: Record<DeveloperProposalStatus, { label: string; color: string; bgColor: string }> = {
  submitted_by_lender: { label: 'Pending Review', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  under_review_by_developer: { label: 'Under Review', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  accepted_by_developer: { label: 'Accepted', color: 'text-green-700', bgColor: 'bg-green-50' },
  rejected_by_developer: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-50' },
  signed_by_developer: { label: 'Developer Signed', color: 'text-green-700', bgColor: 'bg-green-50' },
  signed_by_lender: { label: 'Lender Signed', color: 'text-green-700', bgColor: 'bg-green-50' },
  loan_term_fully_executed: { label: 'Loan Active', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
};
