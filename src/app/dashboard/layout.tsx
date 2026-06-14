"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar, Role } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Loader2, Shield } from "lucide-react";

const ROUTE_PERMISSIONS: Record<string, Role[] | "ALL"> = {
  "/dashboard": "ALL",
  "/dashboard/analytics": "ALL",
  "/dashboard/finance": ["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE_MANAGER"],
  "/dashboard/hr": ["SUPER_ADMIN", "TENANT_ADMIN", "HR_MANAGER"],
  "/dashboard/supply-chain": ["SUPER_ADMIN", "TENANT_ADMIN", "SUPPLY_CHAIN_MANAGER"],
  "/dashboard/projects": ["SUPER_ADMIN", "TENANT_ADMIN", "PROJECT_MANAGER", "EMPLOYEE"],
  "/dashboard/notifications": "ALL",
  "/dashboard/audit": ["SUPER_ADMIN", "TENANT_ADMIN"],
  "/dashboard/settings": "ALL",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (status === "unauthenticated") {
    return null;
  }

  const userRole = (session?.user as any)?.role || "EMPLOYEE";
  
  let hasAccess = true;
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      if (allowedRoles !== "ALL" && !allowedRoles.includes(userRole as Role)) {
        hasAccess = false;
        break;
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar 
          collapsed={collapsed} 
          user={session?.user} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            {hasAccess ? (
              children
            ) : (
              <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-10 h-10 text-red-600 dark:text-red-500" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Access Denied</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
                  You do not have the required permissions to view this module. Please contact your administrator if you believe this is a mistake.
                </p>
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="btn btn-primary"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
