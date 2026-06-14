// src/components/layout/sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  Zap, LayoutDashboard, DollarSign, Users, Package,
  ShoppingCart, FolderOpen, BarChart3, Brain, Bell,
  Shield, Settings, ChevronDown, ChevronRight, Menu,
  LogOut, User, Building2, Warehouse, FileText, TrendingUp,
  Activity, ClipboardList, CreditCard, Target, Award
} from "lucide-react";

export type Role = "SUPER_ADMIN" | "TENANT_ADMIN" | "FINANCE_MANAGER" | "HR_MANAGER" | "PROJECT_MANAGER" | "SUPPLY_CHAIN_MANAGER" | "EMPLOYEE" | "VIEWER";

type NavItemType = {
  href: string;
  icon: any;
  label: string;
  roles?: Role[] | "ALL";
};

type NavSectionType = {
  title: string;
  roles?: Role[] | "ALL";
  items: NavItemType[];
};

const NAV_SECTIONS: NavSectionType[] = [
  {
    title: "Overview",
    roles: "ALL",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: "ALL" },
      { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", roles: "ALL" },
    ],
  },
  {
    title: "Finance",
    roles: ["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE_MANAGER"],
    items: [
      { href: "/dashboard/finance?tab=overview", icon: DollarSign, label: "Overview", roles: "ALL" },
      { href: "/dashboard/finance?tab=gl", icon: FileText, label: "General Ledger", roles: "ALL" },
      { href: "/dashboard/finance?tab=ap", icon: CreditCard, label: "Accounts Payable", roles: "ALL" },
      { href: "/dashboard/finance?tab=ar", icon: TrendingUp, label: "Accounts Receivable", roles: "ALL" },
      { href: "/dashboard/finance?tab=budgets", icon: Target, label: "Budgets", roles: "ALL" },
      { href: "/dashboard/finance?tab=reports", icon: BarChart3, label: "Financial Reports", roles: "ALL" },
    ],
  },
  {
    title: "Human Resources",
    roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR_MANAGER"],
    items: [
      { href: "/dashboard/hr?tab=employees", icon: Users, label: "Employees", roles: "ALL" },
      { href: "/dashboard/hr?tab=attendance", icon: Activity, label: "Attendance", roles: "ALL" },
      { href: "/dashboard/hr?tab=leave", icon: ClipboardList, label: "Leave Management", roles: "ALL" },
      { href: "/dashboard/hr?tab=payroll", icon: DollarSign, label: "Payroll", roles: "ALL" },
      { href: "/dashboard/hr?tab=performance", icon: Award, label: "Performance", roles: "ALL" },
    ],
  },
  {
    title: "Supply Chain",
    roles: ["SUPER_ADMIN", "TENANT_ADMIN", "SUPPLY_CHAIN_MANAGER"],
    items: [
      { href: "/dashboard/supply-chain?tab=inventory", icon: Package, label: "Inventory", roles: "ALL" },
      { href: "/dashboard/supply-chain?tab=procurement", icon: ShoppingCart, label: "Procurement", roles: "ALL" },
      { href: "/dashboard/supply-chain?tab=vendors", icon: Building2, label: "Vendors", roles: "ALL" },
      { href: "/dashboard/supply-chain?tab=forecasting", icon: Brain, label: "AI Forecasting", roles: "ALL" },
    ],
  },
  {
    title: "Projects",
    roles: ["SUPER_ADMIN", "TENANT_ADMIN", "PROJECT_MANAGER", "EMPLOYEE"],
    items: [
      { href: "/dashboard/projects?tab=projects", icon: FolderOpen, label: "All Projects", roles: "ALL" },
      { href: "/dashboard/projects?tab=tasks", icon: ClipboardList, label: "My Tasks", roles: "ALL" },
      { href: "/dashboard/projects?tab=gantt", icon: BarChart3, label: "Gantt Chart", roles: "ALL" },
    ],
  },
  {
    title: "System",
    roles: "ALL",
    items: [
      { href: "/dashboard/notifications", icon: Bell, label: "Notifications", roles: "ALL" },
      { href: "/dashboard/audit", icon: Shield, label: "Audit Logs", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { href: "/dashboard/settings", icon: Settings, label: "Settings", roles: "ALL" },
    ],
  },
];

function NavItem({ item, collapsed, onClick }: { item: NavItemType; collapsed: boolean; onClick?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  
  // Check if the link contains a tab
  const hasTab = item.href.includes("?tab=");
  let isActive = false;

  if (hasTab) {
    const [path, query] = item.href.split("?");
    const targetTab = new URLSearchParams(query).get("tab");
    isActive = pathname === path && currentTab === targetTab;
  } else {
    isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
  }

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-600 text-white"
          : "text-slate-700 dark:text-slate-300"
      } ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function Sidebar({
  collapsed,
  setCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (v: boolean) => void;
}) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "EMPLOYEE";

  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    setProfileName(session?.user?.name || "User");
    const loadProfile = () => {
      const savedName = localStorage.getItem("erp_profile_name");
      const savedImage = localStorage.getItem("erp_profile_image");
      if (savedName) setProfileName(savedName);
      if (savedImage) setProfileImage(savedImage);
    };
    
    loadProfile();
    window.addEventListener("profileUpdate", loadProfile);
    return () => window.removeEventListener("profileUpdate", loadProfile);
  }, [session?.user?.name]);
  
  const hasAccess = (allowedRoles?: Role[] | "ALL") => {
    if (!allowedRoles || allowedRoles === "ALL") return true;
    return allowedRoles.includes(userRole);
  };

  const filteredSections = NAV_SECTIONS.map(section => {
    if (!hasAccess(section.roles)) return null;
    const filteredItems = section.items.filter(item => hasAccess(item.roles));
    if (filteredItems.length === 0) return null;
    return { ...section, items: filteredItems };
  }).filter(Boolean) as NavSectionType[];

  const [expandedSections, setExpandedSections] = useState<string[]>(
    filteredSections.map((s) => s.title)
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const getInitials = () => {
    if (!profileName) return "U";
    return profileName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen?.(false)}
        />
      )}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 flex flex-col h-screen transition-transform duration-300 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 ${
          collapsed ? "w-16" : "w-64"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-800 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">AMDOX ERP</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">AI Suite</div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse toggle (when collapsed) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex justify-center mt-1"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {filteredSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                {section.title}
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    expandedSections.includes(section.title) ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>
            )}
            {(collapsed || expandedSections.includes(section.title)) && (
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => (
                  <NavItem key={item.href} item={item} collapsed={collapsed} onClick={() => setMobileMenuOpen?.(false)} />
                ))}
              </div>
            )}
            {!collapsed && <div className="my-2 border-t border-slate-200 dark:border-slate-800" />}
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className={`border-t border-slate-200 dark:border-slate-800 p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
            {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : getInitials()}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
              {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {profileName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {(session?.user as any)?.role || "Employee"}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
