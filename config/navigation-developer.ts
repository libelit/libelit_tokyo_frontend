import {
  Home,
  Building2,
  FolderKanban,
  BarChart3,
  FileText,
  BookOpen,
  Settings,
  Layout,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  items: NavItem[];
}

export const developerNavigationConfig: NavGroup[] = [
  {
    items: [
      { title: "Home", href: "/developer/dashboard", icon: Home },
      { title: "KYB Verification", href: "/developer/dashboard/kyb", icon: ShieldCheck },
      { title: "Projects", href: "/developer/dashboard/projects", icon: Building2 },
      { title: "Funding", href: "/developer/dashboard/funding", icon: FolderKanban },
      { title: "Analytics", href: "/developer/dashboard/analytics", icon: BarChart3 },
      { title: "Documents", href: "/developer/dashboard/documents", icon: FileText },
    ],
  },
  {
    items: [
      { title: "Know-how", href: "/developer/dashboard/know-how", icon: BookOpen },
      { title: "Settings", href: "/developer/dashboard/settings", icon: Settings },
      { title: "Landing page", href: "/", icon: Layout },
    ],
  },
];
