// src/lib/middleware.ts
// Authorization middleware for protected routes

import { auth } from "@/lib/auth";
import type { UserWithRole } from "@/lib/auth";

export type Role =
  | "SUPER_ADMIN"
  | "TENANT_ADMIN"
  | "FINANCE_MANAGER"
  | "HR_MANAGER"
  | "PROJECT_MANAGER"
  | "SUPPLY_CHAIN_MANAGER"
  | "EMPLOYEE"
  | "VIEWER";

// Role hierarchy - higher roles can access lower ones
const roleHierarchy: Record<Role, number> = {
  SUPER_ADMIN: 8,
  TENANT_ADMIN: 7,
  FINANCE_MANAGER: 6,
  HR_MANAGER: 6,
  PROJECT_MANAGER: 6,
  SUPPLY_CHAIN_MANAGER: 6,
  EMPLOYEE: 3,
  VIEWER: 1,
};

/**
 * Check if user has required role
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.some((role) => hasRole(userRole, role));
}

/**
 * Get current session with authentication check
 */
export async function getCurrentUser(): Promise<UserWithRole | null> {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id || "",
      email: session.user.email || "",
      name: session.user.name || "",
      role: (session.user as any).role || "VIEWER",
      tenantId: (session.user as any).tenantId || "",
      mfaEnabled: (session.user as any).mfaEnabled || false,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Require authentication and role
 * Use in server components or API routes
 */
export async function requireAuth(requiredRole?: Role): Promise<UserWithRole> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (requiredRole && !hasRole(user.role, requiredRole)) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }

  return user;
}

/**
 * Require super admin role
 */
export async function requireSuperAdmin(): Promise<UserWithRole> {
  return requireAuth("SUPER_ADMIN");
}

/**
 * Require tenant admin role
 */
export async function requireTenantAdmin(): Promise<UserWithRole> {
  return requireAuth("TENANT_ADMIN");
}

/**
 * Require finance manager role
 */
export async function requireFinanceManager(): Promise<UserWithRole> {
  return requireAuth("FINANCE_MANAGER");
}

/**
 * Require HR manager role
 */
export async function requireHRManager(): Promise<UserWithRole> {
  return requireAuth("HR_MANAGER");
}

/**
 * Require project manager role
 */
export async function requireProjectManager(): Promise<UserWithRole> {
  return requireAuth("PROJECT_MANAGER");
}

/**
 * Require supply chain manager role
 */
export async function requireSupplyChainManager(): Promise<UserWithRole> {
  return requireAuth("SUPPLY_CHAIN_MANAGER");
}

/**
 * Tenant isolation - ensure user accesses only their tenant's data
 */
export function ensureTenantAccess(userTenantId: string, requestedTenantId: string): boolean {
  return userTenantId === requestedTenantId;
}
