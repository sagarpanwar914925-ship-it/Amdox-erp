"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getExecutiveAnalytics(organizationId?: string) {
  try {
    const whereOrg = organizationId ? { organizationId } : undefined;

    // Fetch Total Revenue from Invoices
    const invoices = await prisma.invoice.findMany({
      where: organizationId ? { customer: { organizationId } } : undefined,
    });
    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    // Fetch Operating Expenses from Bills
    const bills = await prisma.bill.findMany({
      where: organizationId ? { vendor: { organizationId } } : undefined,
    });
    const totalBills = bills.reduce((sum, b) => sum + Number(b.total), 0);

    // Fetch Payroll Expenses
    const payrolls = await prisma.payrollRecord.findMany({
      where: organizationId ? { employee: { organizationId } } : undefined,
    });
    const totalPayroll = payrolls.reduce((sum, p) => sum + Number(p.netPay), 0);

    const operatingExpenses = totalBills + totalPayroll;
    const netProfit = totalRevenue - operatingExpenses;
    
    // Estimate EBITDA (mocked factor)
    const ebitda = netProfit * 1.25;

    // Fetch Employee Count
    const empCount = await prisma.employee.count({
      where: whereOrg
    });
    const revenuePerEmp = empCount > 0 ? totalRevenue / empCount : 0;

    // Format output
    const formatValue = (val: number) => {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
      return `$${val.toFixed(0)}`;
    };

    return {
      totalRevenue: formatValue(totalRevenue),
      netProfit: formatValue(netProfit),
      operatingExpenses: formatValue(operatingExpenses),
      ebitda: formatValue(ebitda),
      revenuePerEmployee: formatValue(revenuePerEmp),
      rawRevenue: totalRevenue,
      customerRetention: "94.2%" // Hardcoded mock
    };
  } catch (error) {
    console.error("Failed to fetch executive analytics:", error);
    return null;
  }
}
