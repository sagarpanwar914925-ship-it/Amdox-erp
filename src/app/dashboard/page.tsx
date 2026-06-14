"use client";

import {
  DollarSign, Users, Package, FolderOpen, TrendingUp,
  TrendingDown, ArrowUpRight, ArrowDownRight, Bell,
  Activity, ShoppingCart, Clock, CheckCircle2, AlertTriangle,
  BarChart3, Brain, Zap
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart,
  Pie, Cell, LineChart, Line
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useSession } from "next-auth/react";

// ─── MOCK DATA ─────────────────────────────────────────────
const REVENUE_DATA = [
  { month: "Jan", revenue: 420000, expenses: 310000, profit: 110000 },
  { month: "Feb", revenue: 480000, expenses: 340000, profit: 140000 },
  { month: "Mar", revenue: 510000, expenses: 360000, profit: 150000 },
  { month: "Apr", revenue: 490000, expenses: 330000, profit: 160000 },
  { month: "May", revenue: 560000, expenses: 370000, profit: 190000 },
  { month: "Jun", revenue: 620000, expenses: 400000, profit: 220000 },
  { month: "Jul", revenue: 580000, expenses: 380000, profit: 200000 },
  { month: "Aug", revenue: 650000, expenses: 420000, profit: 230000 },
  { month: "Sep", revenue: 700000, expenses: 440000, profit: 260000 },
  { month: "Oct", revenue: 680000, expenses: 430000, profit: 250000 },
  { month: "Nov", revenue: 740000, expenses: 460000, profit: 280000 },
  { month: "Dec", revenue: 820000, expenses: 500000, profit: 320000 },
];

const DEPT_BUDGET = [
  { dept: "Engineering", budget: 450000, actual: 420000 },
  { dept: "Marketing", budget: 200000, actual: 230000 },
  { dept: "Sales", budget: 300000, actual: 280000 },
  { dept: "HR", budget: 150000, actual: 145000 },
  { dept: "Finance", budget: 100000, actual: 98000 },
  { dept: "Operations", budget: 180000, actual: 175000 },
];

const MODULE_DIST = [
  { name: "Finance", value: 28, color: "#6366f1" },
  { name: "HR", value: 22, color: "#22c55e" },
  { name: "Supply Chain", value: 20, color: "#f59e0b" },
  { name: "Projects", value: 18, color: "#3b82f6" },
  { name: "Analytics", value: 12, color: "#ec4899" },
];

