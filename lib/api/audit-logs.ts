/**
 * Audit Logs API Service
 * Handles fetching audit logs for lenders and developers
 */

import { apiClient, ApiResponse } from './client';
import type { AuditLog, AuditLogsListParams, BackendAuditLogsResponse } from '../types/audit-logs';

/**
 * Build query string from params object
 */
function buildQueryString(params?: AuditLogsListParams): string {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

export const auditLogsService = {
    /**
     * Fetch audit logs for lender
     */
    listLenderLogs: (params?: AuditLogsListParams) =>
        apiClient.get<BackendAuditLogsResponse>(`/lender/audit-logs${buildQueryString(params)}`),

    /**
     * Fetch audit logs for developer
     */
    listDeveloperLogs: (params?: AuditLogsListParams) =>
        apiClient.get<BackendAuditLogsResponse>(`/developer/audit-logs${buildQueryString(params)}`),

    /**
     * Fetch a single audit log by ID (for both roles)
     */
    getById: (id: string, role: 'lender' | 'developer') =>
        apiClient.get<ApiResponse<AuditLog>>(`${role}/audit-logs/${id}`),
};
