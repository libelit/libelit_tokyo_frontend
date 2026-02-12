/**
 * Audit Log Type Definitions
 * Types for tracking user activity and XRPL blockchain transactions
 */

// Backend response structure
export interface BackendAuditLog {
    id: number;
    event_type: string;
    auditable_type: string;
    auditable_id: number;
    user_id: number;
    event_data: Record<string, any>;
    data_hash: string;
    tx_hash: string | null;
    xrpl_transaction_id: number | null;
    status: 'pending' | 'validated' | 'failed';
    attempts: number;
    last_attempt_at: string | null;
    error_message: string | null;
    submitted_at: string | null;
    validated_at: string | null;
    created_at: string;
    updated_at: string;
}

// Frontend normalized structure
export interface AuditLog {
    id: string;
    user_id: string;
    event_type: string;
    event_category: AuditCategory;
    description: string;
    metadata?: Record<string, any>;

    // XRPL transaction details
    xrpl_txn_hash?: string;
    xrpl_ledger_index?: number;
    xrpl_validated?: boolean;

    // Timestamps
    created_at: string;
    occurred_at: string;
}

export type AuditEventType =
    | 'kyb_submitted'
    | 'kyb_approved'
    | 'kyb_rejected'
    | 'lender_kyb_submitted'
    | 'lender_kyb_approved'
    | 'lender_kyb_rejected'
    | 'developer_kyb_submitted'
    | 'developer_kyb_approved'
    | 'developer_kyb_rejected'
    | 'project_created'
    | 'project_updated'
    | 'project_deleted'
    | 'proposal_submitted'
    | 'proposal_accepted'
    | 'proposal_rejected'
    | 'contract_uploaded'
    | 'contract_signed'
    | 'milestone_created'
    | 'milestone_completed'
    | 'disbursement_made'
    | 'wallet_connected'
    | 'wallet_disconnected'
    | 'profile_updated'
    | 'document_uploaded';

export type AuditCategory =
    | 'authentication'
    | 'verification'
    | 'project'
    | 'proposal'
    | 'contract'
    | 'financial'
    | 'wallet'
    | 'profile';

export interface AuditLogsListParams {
    page?: number;
    per_page?: number;
    event_type?: AuditEventType | 'all';
    from_date?: string;
    to_date?: string;
    search?: string;
}

// Laravel paginated data structure
export interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// Backend API response structure
export interface BackendAuditLogsResponse {
    success: boolean;
    data: PaginatedData<BackendAuditLog>;
    message?: string;
}

// Frontend normalized response
export interface AuditLogsResponse {
    data: AuditLog[];
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}
