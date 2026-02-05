// Re-export types and configs from specific files
export type { NavItem, NavGroup } from "./navigation-investor";
export { investorNavigationConfig } from "./navigation-investor";
export { developerNavigationConfig } from "./navigation-developer";

// Default export for backward compatibility (investor config)
import { investorNavigationConfig } from "./navigation-investor";
export const navigationConfig = investorNavigationConfig;
