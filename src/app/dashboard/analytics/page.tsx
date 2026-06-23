"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, DollarSign, Users, Package,
  FolderOpen, Brain, PieChart, Download, Plus, Settings,
  GripHorizontal, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart as RechartsPie, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const REVENUE_TREND = [
  { month: "Jan", revenue: 420, target: 450 },
  { month: "Feb", revenue: 480, target: 460 },
  { month: "Mar", revenue: 510, target: 480 },
  { month: "Apr", revenue: 490, target: 500 },
  { month: "May", revenue: 560, target: 520 },
  { month: "Jun", revenue: 620, target: 550 },
  { month: "Jul", revenue: 580, target: 570 },
  { month: "Aug", revenue: 650, target: 600 },
  { month: "Sep", revenue: 700, target: 640 },
  { month: "Oct", revenue: 680, target: 660 },
  { month: "Nov", revenue: 740, target: 700 },
  { month: "Dec", revenue: 820, target: 750 },
];

const DEPT_PERFORMANCE = [
  { dept: "Sales", revenue: 95, efficiency: 88, satisfaction: 82 },
  { dept: "Engineering", revenue: 70, efficiency: 95, satisfaction: 90 },
  { dept: "Marketing", revenue: 78, efficiency: 72, satisfaction: 85 },
  { dept: "Operations", revenue: 65, efficiency: 88, satisfaction: 76 },
  { dept: "HR", revenue: 60, efficiency: 80, satisfaction: 92 },
];

const CATEGORY_MIX = [
  { name: "Software", value: 35, color: "#6366f1" },
  { name: "Hardware", value: 28, color: "#22c55e" },
  { name: "Services", value: 22, color: "#f59e0b" },
  { name: "Support", value: 15, color: "#3b82f6" },
];

const REGIONAL_DATA = [
  { region: "North America", q1: 1200, q2: 1350, q3: 1280, q4: 1480 },
  { region: "Europe", q1: 850, q2: 920, q3: 980, q4: 1050 },
  { region: "Asia Pacific", q1: 640, q2: 720, q3: 810, q4: 960 },
  { region: "Middle East", q1: 280, q2: 320, q3: 350, q4: 420 },
];

const WIDGETS = [
  { id: "revenue", title: "Revenue Trend", type: "area", span: 2 },
  { id: "category", title: "Revenue Mix", type: "pie", span: 1 },
  { id: "dept", title: "Dept Performance", type: "radar", span: 1 },
  { id: "regional", title: "Regional Revenue", type: "bar", span: 2 },
  { id: "kpi1", title: "Net Profit Margin", type: "kpi", value: "25.8%", trend: "+3.2%", color: "from-indigo-500 to-purple-600", span: 1 },
  { id: "kpi2", title: "Customer Lifetime Value", type: "kpi", value: "$12,400", trend: "+8.1%", color: "from-emerald-500 to-teal-600", span: 1 },
];

