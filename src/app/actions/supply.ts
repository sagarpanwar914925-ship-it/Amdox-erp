"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getInventory(organizationId?: string) {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      where: organizationId ? { warehouse: { organizationId } } : undefined,
      include: {
        product: true,
        warehouse: true
      },
      orderBy: { product: { name: 'asc' } },
      take: 50
    });

    return inventory.map(item => ({
      sku: item.product.sku,
      name: item.product.name,
      category: item.product.category || "General",
      warehouse: item.warehouse.name,
      qty: Number(item.quantity),
      reserved: 0, // Fallback as reserved is not explicitly in base model but computed
      reorder: Number(item.reorderLevel),
      value: Number(item.quantity) * Number(item.product.costPrice),
      status: Number(item.quantity) <= 0 ? "OUT_OF_STOCK" : (Number(item.quantity) <= Number(item.reorderLevel) ? "LOW_STOCK" : "IN_STOCK")
    }));
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return null;
  }
}

export async function getVendors(organizationId?: string) {
  try {
    const vendors = await prisma.vendor.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { name: 'asc' }
    });

    return vendors.map(v => ({
      name: v.name,
      code: v.code,
      category: "Supplier", // Fallback if category isn't on the model
      country: "Global",
      rating: 4.0 + (Math.random() * 1.0), // Mocking rating as it's not in base schema
      orders: Math.floor(Math.random() * 50),
      value: Math.floor(Math.random() * 1000000),
      status: v.status
    }));
  } catch (error) {
    console.error("Failed to fetch vendors:", error);
    return null;
  }
}

export async function getPurchaseOrders(organizationId?: string) {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        vendor: true,
        items: true
      },
      orderBy: { date: 'desc' },
      take: 50
    });

    return pos.map(po => ({
      id: po.number,
      vendor: po.vendor.name,
      items: po.items.length,
      total: Number(po.totalAmount),
      date: po.date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      expected: po.expectedDate ? po.expectedDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : "TBD",
      status: po.status
    }));
  } catch (error) {
    console.error("Failed to fetch purchase orders:", error);
    return null;
  }
}
