// Loan Proposal Types

export type ProposalStatus =
  | 'submitted'      // Lender submitted, waiting for developer review
  | 'under_review'   // Developer is reviewing
  | 'accepted'       // Developer accepted the proposal
  | 'rejected'       // Developer rejected the proposal
  | 'expired';       // Bid expired before decision

export type ContractStatus =
  | 'pending'           // Waiting for contracts
  | 'lender_signed'     // Lender uploaded signed contract
  | 'developer_signed'  // Developer uploaded signed contract
  | 'completed';        // Both parties signed

export type SecurityPackageType =
  | 'mortgage'
  | 'spv_charge'
  | 'guarantees'
  | 'personal_guarantee'
  | 'corporate_guarantee';

export interface LoanProposal {
  id: string;
  projectId: string;
  lenderId: string;
  lenderName: string;
  lenderLogo?: string;

  // Loan Details
  amountOffered: number;
  currency: string;
  interestRate: number;
  maturityDate: string;
  securityPackage: SecurityPackageType[];
  maxLTV: number;
  bidExpiry: string;
  conditions?: string;

  // Status
  status: ProposalStatus;
  contractStatus: ContractStatus;

  // Documents
  proposalDocuments?: ProposalDocument[];
  lenderContract?: ContractDocument;
  developerContract?: ContractDocument;

  // Timestamps
  submittedAt: string;
  reviewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ProposalDocument {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ContractDocument {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  signedAt: string;
  signedBy: string;
}

// Request Types
export interface CreateProposalRequest {
  projectId: string;
  amountOffered: number;
  currency: string;
  interestRate: number;
  maturityDate: string;
  securityPackage: SecurityPackageType[];
  maxLTV: number;
  bidExpiry: string;
  conditions?: string;
  documents?: File[];
}

export interface AcceptProposalRequest {
  proposalId: string;
}

export interface RejectProposalRequest {
  proposalId: string;
  reason?: string;
}

export interface UploadContractRequest {
  proposalId: string;
  file: File;
  signedBy: 'lender' | 'developer';
}

// Response Types
export interface ProposalResponse {
  success: boolean;
  data: LoanProposal;
  message?: string;
}

export interface ProposalListResponse {
  success: boolean;
  data: LoanProposal[];
  meta?: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
}

export interface ProposalActionResponse {
  success: boolean;
  message: string;
  data?: LoanProposal;
}

// Security Package Labels
export const securityPackageLabels: Record<SecurityPackageType, string> = {
  mortgage: 'Mortgage',
  spv_charge: 'SPV Charge',
  guarantees: 'Guarantees',
  personal_guarantee: 'Personal Guarantee',
  corporate_guarantee: 'Corporate Guarantee',
};

// Status Labels and Colors
export const proposalStatusConfig: Record<ProposalStatus, { label: string; color: string; bgColor: string }> = {
  submitted: { label: 'Submitted for Review', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  under_review: { label: 'Under Review', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  accepted: { label: 'Accepted', color: 'text-green-700', bgColor: 'bg-green-50' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-50' },
  expired: { label: 'Expired', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export const contractStatusConfig: Record<ContractStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending Signatures', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  lender_signed: { label: 'Lender Signed', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  developer_signed: { label: 'Developer Signed', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  completed: { label: 'Fully Executed', color: 'text-green-700', bgColor: 'bg-green-50' },
};
