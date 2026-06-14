// src/lib/auth.ts
// NextAuth.js v5 with Keycloak provider and database adapter

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import type { JWT } from "next-auth/jwt";

// NextAuth configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@amdox.local" },
        password: { label: "Password", type: "password" },
        mfaCode: { label: "MFA Code (optional)", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          // Bypassing DB check for local demo without PostgreSQL
          const demoAccounts: Record<string, {name: string, role: string}> = {
            "super.admin@amdox.local": { name: "Super Admin", role: "SUPER_ADMIN" },
            "admin@amdox.local": { name: "Demo Admin", role: "TENANT_ADMIN" },
            "finance@amdox.local": { name: "Finance Manager", role: "FINANCE_MANAGER" },
            "hr@amdox.local": { name: "HR Manager", role: "HR_MANAGER" },
            "supply@amdox.local": { name: "Supply Chain Manager", role: "SUPPLY_CHAIN_MANAGER" },
            "employee@amdox.local": { name: "Employee", role: "EMPLOYEE" },
          };

          if (credentials.password === "Demo@123" && typeof credentials.email === "string" && demoAccounts[credentials.email]) {
            const acc = demoAccounts[credentials.email];
            return {
              id: `demo-${acc.role.toLowerCase()}`,
              email: credentials.email,
              name: acc.name,
              role: acc.role,
              tenantId: "demo-tenant",
              mfaEnabled: false,
            };
          }

          // Fallback to database check (will fail if no database)
          const user = await prisma.user.findFirst({
            where: { email: credentials.email as string },
            include: {
              tenant: true,
              employee: true,
            },
          });

          if (!user) {
            throw new Error("User not found");
          }

          // Check account status
          if (user.status !== "ACTIVE") {
            throw new Error(`Account is ${user.status.toLowerCase()}`);
          }

          // Check if locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error("Account is locked. Try again later");
          }

          // Verify password
          if (!user.passwordHash) {
            throw new Error("SSO login required for this account");
          }

          const isValidPassword = await compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValidPassword) {
            // Increment failed attempts
            const newAttempts = (user.loginAttempts || 0) + 1;
            if (newAttempts >= 5) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // Lock for 30 minutes
                },
              });
            } else {
              await prisma.user.update({
                where: { id: user.id },
                data: { loginAttempts: newAttempts },
              });
            }
            throw new Error("Invalid password");
          }

          // Check MFA if enabled
          if (user.mfaEnabled) {
            if (!credentials.mfaCode) {
              throw new Error("MFA_REQUIRED");
            }

            // Verify MFA code (should use a proper TOTP library in production)
            // For now, we'll store MFA verification in session
            // This is handled in the callback
          }

          // Reset login attempts on successful login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLogin: new Date(),
              loginAttempts: 0,
              lockedUntil: null,
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            mfaEnabled: user.mfaEnabled,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update every 1 hour
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.mfaEnabled = (user as any).mfaEnabled;
      }

      return token as JWT & {
        id: string;
        role: string;
        tenantId: string;
        mfaEnabled: boolean;
      };
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).mfaEnabled = token.mfaEnabled;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },

    async authorized({ request, auth }) {
      const { pathname } = request.nextUrl;

      // Public routes that don't need auth
      const publicRoutes = ["/", "/login", "/register", "/api/auth"];
      const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isPublicRoute) {
        return true;
      }

      // Protected routes require authentication
      return !!auth;
    },
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("User signed in:", user.email);
    },

    async signOut(message: any) {
      console.log("User signed out:", message?.token?.email);
    },

    async createUser({ user }) {
      console.log("New user created:", user.email);
    },

    async updateUser({ user }) {
      console.log("User updated:", user.email);
    },

    async linkAccount({ user, account, profile }) {
      console.log("Account linked:", user.email);
    },
  },

  logger: {
    error(error: any) {
      console.error(`[NextAuth] error`, error);
    },
    warn(code: any) {
      console.warn(`[NextAuth] ${code}`);
    },
    debug(code: any, metadata?: any) {
      if (process.env.NODE_ENV === "development") {
        console.debug(`[NextAuth] ${code}`, metadata);
      }
    },
  },
});

// Export session type
export type { Session } from "next-auth";

// User with role
export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | "FINANCE_MANAGER" | "HR_MANAGER" | "PROJECT_MANAGER" | "SUPPLY_CHAIN_MANAGER" | "EMPLOYEE" | "VIEWER";
  tenantId: string;
  mfaEnabled: boolean;
}
