import {
  Home,
  Wallet,
  Store,
  PieChart,
  TrendingDown,
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

export const lenderNavigationConfig: NavGroup[] = [
  {
    items: [
      { title: "Home", href: "/dashboard", icon: Home },
      { title: "KYB Verification", href: "/dashboard/kyb", icon: ShieldCheck },
      { title: "Wallet", href: "/dashboard/wallet", icon: Wallet },
      { title: "Marketplace", href: "/dashboard/marketplace", icon: Store },
      { title: "Portfolio", href: "/dashboard/portfolio", icon: PieChart },
      { title: "Drawdown", href: "/dashboard/drawdown", icon: TrendingDown },
    ],
  },
  {
    items: [
      { title: "Know-how", href: "/dashboard/know-how", icon: BookOpen },
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
      { title: "Landing page", href: "/", icon: Layout },
    ],
  },
];
