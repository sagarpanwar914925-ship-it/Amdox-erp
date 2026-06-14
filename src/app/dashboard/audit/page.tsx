"use client";

import { Shield, Search, Filter, Download } from "lucide-react";

export default function AuditPage() {
  const AUDIT_LOGS = [
    { id: "AL-8992", user: "alex.johnson@acme.com", action: "UPDATE_CONFIG", target: "System Settings", status: "SUCCESS", ip: "192.168.1.45", date: "2024-12-07 09:42:15" },
    { id: "AL-8991", user: "sarah.williams@acme.com", action: "LOGIN", target: "Auth Module", status: "SUCCESS", ip: "10.0.0.23", date: "2024-12-07 08:15:02" },
    { id: "AL-8990", user: "SYSTEM", action: "DB_BACKUP", target: "PostgreSQL Data", status: "SUCCESS", ip: "localhost", date: "2024-12-07 02:00:00" },
    { id: "AL-8989", user: "robert.kim@acme.com", action: "DELETE_USER", target: "User ID: 492", status: "DENIED", ip: "192.168.1.112", date: "2024-12-06 16:45:33" },
    { id: "AL-8988", user: "james.chen@acme.com", action: "APPROVE_PO", target: "PO-2024-445", status: "SUCCESS", ip: "10.0.2.55", date: "2024-12-06 14:20:11" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-xl">Audit Logs</h1>
          <p className="section-subtitle">Security, compliance, and activity tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm"><Filter className="w-4 h-4" /> Filter</button>
          <button className="btn btn-secondary btn-sm"><Download className="w-4 h-4" /> Export CSV</button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by user, action, or target..." className="form-input pl-10 w-full" />
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Date & Time</th>
              <th>User / System</th>
              <th>Action</th>
              <th>Target</th>
              <th>IP Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {AUDIT_LOGS.map((log) => (
              <tr key={log.id}>
                <td className="font-mono text-xs text-slate-500">{log.id}</td>
                <td className="font-mono text-xs text-slate-600">{log.date}</td>
                <td className="font-semibold text-slate-900 text-sm">{log.user}</td>
                <td className="text-sm">
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono font-semibold">
                    {log.action}
                  </span>
                </td>
                <td className="text-slate-600 text-sm">{log.target}</td>
                <td className="font-mono text-xs text-slate-500">{log.ip}</td>
                <td>
                  <span className={`badge ${log.status === "SUCCESS" ? "badge-success" : "badge-danger"}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
