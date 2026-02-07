// Re-export types and configs from specific files
export type { NavItem, NavGroup } from "./navigation-lender";
export { lenderNavigationConfig } from "./navigation-lender";
export { developerNavigationConfig } from "./navigation-developer";

// Default export for backward compatibility (lender config)
import { lenderNavigationConfig } from "./navigation-lender";
export const navigationConfig = lenderNavigationConfig;
