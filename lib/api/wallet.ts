import { apiClient, ApiResponse } from "./client";

export interface WalletData {
  id: number;
  xrpl_address: string;
  xrpl_public_key: string | null;
  label: string;
  is_primary: boolean;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
}

export interface WalletResponse {
  success: boolean;
  data: WalletData | null;
  message?: string;
}

export interface CreateWalletRequest {
  xrpl_address: string;
  xrpl_public_key?: string;
  label?: string;
}

export const walletService = {
  async getWallet(): Promise<ApiResponse<WalletResponse>> {
    return apiClient.get<WalletResponse>("/wallet");
  },

  async createWallet(data: CreateWalletRequest): Promise<ApiResponse<WalletResponse>> {
    return apiClient.post<WalletResponse>("/wallet", data);
  },

  async deleteWallet(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete("/wallet");
  },
};
