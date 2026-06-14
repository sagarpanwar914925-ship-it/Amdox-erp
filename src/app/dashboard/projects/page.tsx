"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FolderOpen, Plus, Search, Filter, BarChart3,
  Calendar, Users, DollarSign, CheckCircle2,
  Clock, AlertTriangle, ArrowUpRight, Eye,
  Edit, Target, Milestone
} from "lucide-react";
import { getStatusColor, getPriorityColor, percentage } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

const PROJECTS = [
  {
    id: "PRJ-001", name: "ERP System Migration", code: "ERP-MIG",
    status: "ACTIVE", priority: "CRITICAL",
    start: "2024-10-01", end: "2025-03-31",
    budget: 450000, actual: 180000, progress: 42,
    manager: "Alex Johnson", team: 8, tasks: { total: 64, done: 27 },
    color: "#6366f1",
  },
  {
    id: "PRJ-002", name: "Mobile App Launch", code: "MOB-APP",
    status: "ACTIVE", priority: "HIGH",
    start: "2024-11-01", end: "2025-01-31",
    budget: 180000, actual: 95000, progress: 68,
    manager: "Sarah Williams", team: 5, tasks: { total: 38, done: 26 },
    color: "#22c55e",
  },
  {
    id: "PRJ-003", name: "Data Center Upgrade", code: "DC-UPG",
    status: "ON_HOLD", priority: "MEDIUM",
    start: "2024-09-01", end: "2024-12-31",
    budget: 320000, actual: 140000, progress: 35,
    manager: "Robert Kim", team: 4, tasks: { total: 28, done: 10 },
    color: "#f59e0b",
  },
  {
    id: "PRJ-004", name: "Customer Portal v2", code: "CUST-V2",
    status: "ACTIVE", priority: "HIGH",
    start: "2024-11-15", end: "2025-02-15",
    budget: 90000, actual: 30000, progress: 22,
    manager: "James Chen", team: 3, tasks: { total: 22, done: 5 },
    color: "#3b82f6",
  },
  {
    id: "PRJ-005", name: "Security Audit 2025", code: "SEC-AUD",
    status: "PLANNING", priority: "HIGH",
    start: "2025-01-01", end: "2025-03-31",
    budget: 60000, actual: 0, progress: 0,
    manager: "Michael Brown", team: 2, tasks: { total: 15, done: 0 },
    color: "#ec4899",
  },
];

const TASKS = [
  { id: "T-001", project: "ERP-MIG", title: "Setup database schema", assignee: "Sarah W.", priority: "CRITICAL", due: "Dec 10", status: "DONE", hrs: 24 },
  { id: "T-002", project: "ERP-MIG", title: "Build authentication module", assignee: "Robert K.", priority: "HIGH", due: "Dec 15", status: "IN_PROGRESS", hrs: 40 },
  { id: "T-003", project: "MOB-APP", title: "Design UI components", assignee: "James C.", priority: "HIGH", due: "Dec 12", status: "IN_REVIEW", hrs: 32 },
  { id: "T-004", project: "MOB-APP", title: "Integrate payment gateway", assignee: "Priya S.", priority: "HIGH", due: "Dec 20", status: "TODO", hrs: 48 },
  { id: "T-005", project: "CUST-V2", title: "Create API endpoints", assignee: "Alex J.", priority: "MEDIUM", due: "Dec 25", status: "IN_PROGRESS", hrs: 20 },
  { id: "T-006", project: "ERP-MIG", title: "Finance module testing", assignee: "Lisa P.", priority: "HIGH", due: "Dec 18", status: "TODO", hrs: 16 },
];

