// src/app/api/auth/register/route.ts
// User registration endpoint

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, companyName } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create tenant (for the company)
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        slug: companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        status: "ACTIVE",
      },
    });

    // Create organization (subsidiary of tenant)
    const organization = await prisma.organization.create({
      data: {
        tenantId: tenant.id,
        name: companyName,
        code: "HQ",
        currency: "USD",
        fiscalYear: "JAN-DEC",
      },
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        passwordHash,
        tenantId: tenant.id,
        status: "ACTIVE",
        role: "TENANT_ADMIN",
        mfaEnabled: false,
        loginAttempts: 0,
      },
    });

    // Create employee record linked to user
    await prisma.employee.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        employeeCode: "EMP-001",
        firstName,
        lastName,
        email,
        joinDate: new Date(),
        status: "ACTIVE",
      },
    });

    // Create default chart of accounts for finance module
    const accountTypes = [
      {
        code: "1000",
        name: "Current Assets",
        type: "ASSET" as const,
        description: "Asset accounts",
      },
      {
        code: "2000",
        name: "Current Liabilities",
        type: "LIABILITY" as const,
        description: "Liability accounts",
      },
      {
        code: "3000",
        name: "Equity",
        type: "EQUITY" as const,
        description: "Equity accounts",
      },
      {
        code: "4000",
        name: "Sales Revenue",
        type: "REVENUE" as const,
        description: "Revenue accounts",
      },
      {
        code: "5000",
        name: "Operating Expenses",
        type: "EXPENSE" as const,
        description: "Expense accounts",
      },
    ];

    for (const accountType of accountTypes) {
      await prisma.account.create({
        data: {
          organizationId: organization.id,
          code: accountType.code,
          name: accountType.name,
          description: accountType.description,
          type: accountType.type,
          isActive: true,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

