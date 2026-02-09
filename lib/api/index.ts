export { apiClient } from "./client";
export type { ApiResponse, ApiError } from "./client";

export { authService } from "./auth";
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "./auth";

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