// Gantt chart rows
const GANTT_ROWS = [
  { project: "ERP Migration", start: 1, duration: 6, color: "#6366f1", tasks: ["DB Schema", "Auth", "Finance", "HR", "Testing", "Deployment"] },
  { project: "Mobile App", start: 2, duration: 3, color: "#22c55e", tasks: ["UI Design", "API", "QA"] },
  { project: "Data Center", start: 1, duration: 4, color: "#f59e0b", tasks: ["Planning", "Hardware", "Config", "Migration"] },
  { project: "Customer Portal", start: 3, duration: 3, color: "#3b82f6", tasks: ["Design", "Dev", "Testing"] },
];

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const PROJ_KPIs = [
  { title: "Active Projects", value: "32", change: "+8.1%", up: true, icon: FolderOpen, color: "from-indigo-500 to-purple-600" },
  { title: "On-Time Delivery", value: "78%", change: "+4%", up: true, icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
  { title: "Budget Utilized", value: "$445K", change: "+12%", up: false, icon: DollarSign, color: "from-amber-500 to-orange-600" },
  { title: "Overdue Tasks", value: "14", change: "-6", up: true, icon: AlertTriangle, color: "from-red-500 to-rose-600" },
];

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as any;
  const [activeTab, setActiveTab] = useState<"projects" | "tasks" | "gantt">(tabParam || "projects");
  const [viewItem, setViewItem] = useState<{ type: "project" | "task"; data: any } | null>(null);

  useEffect(() => {
    if (tabParam && ["projects", "tasks", "gantt"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    router.push(`/dashboard/projects?tab=${tab}`);
  };

  const TABS = [
    { id: "projects", label: "Projects" },
    { id: "tasks", label: "Tasks" },
    { id: "gantt", label: "Gantt Chart" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-xl">Project Management</h1>
          <p className="section-subtitle">Track projects, tasks, timelines, and budgets</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm"><Filter className="w-4 h-4" /> Filter</button>
          <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> New Project</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {PROJ_KPIs.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="kpi-card">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{kpi.value}</div>
              <div className="text-sm text-slate-600 mt-1">{kpi.title}</div>
              <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                <ArrowUpRight className="w-3 h-3" />{kpi.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id ? "gradient-brand text-white shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {PROJECTS.map((proj) => {
            const budgetUsed = percentage(proj.actual, proj.budget);
            return (
              <div key={proj.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm"
                      style={{ background: proj.color + "33", border: `2px solid ${proj.color}40` }}
                    >
                      {proj.code.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{proj.name}</div>
                      <div className="text-xs text-slate-500">{proj.code}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge ${getStatusColor(proj.status)}`}>{proj.status.replace("_", " ")}</span>
                    <span className={`badge ${getPriorityColor(proj.priority)}`}>{proj.priority}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-bold text-slate-900">{proj.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${proj.progress}%`, background: proj.color }}
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600">Budget Used</span>
                      <span className={`font-bold ${budgetUsed > 80 ? "text-red-400" : "text-slate-900"}`}>
                        {budgetUsed}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${budgetUsed}%`,
                          background: budgetUsed > 80 ? "#ef4444" : "#22c55e"
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="text-center">
                      <div className="text-sm font-bold text-slate-900">{proj.tasks.done}/{proj.tasks.total}</div>
                      <div className="text-xs text-slate-500">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-slate-900">{proj.team}</div>
                      <div className="text-xs text-slate-500">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold" style={{ color: proj.color }}>
                        ${(proj.budget / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-slate-500">Budget</div>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {proj.start}</span>
                    <span>→</span>
                    <span>{proj.end}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => setViewItem({ type: "project", data: proj })} className="btn btn-secondary btn-sm flex-1"><Eye className="w-4 h-4" /> View</button>
                  <button className="btn btn-primary btn-sm flex-1"><Edit className="w-4 h-4" /> Edit</button>
                </div>
              </div>
            );
          })}

          {/* Add Project Card */}
          <div
            className="glass-card p-6 border-dashed border-2 border-slate-700 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-500/40 transition-all group min-h-[300px]"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-900">New Project</div>
              <div className="text-xs text-slate-500">Create from template or scratch</div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input className="form-input pl-10" placeholder="Search tasks..." />
            </div>
            <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Add Task</button>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Est. Hours</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {TASKS.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${task.status === "DONE" ? "bg-emerald-400" : task.status === "IN_PROGRESS" ? "bg-blue-400" : task.status === "IN_REVIEW" ? "bg-amber-400" : "bg-slate-400"}`} />
                        <span className="font-medium text-slate-900 text-sm">{task.title}</span>
                      </div>
                      <span className="text-xs text-slate-500 ml-4">{task.id}</span>
                    </td>
                    <td className="font-mono text-indigo-500 text-sm">{task.project}</td>
                    <td className="text-slate-700 text-sm">{task.assignee}</td>
                    <td><span className={`badge ${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                    <td className="text-slate-600 text-sm">{task.due}</td>
                    <td className="font-mono text-sm">{task.hrs}h</td>
                    <td><span className={`badge ${getStatusColor(task.status)}`}>{task.status.replace("_", " ")}</span></td>
                    <td>
                      <button onClick={() => setViewItem({ type: "task", data: task })} className="btn btn-secondary btn-icon btn-sm"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gantt Tab */}
      {activeTab === "gantt" && (
        <div className="space-y-4">
          <div className="glass-card p-6 overflow-x-auto">
            <h3 className="section-title text-base mb-4">Project Timeline — Q4 2024 to Q1 2025</h3>
            <div className="min-w-[700px]">
              {/* Month headers */}
              <div className="grid gap-0 mb-4" style={{ gridTemplateColumns: "200px repeat(6, 1fr)" }}>
                <div className="text-xs text-slate-500 font-semibold uppercase pb-2">Project</div>
                {MONTHS.map((month) => (
                  <div key={month} className="text-xs text-slate-500 font-semibold uppercase text-center pb-2 border-l border-white/5">
                    {month}
                  </div>
                ))}
              </div>

              {/* Project rows */}
              <div className="space-y-3">
                {GANTT_ROWS.map((row) => (
                  <div key={row.project} className="grid gap-0 items-center" style={{ gridTemplateColumns: "200px repeat(6, 1fr)" }}>
                    <div className="text-sm font-semibold text-slate-900 pr-4 truncate">{row.project}</div>
                    <div className="col-span-6 relative h-10">
                      {/* Grid lines */}
                      <div className="absolute inset-0 grid grid-cols-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="border-l border-white/5" />
                        ))}
                      </div>
                      {/* Bar */}
                      <div
                        className="absolute top-1 h-8 rounded-lg flex items-center px-3 text-xs font-semibold text-white shadow-md"
                        style={{
                          left: `${((row.start - 1) / 6) * 100}%`,
                          width: `${(row.duration / 6) * 100}%`,
                          background: row.color,
                          opacity: 0.85,
                        }}
                      >
                        <span className="truncate">{row.tasks.slice(0, 2).join(", ")}...</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-6 mt-6 pt-4 border-t border-white/5">
                {GANTT_ROWS.map((row) => (
                  <div key={row.project} className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-3 h-3 rounded" style={{ background: row.color }} />
                    {row.project}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={viewItem?.type === "project"}
        onClose={() => setViewItem(null)}
        title="Project Details"
      >
        {viewItem?.type === "project" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{viewItem.data.name}</h3>
                <p className="text-slate-500 font-mono text-sm">{viewItem.data.code}</p>
              </div>
              <span className={`badge ${getStatusColor(viewItem.data.status)}`}>{viewItem.data.status.replace("_", " ")}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Project Manager</p>
                <p className="font-semibold">{viewItem.data.manager}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Priority</p>
                <span className={`badge ${getPriorityColor(viewItem.data.priority)}`}>{viewItem.data.priority}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Timeline</p>
                <p className="font-semibold text-sm">{viewItem.data.start} → {viewItem.data.end}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Team Size</p>
                <p className="font-semibold">{viewItem.data.team} members</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Budget</p>
                <p className="font-semibold">${(viewItem.data.budget / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Actual Spent</p>
                <p className="font-semibold">${(viewItem.data.actual / 1000).toFixed(0)}K</p>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Overall Progress ({viewItem.data.progress}%)</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div className="h-2 rounded-full" style={{ width: `${viewItem.data.progress}%`, background: viewItem.data.color }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={viewItem?.type === "task"}
        onClose={() => setViewItem(null)}
        title="Task Details"
      >
        {viewItem?.type === "task" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">{viewItem.data.title}</h3>
              <span className={`badge ${getStatusColor(viewItem.data.status)}`}>{viewItem.data.status.replace("_", " ")}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Task ID</p>
                <p className="font-semibold font-mono text-sm">{viewItem.data.id}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Project Code</p>
                <p className="font-semibold font-mono text-indigo-600 text-sm">{viewItem.data.project}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Assignee</p>
                <p className="font-semibold">{viewItem.data.assignee}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Priority</p>
                <span className={`badge ${getPriorityColor(viewItem.data.priority)}`}>{viewItem.data.priority}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Due Date</p>
                <p className="font-semibold">{viewItem.data.due}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Estimated Hours</p>
                <p className="font-semibold">{viewItem.data.hrs}h</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
