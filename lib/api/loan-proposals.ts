/**
 * Loan Proposals Service
 *
 * This is a mock service using localStorage for demo purposes.
 * Replace the implementation with real API calls when backend is ready.
 *
 * Usage:
 *   import { loanProposalsService } from '@/lib/api/loan-proposals';
 *   const proposals = await loanProposalsService.getByProject('project-1');
 */

import {
  LoanProposal,
  ProposalStatus,
  ContractStatus,
  CreateProposalRequest,
  ProposalResponse,
  ProposalListResponse,
  ProposalActionResponse,
  SecurityPackageType,
} from '../types/loan-proposal';

const STORAGE_KEY = 'libelit_loan_proposals';
const SEED_KEY = 'libelit_proposals_seeded';

// Demo seed data - Proposals for developer's view (project 2)
// Project 1 has NO proposals so lender can demo the submission flow
const seedDemoData = (): LoanProposal[] => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  const expiringDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now (expiring soon)
  const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

  return [
    // Project 2 - Has 3 pending proposals (for developer demo)
    {
      id: 'proposal-1',
      projectId: '2',
      lenderId: 'lender-1',
      lenderName: 'First National Bank',
      lenderLogo: '/images/bank-logo.png',
      amountOffered: 1500000,
      currency: 'USD',
      interestRate: 8.5,
      maturityDate: '2025-12-31',
      securityPackage: ['mortgage', 'personal_guarantee'],
      maxLTV: 65,
      bidExpiry: futureDate.toISOString().split('T')[0],
      conditions: 'Subject to satisfactory site inspection and valuation report.',
      status: 'submitted',
      contractStatus: 'pending',
      submittedAt: pastDate.toISOString(),
      createdAt: pastDate.toISOString(),
      updatedAt: pastDate.toISOString(),
    },
    {
      id: 'proposal-2',
      projectId: '2',
      lenderId: 'lender-2',
      lenderName: 'City Commercial Bank',
      lenderLogo: '/images/bank-logo.png',
      amountOffered: 1400000,
      currency: 'USD',
      interestRate: 9.0,
      maturityDate: '2025-10-15',
      securityPackage: ['mortgage', 'corporate_guarantee'],
      maxLTV: 60,
      bidExpiry: expiringDate.toISOString().split('T')[0],
      conditions: 'Requires quarterly financial reporting.',
      status: 'submitted',
      contractStatus: 'pending',
      submittedAt: pastDate.toISOString(),
      createdAt: pastDate.toISOString(),
      updatedAt: pastDate.toISOString(),
    },
    {
      id: 'proposal-3',
      projectId: '2',
      lenderId: 'lender-3',
      lenderName: 'Pacific Lending Corp',
      lenderLogo: '/images/bank-logo.png',
      amountOffered: 1600000,
      currency: 'USD',
      interestRate: 7.75,
      maturityDate: '2026-03-31',
      securityPackage: ['mortgage', 'spv_charge', 'guarantees'],
      maxLTV: 70,
      bidExpiry: futureDate.toISOString().split('T')[0],
      conditions: 'Flexible repayment schedule available. Early repayment options included.',
      status: 'submitted',
      contractStatus: 'pending',
      submittedAt: pastDate.toISOString(),
      createdAt: pastDate.toISOString(),
      updatedAt: pastDate.toISOString(),
    },
  ];
};

// Initialize demo data if not exists
const initializeDemoData = (): void => {
  if (typeof window === 'undefined') return;

  const seeded = localStorage.getItem(SEED_KEY);
  if (!seeded) {
    const demoData = seedDemoData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
    localStorage.setItem(SEED_KEY, 'true');
  }
};