export default function AnalyticsPage() {
  const [activeView, setActiveView] = useState<"overview" | "builder">("overview");
  const [period, setPeriod] = useState("2024");
  const [analyticsData, setAnalyticsData] = useState<{
    totalRevenue: string;
    netProfit: string;
    operatingExpenses: string;
    ebitda: string;
    revenuePerEmployee: string;
    customerRetention: string;
    rawRevenue: number;
  } | null>(null);

  useEffect(() => {
    import("@/app/actions/analytics").then(async (actions) => {
      try {
        const data = await actions.getExecutiveAnalytics();
        if (data && data.rawRevenue > 0) {
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      }
    });
  }, []);

  const EXECUTIVE_KPIs = [
    { title: "Total Revenue", value: analyticsData?.totalRevenue || "$7.23M", change: "+12.4%", up: true, icon: DollarSign, color: "#6366f1", pct: 82 },
    { title: "Net Profit", value: analyticsData?.netProfit || "$1.87M", change: "+18.2%", up: true, icon: TrendingUp, color: "#22c55e", pct: 68 },
    { title: "Operating Expenses", value: analyticsData?.operatingExpenses || "$4.89M", change: "+9.1%", up: false, icon: BarChart3, color: "#f59e0b", pct: 74 },
    { title: "EBITDA", value: analyticsData?.ebitda || "$2.34M", change: "+15.6%", up: true, icon: TrendingUp, color: "#3b82f6", pct: 55 },
    { title: "Revenue per Employee", value: analyticsData?.revenuePerEmployee || "$5,800", change: "+7.8%", up: true, icon: Users, color: "#ec4899", pct: 71 },
    { title: "Customer Retention", value: analyticsData?.customerRetention || "94.2%", change: "+2.1%", up: true, icon: Users, color: "#8b5cf6", pct: 94 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-xl">Business Intelligence</h1>
          <p className="section-subtitle">Executive analytics, KPIs, and performance insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="form-input w-auto text-sm"
          >
            <option value="2024">FY 2024</option>
            <option value="2023">FY 2023</option>
            <option value="q4">Q4 2024</option>
            <option value="q3">Q3 2024</option>
          </select>
          <button className="btn btn-secondary btn-sm"><RefreshCw className="w-4 h-4" /> Refresh</button>
          <button className="btn btn-secondary btn-sm"><Download className="w-4 h-4" /> Export</button>
          <button
            onClick={() => setActiveView(activeView === "overview" ? "builder" : "overview")}
            className="btn btn-primary btn-sm"
          >
            {activeView === "overview" ? <><Settings className="w-4 h-4" /> Dashboard Builder</> : <><BarChart3 className="w-4 h-4" /> View Overview</>}
          </button>
        </div>
      </div>

      {activeView === "overview" && (
        <div className="space-y-4">
          {/* Executive KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {EXECUTIVE_KPIs.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.title} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                    <span className={`text-xs font-bold ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                      {kpi.change}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mb-1">{kpi.value}</div>
                  <div className="text-xs text-black mb-2">{kpi.title}</div>
                  <div className="progress-bar h-1">
                    <div
                      className="progress-fill h-1"
                      style={{ width: `${kpi.pct}%`, background: kpi.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue Trend */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="section-title text-base">Revenue vs Target</h3>
                <p className="section-subtitle text-xs">Monthly performance against targets</p>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-black">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border-2 border-dashed border-amber-400 bg-transparent" />
                  <span className="text-black">Target</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={REVENUE_TREND}>
                <defs>
                  <linearGradient id="biRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}K`} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "12px", fontSize: "12px" }} formatter={(v: any) => [`$${v}K`]} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#biRev)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Middle Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue Mix */}
            <div className="glass-card p-6">
              <h3 className="section-title text-base mb-1">Revenue Mix</h3>
              <p className="section-subtitle text-xs mb-4">By category</p>
              <ResponsiveContainer width="100%" height={180}>
                <RechartsPie>
                  <Pie
                    data={CATEGORY_MIX}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {CATEGORY_MIX.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `${v}%`}
                    contentStyle={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "12px", fontSize: "12px" }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CATEGORY_MIX.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-black truncate">{item.name}</span>
                    <span className="text-slate-900 font-bold ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dept Performance Radar */}
            <div className="glass-card p-6">
              <h3 className="section-title text-base mb-1">Dept Performance</h3>
              <p className="section-subtitle text-xs mb-4">Multi-dimensional analysis</p>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={DEPT_PERFORMANCE}>
                  <PolarGrid stroke="rgba(148,163,184,0.1)" />
                  <PolarAngleAxis dataKey="dept" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Radar name="Revenue" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Efficiency" dataKey="efficiency" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "12px", fontSize: "11px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Forecast Box */}
            <div className="glass-card p-6 gradient-mesh relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Predictions</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Q1 2025 Revenue", value: "$2.4M", conf: "94%", icon: "📈" },
                    { label: "Q1 2025 Profit", value: "$620K", conf: "91%", icon: "💰" },
                    { label: "Headcount Growth", value: "+42", conf: "87%", icon: "👥" },
                    { label: "Churn Risk", value: "3.2%", conf: "89%", icon: "⚠️" },
                  ].map((pred) => (
                    <div key={pred.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{pred.icon}</span>
                        <span className="text-sm text-black">{pred.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-sm">{pred.value}</div>
                        <div className="text-xs text-black">{pred.conf} conf.</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Regional Revenue */}
          <div className="glass-card p-6">
            <h3 className="section-title text-base mb-1">Regional Revenue by Quarter</h3>
            <p className="section-subtitle text-xs mb-4">$K</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={REGIONAL_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}K`} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "12px", fontSize: "12px" }} formatter={(v: any) => [`$${v}K`]} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
                <Bar dataKey="q1" name="Q1" fill="#6366f1" radius={[2, 2, 0, 0]} />
                <Bar dataKey="q2" name="Q2" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="q3" name="Q3" fill="#a855f7" radius={[2, 2, 0, 0]} />
                <Bar dataKey="q4" name="Q4" fill="#c084fc" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeView === "builder" && (
        <div className="space-y-4">
          <div className="glass-card p-6 border-2 border-dashed border-indigo-500/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="section-title text-base">Dashboard Builder</h3>
                <p className="section-subtitle text-xs">Drag and drop widgets to customize your dashboard</p>
              </div>
              <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Add Widget</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "KPI Card", desc: "Single metric with trend", icon: TrendingUp },
                { title: "Area Chart", desc: "Time series trends", icon: BarChart3 },
                { title: "Bar Chart", desc: "Comparative analysis", icon: BarChart3 },
                { title: "Pie Chart", desc: "Distribution breakdown", icon: PieChart },
                { title: "Data Table", desc: "Tabular data view", icon: FolderOpen },
                { title: "Forecast", desc: "AI prediction widget", icon: Brain },
              ].map((widget) => {
                const Icon = widget.icon;
                return (
                  <div
                    key={widget.title}
                    className="p-4 glass rounded-xl border border-white/5 hover:border-indigo-500/30 cursor-grab active:cursor-grabbing transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <GripHorizontal className="w-4 h-4 text-black group-hover:text-black" />
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{widget.title}</div>
                        <div className="text-xs text-black">{widget.desc}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-8 border-2 border-dashed border-white/10 rounded-xl text-center">
              <div className="text-black text-sm mb-2">Canvas Area</div>
              <div className="text-black text-xs">Drag widgets here to build your dashboard</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
