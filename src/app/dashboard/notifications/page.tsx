"use client";

import { Bell, CheckCircle2, AlertTriangle, MessageSquare, Package, DollarSign } from "lucide-react";

export default function NotificationsPage() {
  const NOTIFICATIONS = [
    { id: 1, title: "Invoice Paid", desc: "Acme Corp has paid Invoice #INV-2024-089 for $12,400.", time: "10 mins ago", type: "success", icon: DollarSign },
    { id: 2, title: "Low Inventory Alert", desc: "SKU-047 USB-C Hub is below the reorder threshold (12 units remaining).", time: "1 hour ago", type: "warning", icon: AlertTriangle },
    { id: 3, title: "New Message", desc: "Sarah from HR sent you a message regarding the Q1 Hiring Plan.", time: "3 hours ago", type: "info", icon: MessageSquare },
    { id: 4, title: "System Update Complete", desc: "The ERP v2.4 update was successfully deployed with 0 downtime.", time: "1 day ago", type: "success", icon: CheckCircle2 },
    { id: 5, title: "PO Approved", desc: "Purchase Order #PO-2024-445 for TechSupply Corp was approved by Finance.", time: "1 day ago", type: "success", icon: Package },
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case "success": return "text-emerald-600 bg-emerald-50";
      case "warning": return "text-amber-600 bg-amber-50";
      default: return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-xl">Notifications</h1>
          <p className="section-subtitle">Stay updated on alerts, messages, and system events</p>
        </div>
        <button className="btn btn-secondary btn-sm"><Bell className="w-4 h-4" /> Mark all as read</button>
      </div>

      <div className="glass-card p-2">
        <div className="space-y-1">
          {NOTIFICATIONS.map((notif) => {
            const Icon = notif.icon;
            return (
              <div key={notif.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconColor(notif.type)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900">{notif.title}</h4>
                    <span className="text-xs text-black">{notif.time}</span>
                  </div>
                  <p className="text-sm text-black">{notif.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
