export { apiClient } from "./client";
export type { ApiResponse, ApiError } from "./client";

export { authService } from "./auth";
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "./auth";

export { walletService } from "./wallet";
export type { WalletData, WalletResponse, CreateWalletRequest } from "./wallet";

export {
  developerProfileService,
  kybService,
  projectsService,
  projectDocumentsService,
  milestonesService,
  projectPhotosService,
  projectProposalsService,
} from "./developer";

export {
  lenderProfileService,
  lenderKybService,
  lenderProjectsService,
  lenderProjectDocumentsService,
  lenderMilestonesService,
  lenderProjectPhotosService,
  lenderProposalsService,
} from "./lender";