// Helper to generate UUID
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Helper to get proposals from localStorage
const getStoredProposals = (): LoanProposal[] => {
  if (typeof window === 'undefined') return [];

  // Initialize demo data on first load
  initializeDemoData();

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Helper to save proposals to localStorage
const saveProposals = (proposals: LoanProposal[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
};

// Simulate network delay for realistic UX
const delay = (ms: number = 500): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Loan Proposals Service
 * Mock implementation - replace with real API calls when ready
 */
export const loanProposalsService = {
  /**
   * Get all proposals for a specific project (Developer view)
   */
  async getByProject(projectId: string): Promise<ProposalListResponse> {
    await delay(300);
    const proposals = getStoredProposals().filter(p => p.projectId === projectId);

    return {
      success: true,
      data: proposals,
      meta: {
        total: proposals.length,
        pending: proposals.filter(p => p.status === 'submitted' || p.status === 'under_review').length,
        accepted: proposals.filter(p => p.status === 'accepted').length,
        rejected: proposals.filter(p => p.status === 'rejected').length,
      },
    };
  },

  /**
   * Get all proposals by a lender (Lender view)
   */
  async getByLender(lenderId: string): Promise<ProposalListResponse> {
    await delay(300);
    const proposals = getStoredProposals().filter(p => p.lenderId === lenderId);

    return {
      success: true,
      data: proposals,
      meta: {
        total: proposals.length,
        pending: proposals.filter(p => p.status === 'submitted' || p.status === 'under_review').length,
        accepted: proposals.filter(p => p.status === 'accepted').length,
        rejected: proposals.filter(p => p.status === 'rejected').length,
      },
    };
  },

  /**
   * Get a single proposal by ID
   */
  async getById(proposalId: string): Promise<ProposalResponse> {
    await delay(200);
    const proposals = getStoredProposals();
    const proposal = proposals.find(p => p.id === proposalId);

    if (!proposal) {
      return {
        success: false,
        data: null as unknown as LoanProposal,
        message: 'Proposal not found',
      };
    }

    return {
      success: true,
      data: proposal,
    };
  },

  /**
   * Get proposal for a specific project by lender
   */
  async getByProjectAndLender(projectId: string, lenderId: string): Promise<ProposalResponse | null> {
    await delay(200);
    const proposals = getStoredProposals();
    const proposal = proposals.find(p => p.projectId === projectId && p.lenderId === lenderId);

    if (!proposal) {
      return null;
    }

    return {
      success: true,
      data: proposal,
    };
  },

  /**
   * Create a new loan proposal (Lender action)
   */
  async create(
    request: CreateProposalRequest,
    lenderId: string = 'lender-1',
    lenderName: string = 'First National Bank',
    documents?: File[]
  ): Promise<ProposalResponse> {
    await delay(500);

    const now = new Date().toISOString();

    // Convert File[] to ProposalDocument[] (mock - store metadata only)
    const proposalDocuments = documents?.map((file) => ({
      id: generateId(),
      name: file.name,
      fileUrl: `/documents/${file.name}`, // Mock URL
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: now,
    })) || [];

    const proposal: LoanProposal = {
      id: generateId(),
      projectId: request.projectId,
      lenderId,
      lenderName,
      lenderLogo: '/images/bank-logo.png',

      amountOffered: request.amountOffered,
      currency: request.currency,
      interestRate: request.interestRate,
      maturityDate: request.maturityDate,
      securityPackage: request.securityPackage,
      maxLTV: request.maxLTV,
      bidExpiry: request.bidExpiry,
      conditions: request.conditions,

      status: 'submitted',
      contractStatus: 'pending',

      proposalDocuments: proposalDocuments.length > 0 ? proposalDocuments : undefined,

      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const proposals = getStoredProposals();
    proposals.push(proposal);
    saveProposals(proposals);

    return {
      success: true,
      data: proposal,
      message: 'Proposal submitted successfully',
    };
  },

  /**
   * Accept a proposal (Developer action)
   */
  async accept(proposalId: string): Promise<ProposalActionResponse> {
    await delay(500);

    const proposals = getStoredProposals();
    const index = proposals.findIndex(p => p.id === proposalId);

    if (index === -1) {
      return {
        success: false,
        message: 'Proposal not found',
      };
    }

    const now = new Date().toISOString();
    proposals[index] = {
      ...proposals[index],
      status: 'accepted',
      acceptedAt: now,
      reviewedAt: now,
      updatedAt: now,
    };

    // Reject all other proposals for this project
    const projectId = proposals[index].projectId;
    proposals.forEach((p, i) => {
      if (p.projectId === projectId && p.id !== proposalId && p.status === 'submitted') {
        proposals[i] = {
          ...p,
          status: 'rejected',
          rejectedAt: now,
          reviewedAt: now,
          rejectionReason: 'Another proposal was accepted',
          updatedAt: now,
        };
      }
    });

    saveProposals(proposals);

    return {
      success: true,
      message: 'Proposal accepted successfully',
      data: proposals[index],
    };
  },

  /**
   * Reject a proposal (Developer action)
   */
  async reject(proposalId: string, reason?: string): Promise<ProposalActionResponse> {
    await delay(500);

    const proposals = getStoredProposals();
    const index = proposals.findIndex(p => p.id === proposalId);

    if (index === -1) {
      return {
        success: false,
        message: 'Proposal not found',
      };
    }

    const now = new Date().toISOString();
    proposals[index] = {
      ...proposals[index],
      status: 'rejected',
      rejectedAt: now,
      reviewedAt: now,
      rejectionReason: reason,
      updatedAt: now,
    };

    saveProposals(proposals);

    return {
      success: true,
      message: 'Proposal rejected',
      data: proposals[index],
    };
  },

  /**
   * Upload signed contract (Lender or Developer action)
   */
  async uploadContract(
    proposalId: string,
    signedBy: 'lender' | 'developer',
    fileName: string,
    fileUrl: string = '/documents/contract.pdf'
  ): Promise<ProposalActionResponse> {
    await delay(500);

    const proposals = getStoredProposals();
    const index = proposals.findIndex(p => p.id === proposalId);

    if (index === -1) {
      return {
        success: false,
        message: 'Proposal not found',
      };
    }

    const now = new Date().toISOString();
    const contractDoc = {
      id: generateId(),
      name: fileName,
      fileUrl,
      fileSize: 1024 * 500, // Mock 500KB
      mimeType: 'application/pdf',
      signedAt: now,
      signedBy: signedBy === 'lender' ? 'First National Bank' : 'Developer Company',
    };

    const proposal = proposals[index];
    let newContractStatus: ContractStatus = proposal.contractStatus;

    if (signedBy === 'lender') {
      proposal.lenderContract = contractDoc;
      newContractStatus = proposal.developerContract ? 'completed' : 'lender_signed';
    } else {
      proposal.developerContract = contractDoc;
      newContractStatus = proposal.lenderContract ? 'completed' : 'developer_signed';
    }

    proposals[index] = {
      ...proposal,
      contractStatus: newContractStatus,
      updatedAt: now,
    };

    saveProposals(proposals);

    return {
      success: true,
      message: `Contract uploaded by ${signedBy}`,
      data: proposals[index],
    };
  },

  /**
   * Clear all proposals (for testing)
   */
  clearAll(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SEED_KEY);
    }
  },

  /**
   * Reset to demo data (for demo purposes)
   */
  resetToDemo(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SEED_KEY);
      initializeDemoData();
    }
  },
};

// Export types for convenience
export type {
  LoanProposal,
  ProposalStatus,
  ContractStatus,
  SecurityPackageType,
  CreateProposalRequest,
};
