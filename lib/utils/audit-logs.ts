/**
 * Audit Log Utility Functions
 * Helper functions for formatting and displaying audit log data
 */

import type { AuditEventType, AuditCategory, BackendAuditLog, AuditLog } from '../types/audit-logs';
import {
    CheckCircle2,
    XCircle,
    FileText,
    Building2,
    DollarSign,
    Wallet,
    User,
    Clock,
    Upload,
    type LucideIcon,
} from 'lucide-react';

/**
 * Transform backend audit log to frontend format
 */
export function transformAuditLog(backendLog: BackendAuditLog): AuditLog {
    const eventType = backendLog.event_type;
    const eventData = backendLog.event_data || {};

    // Determine category from event type
    const category = getCategoryFromEventType(eventType);

    // Generate description from event data
    const description = generateDescription(eventType, eventData);

    return {
        id: backendLog.id.toString(),
        user_id: backendLog.user_id.toString(),
        event_type: eventType,
        event_category: category,
        description,
        metadata: eventData,
        xrpl_txn_hash: backendLog.tx_hash || undefined,
        xrpl_ledger_index: backendLog.xrpl_transaction_id || undefined,
        xrpl_validated: backendLog.status === 'validated',
        created_at: backendLog.created_at,
        occurred_at: eventData.timestamp || backendLog.created_at,
    };
}

/**
 * Determine category from event type
 */
function getCategoryFromEventType(eventType: string): AuditCategory {
    if (eventType.includes('kyb')) return 'verification';
    if (eventType.includes('project')) return 'project';
    if (eventType.includes('proposal')) return 'proposal';
    if (eventType.includes('contract')) return 'contract';
    if (eventType.includes('disbursement') || eventType.includes('payment')) return 'financial';
    if (eventType.includes('wallet')) return 'wallet';
    if (eventType.includes('profile')) return 'profile';
    if (eventType.includes('login') || eventType.includes('logout')) return 'authentication';
    return 'profile';
}

/**
 * Generate human-readable description from event data
 */
function generateDescription(eventType: string, eventData: Record<string, any>): string {
    // KYB events
    if (eventType === 'lender_kyb_submitted' || eventType === 'developer_kyb_submitted') {
        return `KYB verification submitted for ${eventData.company_name || 'your company'}`;
    }
    if (eventType === 'lender_kyb_approved' || eventType === 'developer_kyb_approved') {
        return `KYB verification approved for ${eventData.company_name || 'your company'}`;
    }
    if (eventType === 'lender_kyb_rejected' || eventType === 'developer_kyb_rejected') {
        const reason = eventData.rejection_reason ? `: ${eventData.rejection_reason}` : '';
        return `KYB verification rejected for ${eventData.company_name || 'your company'}${reason}`;
    }

    // Project events
    if (eventType === 'project_created') {
        return `Project "${eventData.project_name || 'Untitled'}" created`;
    }
    if (eventType === 'project_updated') {
        return `Project "${eventData.project_name || 'Untitled'}" updated`;
    }

    // Proposal events
    if (eventType === 'proposal_submitted') {
        return `Loan proposal submitted for ${eventData.project_name || 'project'}`;
    }
    if (eventType === 'proposal_accepted') {
        return `Loan proposal accepted for ${eventData.project_name || 'project'}`;
    }
    if (eventType === 'proposal_rejected') {
        return `Loan proposal rejected for ${eventData.project_name || 'project'}`;
    }

    // Default fallback
    return formatEventType(eventType);
}

/**
 * Format event type to human-readable string
 */
export function formatEventType(type: string): string {
    // Remove prefixes like 'lender_' or 'developer_'
    const cleanType = type.replace(/^(lender_|developer_)/, '');

    const mapping: Record<string, string> = {
        kyb_submitted: 'KYB Submitted',
        kyb_approved: 'KYB Approved',
        kyb_rejected: 'KYB Rejected',
        project_created: 'Project Created',
        project_updated: 'Project Updated',
        project_deleted: 'Project Deleted',
        proposal_submitted: 'Proposal Submitted',
        proposal_accepted: 'Proposal Accepted',
        proposal_rejected: 'Proposal Rejected',
        contract_uploaded: 'Contract Uploaded',
        contract_signed: 'Contract Signed',
        milestone_created: 'Milestone Created',
        milestone_completed: 'Milestone Completed',
        disbursement_made: 'Disbursement Made',
        wallet_connected: 'Wallet Connected',
        wallet_disconnected: 'Wallet Disconnected',
        profile_updated: 'Profile Updated',
        document_uploaded: 'Document Uploaded',
    };

    return mapping[cleanType] || cleanType.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/**
 * Get XRPL explorer URL for a transaction hash
 */
export function getXrplExplorerUrl(txnHash: string, network: string = 'testnet'): string {
    const baseUrl = network === 'mainnet'
        ? 'https://livenet.xrpl.org'
        : 'https://testnet.xrpl.org';

    return `${baseUrl}/transactions/${txnHash}`;
}

/**
 * Get color for event category badge
 */
export function getEventCategoryColor(category: AuditCategory): string {
    const colorMap: Record<AuditCategory, string> = {
        verification: 'bg-green-100 text-green-800 border-green-200',
        project: 'bg-blue-100 text-blue-800 border-blue-200',
        proposal: 'bg-purple-100 text-purple-800 border-purple-200',
        contract: 'bg-orange-100 text-orange-800 border-orange-200',
        financial: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        wallet: 'bg-slate-100 text-slate-800 border-slate-200',
        authentication: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        profile: 'bg-pink-100 text-pink-800 border-pink-200',
    };

    return colorMap[category] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get icon for event type
 */
export function getEventIcon(type: string): LucideIcon {
    const cleanType = type.replace(/^(lender_|developer_)/, '');

    const iconMap: Record<string, LucideIcon> = {
        kyb_submitted: Clock,
        kyb_approved: CheckCircle2,
        kyb_rejected: XCircle,
        project_created: Building2,
        project_updated: Building2,
        project_deleted: XCircle,
        proposal_submitted: FileText,
        proposal_accepted: CheckCircle2,
        proposal_rejected: XCircle,
        contract_uploaded: Upload,
        contract_signed: CheckCircle2,
        milestone_created: Clock,
        milestone_completed: CheckCircle2,
        disbursement_made: DollarSign,
        wallet_connected: Wallet,
        wallet_disconnected: Wallet,
        profile_updated: User,
        document_uploaded: Upload,
    };

    return iconMap[cleanType] || FileText;
}

/**
 * Format timestamp to readable string
 */
export function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);

    // Format: "Feb 12, 2026 at 3:45 PM"
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatTimestamp(timestamp);
}

/**
 * Truncate transaction hash for display
 */
export function truncateHash(hash: string, startChars: number = 8, endChars: number = 6): string {
    if (hash.length <= startChars + endChars) return hash;
    return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}