const RECENT_ACTIVITIES = [
  { icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/15", text: "Invoice #INV-2024-089 paid", sub: "Acme Corp — $12,400", time: "2 min ago" },
  { icon: Users, color: "text-blue-400", bg: "bg-blue-500/15", text: "New employee onboarded", sub: "Sarah Williams — Engineering", time: "14 min ago" },
  { icon: ShoppingCart, color: "text-amber-400", bg: "bg-amber-500/15", text: "Purchase Order approved", sub: "PO-2024-445 — $34,200", time: "1 hr ago" },
  { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/15", text: "Low stock alert", sub: "SKU-047 USB-C Hub — 12 units left", time: "2 hr ago" },
  { icon: FolderOpen, color: "text-purple-400", bg: "bg-purple-500/15", text: "Project milestone reached", sub: "ERP Migration — Phase 2 Complete", time: "3 hr ago" },
  { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15", text: "Payroll processed", sub: "November 2024 — 248 employees", time: "5 hr ago" },
];

const PENDING_APPROVALS = [
  { type: "Leave Request", from: "John Kim", dept: "Engineering", date: "Dec 20–24", priority: "medium" },
  { type: "Purchase Order", from: "Supply Chain", dept: "Operations", date: "$28,500", priority: "high" },
  { type: "Expense Report", from: "Lisa Park", dept: "Sales", date: "$2,340", priority: "low" },
  { type: "Vendor Contract", from: "Procurement", dept: "Supply Chain", date: "$120K/year", priority: "high" },
];

const KPI_CARDS = [
  {
    title: "Total Revenue",
    value: "$7.23M",
    change: "+12.4%",
    up: true,
    icon: DollarSign,
    color: "from-indigo-500 to-purple-600",
    sub: "YTD 2024",
  },
  {
    title: "Active Employees",
    value: "1,248",
    change: "+3.2%",
    up: true,
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    sub: "Across 8 departments",
  },
  {
    title: "Open Purchase Orders",
    value: "84",
    change: "-5.8%",
    up: false,
    icon: ShoppingCart,
    color: "from-amber-500 to-orange-600",
    sub: "Total value $2.1M",
  },
  {
    title: "Active Projects",
    value: "32",
    change: "+8.1%",
    up: true,
    icon: FolderOpen,
    color: "from-blue-500 to-cyan-600",
    sub: "On-time delivery 78%",
  },
];

const AI_INSIGHTS = [
  { icon: Brain, text: "Revenue forecast for Q1 2025: $2.4M (+8% vs Q1 2024)", type: "forecast", color: "text-purple-400" },
  { icon: AlertTriangle, text: "3 vendors with contracts expiring in 30 days", type: "alert", color: "text-amber-400" },
  { icon: TrendingUp, text: "Payroll costs trending 4% above budget YTD", type: "warning", color: "text-red-400" },
  { icon: Zap, text: "Inventory reorder recommended for 7 SKUs", type: "action", color: "text-blue-400" },
];

// Custom tooltip for recharts
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-sm">
      <p className="text-slate-400 mb-2 font-semibold">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}:</span>
          <span className="font-bold">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card p-6 gradient-mesh relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
              {getGreeting()}, {session?.user?.name?.split(" ")[0] || "Alex"} 👋
            </h1>
            <p className="text-slate-500 text-sm">
              Here&apos;s what&apos;s happening at Acme Corporation today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs text-slate-500">System Status</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="kpi-card">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                  {kpi.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {kpi.change}
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mb-1">{kpi.value}</div>
              <div className="text-sm font-semibold text-slate-700">{kpi.title}</div>
              <div className="text-xs text-slate-600 mt-1">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="section-title text-base">Revenue vs Expenses</h3>
              <p className="section-subtitle text-xs">Full Year 2024</p>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-600">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Profit</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="profit" name="Profit" stroke="#22c55e" fill="url(#profGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Module Distribution */}
        <div className="glass-card p-6">
          <h3 className="section-title text-base mb-1">Module Activity</h3>
          <p className="section-subtitle text-xs mb-4">Usage distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={MODULE_DIST}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {MODULE_DIST.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => `${v}%`}
                contentStyle={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "12px", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {MODULE_DIST.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Budget Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="section-title text-base">Department Budget vs Actual</h3>
            <p className="section-subtitle text-xs">YTD Spending Analysis</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={DEPT_BUDGET} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
            <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "12px", fontSize: "12px" }}
              formatter={(v: any) => [`$${(v / 1000).toFixed(0)}K`]}
            />
            <Bar dataKey="budget" name="Budget" fill="rgba(99,102,241,0.5)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" name="Actual" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title text-base">Recent Activity</h3>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">View all</button>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITIES.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 glass rounded-xl hover:bg-white/[0.04] transition-all">
                  <div className={`w-8 h-8 rounded-lg ${activity.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{activity.text}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{activity.sub}</div>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0">{activity.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights + Pending Approvals */}
        <div className="space-y-4">
          {/* AI Insights */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">AI Insights</h3>
            </div>
            <div className="space-y-3">
              {AI_INSIGHTS.map((insight, i) => {
                const Icon = insight.icon;
                return (
                  <div key={i} className="flex gap-3 text-sm">
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${insight.color}`} />
                    <p className="text-slate-700 text-xs leading-relaxed">{insight.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">Pending Approvals</h3>
              <span className="badge badge-warning">{PENDING_APPROVALS.length}</span>
            </div>
            <div className="space-y-2">
              {PENDING_APPROVALS.map((item, i) => (
                <div key={i} className="p-3 glass rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{item.type}</span>
                    <span className={`badge badge-${item.priority === "high" ? "danger" : item.priority === "medium" ? "warning" : "neutral"} text-xs`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">{item.from} · {item.dept}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
