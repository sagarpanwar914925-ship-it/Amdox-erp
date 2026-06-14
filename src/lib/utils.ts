import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, decimals = 0): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(decimals);
}

export function formatDate(date: Date | string, format = "MMM dd, yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(str: string, length = 50): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: "badge-success",
    approved: "badge-success",
    paid: "badge-success",
    completed: "badge-success",
    posted: "badge-success",
    pending: "badge-warning",
    draft: "badge-neutral",
    processing: "badge-info",
    partial: "badge-warning",
    overdue: "badge-danger",
    cancelled: "badge-danger",
    rejected: "badge-danger",
    suspended: "badge-danger",
    on_hold: "badge-warning",
    in_progress: "badge-info",
    planning: "badge-purple",
  };
  return map[status.toLowerCase()] || "badge-neutral";
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    critical: "badge-danger",
    high: "badge-warning",
    medium: "badge-info",
    low: "badge-neutral",
  };
  return map[priority.toLowerCase()] || "badge-neutral";
}
