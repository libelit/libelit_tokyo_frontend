// Developer Profile Types
export interface DeveloperProfile {
  id: number;
  user_id: number;
  company_name: string | null;
  company_registration_number: string | null;
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
  company_name?: string;
  company_registration_number?: string;
  company_address?: string;
  company_city?: string;
  company_country?: string;
  company_phone?: string;
  company_website?: string;
  years_in_business?: number;
  total_projects_completed?: number;
  bio?: string;
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
  latitude: number | null;
  longitude: number | null;
  funding_goal: number;
  amount_raised: number;
  min_investment: number;
  expected_return: number;
  loan_term_months: number;
  ltv_ratio: number | null;
  status: ProjectStatus;
  submitted_at: string | null;
  approved_at: string | null;
  funded_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  documents_count?: number;
  documents?: Document[];
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
  latitude?: number;
  longitude?: number;
  funding_goal: number;
  min_investment: number;
  expected_return: number;
  loan_term_months: number;
  ltv_ratio?: number;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  project_type?: ProjectType;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  funding_goal?: number;
  min_investment?: number;
  expected_return?: number;
  loan_term_months?: number;
  ltv_ratio?: number;
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
  proofs_count?: number;
  can_complete: boolean;
}

export interface MilestoneStatistics {
  total_milestones: number;
  completed_milestones: number;
  progress_percentage: number;
  total_amount: number;
  paid_amount: number;
  funding_goal: number;
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
