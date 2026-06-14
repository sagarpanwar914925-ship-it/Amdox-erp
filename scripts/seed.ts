// scripts/seed.ts
// Database seeding script for development

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // 1. Create test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: "ACME Corporation",
        slug: "acme-corp",
        domain: "acme.amdox.local",
        plan: "PROFESSIONAL",
        status: "ACTIVE",
        maxUsers: 100,
        maxStorage: BigInt(50 * 1024 * 1024 * 1024), // 50GB
      },
    });
    console.log("✓ Created tenant:", tenant.name);

    // 2. Create organization within tenant
    const organization = await prisma.organization.create({
      data: {
        tenantId: tenant.id,
        name: "North America Operations",
        code: "NA",
        currency: "USD",
        fiscalYear: "JAN-DEC",
      },
    });
    console.log("✓ Created organization:", organization.name);

    // 3. Create departments
    const departments = await Promise.all([
      prisma.department.create({
        data: {
          organizationId: organization.id,
          name: "Finance",
          code: "FIN",
          costCenter: "CC-001",
        },
      }),
      prisma.department.create({
        data: {
          organizationId: organization.id,
          name: "Human Resources",
          code: "HR",
          costCenter: "CC-002",
        },
      }),
      prisma.department.create({
        data: {
          organizationId: organization.id,
          name: "Supply Chain",
          code: "SC",
          costCenter: "CC-003",
        },
      }),
    ]);
    console.log("✓ Created", departments.length, "departments");

    // 4. Create users
    const passwordHash = await hash("Demo@123", 10);
    const users = await Promise.all([
      prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: "super.admin@amdox.local",
          name: "Super Admin",
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          passwordHash,
        },
      }),
      prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: "admin@amdox.local",
          name: "Tenant Admin",
          role: "TENANT_ADMIN",
          status: "ACTIVE",
          passwordHash,
        },
      }),
      prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: "finance@amdox.local",
          name: "Finance Manager",
          role: "FINANCE_MANAGER",
          status: "ACTIVE",
          passwordHash,
        },
      }),
      prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: "hr@amdox.local",
          name: "HR Manager",
          role: "HR_MANAGER",
          status: "ACTIVE",
          passwordHash,
        },
      }),
      prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: "supply@amdox.local",
          name: "Supply Chain Manager",
          role: "SUPPLY_CHAIN_MANAGER",
          status: "ACTIVE",
          passwordHash,
        },
      }),
    ]);
    console.log("✓ Created", users.length, "users");

    // 5. Create employees
    const employees = await Promise.all([
      prisma.employee.create({
        data: {
          userId: users[1].id,
          organizationId: organization.id,
          departmentId: departments[0].id,
          employeeCode: "EMP-001",
          firstName: "Tenant",
          lastName: "Admin",
          email: "admin@amdox.local",
          designation: "Director",
          employmentType: "FULL_TIME",
          joinDate: new Date("2020-01-15"),
          status: "ACTIVE",
          salary: 120000,
        },
      }),
      prisma.employee.create({
        data: {
          userId: users[2].id,
          organizationId: organization.id,
          departmentId: departments[0].id,
          employeeCode: "EMP-002",
          firstName: "Finance",
          lastName: "Manager",
          email: "finance@amdox.local",
          designation: "Senior Manager",
          employmentType: "FULL_TIME",
          joinDate: new Date("2021-06-01"),
          status: "ACTIVE",
          salary: 100000,
        },
      }),
      prisma.employee.create({
        data: {
          userId: users[3].id,
          organizationId: organization.id,
          departmentId: departments[1].id,
          employeeCode: "EMP-003",
          firstName: "HR",
          lastName: "Manager",
          email: "hr@amdox.local",
          designation: "HR Manager",
          employmentType: "FULL_TIME",
          joinDate: new Date("2021-09-01"),
          status: "ACTIVE",
          salary: 90000,
        },
      }),
      prisma.employee.create({
        data: {
          userId: users[4].id,
          organizationId: organization.id,
          departmentId: departments[2].id,
          employeeCode: "EMP-004",
          firstName: "Supply",
          lastName: "Chain",
          email: "supply@amdox.local",
          designation: "Supply Chain Manager",
          employmentType: "FULL_TIME",
          joinDate: new Date("2022-01-10"),
          status: "ACTIVE",
          salary: 95000,
        },
      }),
    ]);
    console.log("✓ Created", employees.length, "employees");

    // 6. Create Chart of Accounts
    const accounts = await Promise.all([
      // Assets
      prisma.account.create({
        data: {
          organizationId: organization.id,
          code: "1000",
          name: "Current Assets",
          type: "ASSET",
        },
      }),
      prisma.account.create({
        data: {
          organizationId: organization.id,
          code: "1100",
          name: "Cash - Operating Account",
          type: "ASSET",
          parentId: "1000",
        },
      }),
      // Liabilities
      prisma.account.create({
        data: {
          organizationId: organization.id,
          code: "2000",
          name: "Current Liabilities",
          type: "LIABILITY",
        },
      }),
      // Revenue
      prisma.account.create({
        data: {
          organizationId: organization.id,
          code: "4000",
          name: "Sales Revenue",
          type: "REVENUE",
        },
      }),
      // Expenses
      prisma.account.create({
        data: {
          organizationId: organization.id,
          code: "5000",
          name: "Operating Expenses",
          type: "EXPENSE",
        },
      }),
    ]);
    console.log("✓ Created", accounts.length, "accounts");

    // 7. Create sample customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          organizationId: organization.id,
          code: "CUST-001",
          name: "TechCorp Industries",
          email: "contact@techcorp.com",
          phone: "+1-555-0101",
          creditLimit: 500000,
          status: "ACTIVE",
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: organization.id,
          code: "CUST-002",
          name: "Global Enterprises LLC",
          email: "sales@global-ent.com",
          phone: "+1-555-0102",
          creditLimit: 300000,
          status: "ACTIVE",
        },
      }),
    ]);
    console.log("✓ Created", customers.length, "customers");

    // 8. Create sample vendors
    const vendors = await Promise.all([
      prisma.vendor.create({
        data: {
          organizationId: organization.id,
          code: "VEND-001",
          name: "Premium Supplies Inc",
          email: "sales@premiumsupplies.com",
          phone: "+1-555-0201",
          currency: "USD",
          paymentTerms: 30,
          status: "ACTIVE",
        },
      }),
      prisma.vendor.create({
        data: {
          organizationId: organization.id,
          code: "VEND-002",
          name: "Global Logistics Partners",
          email: "contracts@globallogistics.com",
          phone: "+1-555-0202",
          currency: "USD",
          paymentTerms: 45,
          status: "ACTIVE",
        },
      }),
    ]);
    console.log("✓ Created", vendors.length, "vendors");

    // 9. Create sample products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          sku: "PROD-001",
          name: "Premium Widget",
          description: "High-quality widget for industrial use",
          category: "Hardware",
          unit: "pcs",
          costPrice: 50,
          salePrice: 125,
          taxRate: 10,
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          sku: "PROD-002",
          name: "Standard Gadget",
          description: "Standard gadget for general use",
          category: "Electronics",
          unit: "pcs",
          costPrice: 30,
          salePrice: 75,
          taxRate: 10,
          isActive: true,
        },
      }),
    ]);
    console.log("✓ Created", products.length, "products");

    // 10. Create warehouse
    const warehouse = await prisma.warehouse.create({
      data: {
        organizationId: organization.id,
        name: "Main Warehouse",
        code: "WH-001",
        city: "New York",
        country: "USA",
        isActive: true,
      },
    });
    console.log("✓ Created warehouse:", warehouse.name);

    // 11. Create inventory items
    const inventoryItems = await Promise.all([
      prisma.inventoryItem.create({
        data: {
          productId: products[0].id,
          warehouseId: warehouse.id,
          quantity: 1000,
          reorderLevel: 200,
          reorderQty: 500,
        },
      }),
      prisma.inventoryItem.create({
        data: {
          productId: products[1].id,
          warehouseId: warehouse.id,
          quantity: 750,
          reorderLevel: 150,
          reorderQty: 400,
        },
      }),
    ]);
    console.log("✓ Created", inventoryItems.length, "inventory items");

    // 12. Create leave types
    const leaveTypes = await Promise.all([
      prisma.leaveType.create({
        data: {
          name: "Annual Leave",
          code: "AL",
          daysAllowed: 20,
          carryForward: true,
          maxCarryDays: 5,
          isPaid: true,
        },
      }),
      prisma.leaveType.create({
        data: {
          name: "Sick Leave",
          code: "SL",
          daysAllowed: 10,
          carryForward: false,
          isPaid: true,
        },
      }),
    ]);
    console.log("✓ Created", leaveTypes.length, "leave types");

    // 13. Create a sample project
    const project = await prisma.project.create({
      data: {
        organizationId: organization.id,
        name: "ERP Implementation",
        code: "PROJ-001",
        description: "AMDOX ERP platform implementation",
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        status: "PLANNING",
        budget: 500000,
        managerId: employees[1].id,
      },
    });
    console.log("✓ Created project:", project.name);

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("Email: admin@amdox.local");
    console.log("Password: Demo@123");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
