"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users, UserPlus, Search, Filter, Download,
  MoreHorizontal, Mail, Phone, MapPin, Briefcase,
  Calendar, Award, TrendingUp, Clock, CheckCircle2,
  AlertTriangle, ArrowUpRight, Eye, Edit, Trash2
} from "lucide-react";
import { getInitials, getStatusColor, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

const INITIAL_EMPLOYEES = [
  { id: "EMP-001", name: "Sarah Williams", email: "sarah.w@acme.com", phone: "+1 555 0101", dept: "Engineering", designation: "Senior Engineer", type: "FULL_TIME", status: "ACTIVE", join: "2022-03-15", salary: 95000, avatar: null, location: "New York" },
  { id: "EMP-002", name: "James Chen", email: "james.c@acme.com", phone: "+1 555 0102", dept: "Marketing", designation: "Marketing Manager", type: "FULL_TIME", status: "ACTIVE", join: "2021-07-01", salary: 78000, avatar: null, location: "San Francisco" },
  { id: "EMP-003", name: "Priya Sharma", email: "priya.s@acme.com", phone: "+1 555 0103", dept: "Finance", designation: "Finance Analyst", type: "FULL_TIME", status: "ACTIVE", join: "2023-01-10", salary: 72000, avatar: null, location: "Chicago" },
  { id: "EMP-004", name: "Michael Brown", email: "michael.b@acme.com", phone: "+1 555 0104", dept: "Sales", designation: "Sales Director", type: "FULL_TIME", status: "ACTIVE", join: "2020-05-20", salary: 110000, avatar: null, location: "Austin" },
  { id: "EMP-005", name: "Emily Davis", email: "emily.d@acme.com", phone: "+1 555 0105", dept: "HR", designation: "HR Specialist", type: "FULL_TIME", status: "ON_LEAVE", join: "2022-09-01", salary: 65000, avatar: null, location: "Boston" },
  { id: "EMP-006", name: "Robert Kim", email: "robert.k@acme.com", phone: "+1 555 0106", dept: "Engineering", designation: "Frontend Dev", type: "CONTRACT", status: "ACTIVE", join: "2023-06-15", salary: 88000, avatar: null, location: "Seattle" },
  { id: "EMP-007", name: "Lisa Park", email: "lisa.p@acme.com", phone: "+1 555 0107", dept: "Operations", designation: "Ops Manager", type: "FULL_TIME", status: "ACTIVE", join: "2021-11-30", salary: 82000, avatar: null, location: "Denver" },
  { id: "EMP-008", name: "David Wilson", email: "david.w@acme.com", phone: "+1 555 0108", dept: "Supply Chain", designation: "Supply Chain Lead", type: "FULL_TIME", status: "ACTIVE", join: "2022-04-01", salary: 90000, avatar: null, location: "Phoenix" },
];

const DEPT_COLORS: Record<string, string> = {
  Engineering: "badge-info",
  Marketing: "badge-purple",
  Finance: "badge-success",
  Sales: "badge-warning",
  HR: "badge-danger",
  Operations: "badge-neutral",
  "Supply Chain": "badge-info",
};

const HR_KPIs = [
  { title: "Total Employees", value: "1,248", change: "+3.2%", up: true, icon: Users, color: "from-indigo-500 to-purple-600" },
  { title: "On Leave Today", value: "34", change: "-12%", up: true, icon: Clock, color: "from-amber-500 to-orange-600" },
  { title: "New This Month", value: "18", change: "+28%", up: true, icon: UserPlus, color: "from-emerald-500 to-teal-600" },
  { title: "Attrition Rate", value: "2.4%", change: "-0.6%", up: true, icon: TrendingUp, color: "from-blue-500 to-cyan-600" },
];

export default function HRPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as any;
  const [activeTab, setActiveTab] = useState<"employees" | "attendance" | "leave" | "payroll" | "performance">(tabParam || "employees");
  const [viewItem, setViewItem] = useState<{ type: "employee" | "payroll"; data: any } | null>(null);

  // Sync state with URL when tabParam changes
  useEffect(() => {
    if (tabParam && ["employees", "attendance", "leave", "payroll", "performance"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    router.push(`/dashboard/hr?tab=${tab}`);
  };

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [attendanceToday, setAttendanceToday] = useState<any[]>([]);

  useEffect(() => {
    import("@/app/actions/hr").then(async (actions) => {
      try {
        const [emps, atts, leaves, payrolls] = await Promise.all([
          actions.getEmployees(),
          actions.getAttendanceToday(),
          actions.getLeaveRequests(),
          actions.getPayrollRecords()
        ]);
        if (emps && emps.length > 0) setEmployees(emps);
        // Leave defaults for others down below by setting state conditionally
        if (atts && atts.length > 0) setAttendanceToday(atts);
        if (leaves && leaves.length > 0) setLeaveRequests(leaves);
        if (payrolls && payrolls.length > 0) setPayrollRecords(payrolls);
      } catch (err) {
        console.error("Failed to fetch hr data:", err);
      }
    });
  }, []);

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  const DEPARTMENTS = ["All", "Engineering", "Marketing", "Finance", "Sales", "HR", "Operations", "Supply Chain"];

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === "All" || emp.dept === selectedDept;
    return matchSearch && matchDept;
  });

  const TABS = [
    { id: "employees", label: "Employees" },
    { id: "attendance", label: "Attendance" },
    { id: "leave", label: "Leave" },
    { id: "payroll", label: "Payroll" },
    { id: "performance", label: "Performance" },
  ] as const;

  const INITIAL_LEAVE_REQUESTS = [
    { emp: "Emily Davis", type: "Annual Leave", from: "Dec 20", to: "Dec 27", days: 5, status: "PENDING" },
    { emp: "James Chen", type: "Sick Leave", from: "Dec 10", to: "Dec 11", days: 2, status: "APPROVED" },
    { emp: "Robert Kim", type: "Annual Leave", from: "Jan 2", to: "Jan 5", days: 3, status: "PENDING" },
    { emp: "Priya Sharma", type: "Maternity Leave", from: "Jan 15", to: "Apr 15", days: 90, status: "APPROVED" },
  ];

  const INITIAL_PAYROLL_RECORDS = [
    { period: "Nov 2024", employees: 248, gross: 2840000, deductions: 620000, net: 2220000, status: "PAID" },
    { period: "Oct 2024", employees: 245, gross: 2810000, deductions: 615000, net: 2195000, status: "PAID" },
    { period: "Sep 2024", employees: 242, gross: 2780000, deductions: 608000, net: 2172000, status: "PAID" },
    { period: "Dec 2024", employees: 248, gross: 2860000, deductions: 625000, net: 2235000, status: "PROCESSING" },
  ];

  const INITIAL_ATTENDANCE_TODAY = [
    { emp: "Sarah Williams", clockIn: "09:02 AM", clockOut: "--", status: "PRESENT", hrs: "5h 45m" },
    { emp: "James Chen", clockIn: "08:55 AM", clockOut: "--", status: "PRESENT", hrs: "5h 52m" },
    { emp: "Emily Davis", clockIn: "--", clockOut: "--", status: "ON_LEAVE", hrs: "0" },
    { emp: "Michael Brown", clockIn: "10:15 AM", clockOut: "--", status: "LATE", hrs: "4h 32m" },
    { emp: "Priya Sharma", clockIn: "08:45 AM", clockOut: "--", status: "PRESENT", hrs: "6h 02m" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-xl">Human Resources</h1>
          <p className="section-subtitle">Manage your workforce, attendance, and payroll</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm"><Download className="w-4 h-4" /> Export</button>
          <button className="btn btn-primary btn-sm"><UserPlus className="w-4 h-4" /> Add Employee</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {HR_KPIs.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="kpi-card">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{kpi.value}</div>
              <div className="text-sm text-black mt-1">{kpi.title}</div>
              <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                <ArrowUpRight className="w-3 h-3" />{kpi.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id ? "gradient-brand text-white shadow" : "text-black hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedDept === dept
                      ? "gradient-brand text-white shadow-sm"
                      : "bg-white border border-slate-200 text-black hover:text-slate-900"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Type</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {getInitials(emp.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{emp.name}</div>
                          <div className="text-xs text-black">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${DEPT_COLORS[emp.dept] || "badge-neutral"}`}>
                        {emp.dept}
                      </span>
                    </td>
                    <td className="text-black text-sm">{emp.designation}</td>
                    <td className="text-black text-sm">{emp.type.replace("_", " ")}</td>
                    <td className="text-black text-sm">{emp.join}</td>
                    <td>
                      <span className={`badge ${getStatusColor(emp.status)}`}>
                        {emp.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setViewItem({ type: "employee", data: emp })} className="btn btn-secondary btn-icon btn-sm"><Eye className="w-4 h-4" /></button>
                        <button className="btn btn-secondary btn-icon btn-sm"><Edit className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {[
                { label: "Present", value: "1,104", color: "text-emerald-400" },
                { label: "Absent", value: "68", color: "text-red-400" },
                { label: "Late", value: "42", color: "text-amber-400" },
                { label: "On Leave", value: "34", color: "text-blue-400" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-black">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="text-right">
              <div className="text-sm text-black">Today</div>
              <div className="text-lg font-bold text-slate-900">Dec 7, 2024</div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Status</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {(attendanceToday.length > 0 ? attendanceToday : INITIAL_ATTENDANCE_TODAY).map((att) => (
                  <tr key={att.emp}>
                    <td className="font-medium text-slate-900">{att.emp}</td>
                    <td className="font-mono text-sm text-black">{att.clockIn}</td>
                    <td className="font-mono text-sm text-black">{att.clockOut}</td>
                    <td>
                      <span className={`badge ${getStatusColor(att.status)}`}>{att.status.replace("_", " ")}</span>
                    </td>
                    <td className="font-semibold text-slate-900">{att.hrs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Tab */}
      {activeTab === "leave" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="section-title text-base">Leave Requests</h3>
            <button className="btn btn-primary btn-sm"><CheckCircle2 className="w-4 h-4" /> New Request</button>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(leaveRequests.length > 0 ? leaveRequests : INITIAL_LEAVE_REQUESTS).map((req, i) => (
                  <tr key={i}>
                    <td className="font-medium text-slate-900">{req.emp}</td>
                    <td className="text-black">{req.type}</td>
                    <td className="text-black">{req.from}</td>
                    <td className="text-black">{req.to}</td>
                    <td className="font-bold text-slate-900">{req.days}</td>
                    <td><span className={`badge ${getStatusColor(req.status)}`}>{req.status}</span></td>
                    <td>
                      {req.status === "PENDING" && (
                        <div className="flex gap-1">
                          <button className="btn btn-sm" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>Approve</button>
                          <button className="btn btn-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {activeTab === "payroll" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="section-title text-base">Payroll Runs</h3>
            <button className="btn btn-primary btn-sm"><Award className="w-4 h-4" /> Run Payroll</button>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th className="text-right">Employees</th>
                  <th className="text-right">Gross Pay</th>
                  <th className="text-right">Deductions</th>
                  <th className="text-right">Net Pay</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(payrollRecords.length > 0 ? payrollRecords : INITIAL_PAYROLL_RECORDS).map((pr) => (
                  <tr key={pr.period}>
                    <td className="font-semibold text-slate-900">{pr.period}</td>
                    <td className="text-right text-black">{pr.employees}</td>
                    <td className="text-right font-mono text-slate-900">${(pr.gross / 1000).toFixed(0)}K</td>
                    <td className="text-right font-mono text-red-400">-${(pr.deductions / 1000).toFixed(0)}K</td>
                    <td className="text-right font-bold text-emerald-400">${(pr.net / 1000).toFixed(0)}K</td>
                    <td><span className={`badge ${getStatusColor(pr.status)}`}>{pr.status}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setViewItem({ type: "payroll", data: pr })} className="btn btn-secondary btn-icon btn-sm"><Eye className="w-4 h-4" /></button>
                        <button className="btn btn-secondary btn-icon btn-sm"><Download className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.slice(0, 6).map((emp) => {
            const score = 3.5 + Math.random() * 1.5;
            const pct = (score / 5) * 100;
            return (
              <div key={emp.id} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-sm font-bold text-white">
                    {getInitials(emp.name)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                    <div className="text-xs text-black">{emp.designation}</div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-black">Overall Score</span>
                    <span className="font-bold text-slate-900">{score.toFixed(1)}/5.0</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill gradient-brand"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                {["Goals", "Skills", "Collaboration"].map((cat) => {
                  const val = 60 + Math.random() * 40;
                  return (
                    <div key={cat} className="flex justify-between text-xs text-black mb-1">
                      <span>{cat}</span>
                      <span className="text-slate-900 font-semibold">{val.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={viewItem?.type === "employee"}
        onClose={() => setViewItem(null)}
        title="Employee Details"
      >
        {viewItem?.type === "employee" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center text-xl font-bold text-white shrink-0">
                {getInitials(viewItem.data.name)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{viewItem.data.name}</h3>
                <p className="text-black text-sm">{viewItem.data.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Employee ID</p>
                <p className="font-semibold font-mono">{viewItem.data.id}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Status</p>
                <p className="font-semibold">{viewItem.data.status.replace("_", " ")}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Department</p>
                <p className="font-semibold">{viewItem.data.dept}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Designation</p>
                <p className="font-semibold">{viewItem.data.designation}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Employment Type</p>
                <p className="font-semibold">{viewItem.data.type.replace("_", " ")}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Location</p>
                <p className="font-semibold">{viewItem.data.location}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Phone</p>
                <p className="font-semibold">{viewItem.data.phone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Joined Date</p>
                <p className="font-semibold">{viewItem.data.join}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={viewItem?.type === "payroll"}
        onClose={() => setViewItem(null)}
        title="Payroll Run Details"
      >
        {viewItem?.type === "payroll" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">{viewItem.data.period}</h3>
              <span className={`badge ${getStatusColor(viewItem.data.status)}`}>{viewItem.data.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Employees Processed</p>
                <p className="font-semibold">{viewItem.data.employees}</p>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Gross Pay</p>
                <p className="font-bold text-lg text-slate-900">${(viewItem.data.gross).toLocaleString()}</p>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Deductions</p>
                <p className="font-bold text-lg text-red-500">-${(viewItem.data.deductions).toLocaleString()}</p>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-lg border-t-2 border-emerald-200">
                <p className="text-xs text-black mb-1">Net Pay</p>
                <p className="font-bold text-xl text-emerald-600">${(viewItem.data.net).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
