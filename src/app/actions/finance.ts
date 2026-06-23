"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAccounts(organizationId?: string) {
  try {
    return await prisma.account.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { code: 'asc' }
    });
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    return [];
  }
}

export async function getInvoices(organizationId?: string) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: { customer: true },
      orderBy: { date: 'desc' }
    });
    
    // Map to UI format
    return invoices.map(inv => ({
      id: inv.number,
      customer: inv.customer?.name || "Unknown",
      amount: Number(inv.total),
      date: inv.date.toISOString().split('T')[0],
      due: inv.dueDate.toISOString().split('T')[0],
      status: inv.status
    }));
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return null;
  }
}

export async function getBills(organizationId?: string) {
  try {
    const bills = await prisma.bill.findMany({
      where: organizationId ? { vendor: { organizationId } } : undefined,
      include: { vendor: true },
      orderBy: { date: 'desc' }
    });

    // Map to UI format
    return bills.map(bill => ({
      id: bill.number,
      vendor: bill.vendor?.name || "Unknown",
      amount: Number(bill.total),
      date: bill.date.toISOString().split('T')[0],
      due: bill.dueDate.toISOString().split('T')[0],
      status: bill.status
    }));
  } catch (error) {
    console.error("Failed to fetch bills:", error);
    return null;
  }
}

export async function getJournalEntries(organizationId?: string) {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: organizationId ? { lines: { some: { account: { organizationId } } } } : undefined,
      include: { lines: { include: { account: true } } },
      orderBy: { date: 'desc' },
      take: 50
    });

    // Flatten for UI
    const flatEntries: any[] = [];
    entries.forEach(entry => {
      entry.lines.forEach(line => {
        flatEntries.push({
          id: entry.reference,
          date: entry.date.toISOString().split('T')[0],
          account: line.account.name,
          desc: entry.description,
          ref: entry.reference,
          debit: Number(line.debit) || null,
          credit: Number(line.credit) || null,
        });
      });
    });
    return flatEntries;
  } catch (error) {
    console.error("Failed to fetch journal entries:", error);
    return null;
  }
}

export async function updateInvoiceStatus(number: string, status: any) {
  try {
    await prisma.invoice.update({
      where: { number },
      data: { status }
    });
    revalidatePath('/dashboard/finance');
    return { success: true };
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return { success: false, error };
  }
}

export async function updateBillStatus(number: string, status: any) {
  try {
    await prisma.bill.update({
      where: { number },
      data: { status }
    });
    revalidatePath('/dashboard/finance');
    return { success: true };
  } catch (error) {
    console.error("Failed to update bill:", error);
    return { success: false, error };
  }
}
