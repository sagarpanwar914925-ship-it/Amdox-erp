"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle,
  ArrowUpRight, ArrowDownRight, FileText, CreditCard,
  BarChart3, Plus, Download, Filter, Eye, Target, Search,
  Edit2, Trash2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

const CASHFLOW_DATA = [
  { month: "Jul", inflow: 680000, outflow: 520000 },
  { month: "Aug", inflow: 720000, outflow: 560000 },
  { month: "Sep", inflow: 690000, outflow: 490000 },
  { month: "Oct", inflow: 760000, outflow: 580000 },
  { month: "Nov", inflow: 810000, outflow: 620000 },
  { month: "Dec", inflow: 870000, outflow: 640000 },
];

const INITIAL_INVOICES = [
  { id: "INV-2024-089", customer: "TechCorp Global", amount: 42500, date: "Dec 01", due: "Dec 31", status: "SENT" },
  { id: "INV-2024-088", customer: "Nexus Solutions", amount: 18200, date: "Nov 28", due: "Dec 28", status: "PAID" },
  { id: "INV-2024-087", customer: "Alpha Industries", amount: 76800, date: "Nov 25", due: "Dec 25", status: "OVERDUE" },
  { id: "INV-2024-086", customer: "Beta Corp", amount: 12400, date: "Nov 20", due: "Dec 20", status: "PARTIAL" },
  { id: "INV-2024-085", customer: "Gamma Tech", amount: 9800, date: "Nov 15", due: "Dec 15", status: "PAID" },
];

const INITIAL_BILLS = [
  { id: "BILL-2024-034", vendor: "AWS Services", amount: 8400, date: "Dec 01", due: "Dec 30", status: "APPROVED" },
  { id: "BILL-2024-033", vendor: "Office Supplies Co", amount: 2200, date: "Nov 28", due: "Dec 28", status: "DRAFT" },
  { id: "BILL-2024-032", vendor: "Electricity Provider", amount: 4800, date: "Nov 25", due: "Dec 15", status: "PAID" },
  { id: "BILL-2024-031", vendor: "Internet Services", amount: 1200, date: "Nov 20", due: "Dec 05", status: "OVERDUE" },
];

const ACCOUNTS = [
  { name: "Cash & Bank", code: "1000", balance: 2840000, type: "ASSET", change: 12.4 },
  { name: "Accounts Receivable", code: "1200", balance: 980000, type: "ASSET", change: 8.2 },
  { name: "Inventory", code: "1400", balance: 1240000, type: "ASSET", change: -3.1 },
  { name: "Accounts Payable", code: "2000", balance: 420000, type: "LIABILITY", change: 5.8 },
  { name: "Revenue", code: "4000", balance: 7230000, type: "REVENUE", change: 15.6 },
  { name: "Operating Expenses", code: "5000", balance: 4890000, type: "EXPENSE", change: 11.2 },
];

const PL_DATA = [
  { category: "Revenue", jan: 420, feb: 480, mar: 510, apr: 490, may: 560, jun: 620 },
  { category: "COGS", jan: 180, feb: 210, mar: 225, apr: 215, may: 245, jun: 270 },
  { category: "Gross Profit", jan: 240, feb: 270, mar: 285, apr: 275, may: 315, jun: 350 },
  { category: "Operating Exp", jan: 130, feb: 150, mar: 155, apr: 148, may: 165, jun: 180 },
  { category: "Net Profit", jan: 110, feb: 120, mar: 130, apr: 127, may: 150, jun: 170 },
];

const GENERAL_LEDGER = [
  { id: "JRNL-1042", date: "Dec 05", account: "Cash & Bank", desc: "Customer Payment - Nexus Solutions", debit: 18200, credit: null, ref: "INV-2024-088" },
  { id: "JRNL-1042", date: "Dec 05", account: "Accounts Receivable", desc: "Customer Payment - Nexus Solutions", debit: null, credit: 18200, ref: "INV-2024-088" },
  { id: "JRNL-1043", date: "Dec 06", account: "Office Supplies", desc: "AWS Services Bill", debit: 8400, credit: null, ref: "BILL-2024-034" },
  { id: "JRNL-1043", date: "Dec 06", account: "Accounts Payable", desc: "AWS Services Bill", debit: null, credit: 8400, ref: "BILL-2024-034" },
  { id: "JRNL-1044", date: "Dec 07", account: "Revenue", desc: "Consulting Services", debit: null, credit: 45000, ref: "INV-2024-089" },
  { id: "JRNL-1044", date: "Dec 07", account: "Accounts Receivable", desc: "Consulting Services", debit: 45000, credit: null, ref: "INV-2024-089" },
];

const BUDGETS = [
  { department: "Marketing", allocated: 150000, spent: 125000, status: "ON_TRACK" },
  { department: "Engineering", allocated: 500000, spent: 510000, status: "EXCEEDED" },
  { department: "Sales", allocated: 200000, spent: 180000, status: "ON_TRACK" },
  { department: "HR & Admin", allocated: 100000, spent: 65000, status: "UNDER_BUDGET" },
  { department: "IT Operations", allocated: 120000, spent: 45000, status: "UNDER_BUDGET" },
];

export default function FinancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as any;
  const [activeTab, setActiveTab] = useState<"overview" | "gl" | "ap" | "ar" | "budgets" | "reports">(tabParam || "overview");
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [bills, setBills] = useState(INITIAL_BILLS);
  const [accounts, setAccounts] = useState(ACCOUNTS);
  const [ledger, setLedger] = useState(GENERAL_LEDGER);
  const [viewItem, setViewItem] = useState<{ type: "invoice" | "bill"; data: any } | null>(null);
  const [editItem, setEditItem] = useState<{ type: "invoice" | "bill"; data: any } | null>(null);
  const [viewReport, setViewReport] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("@/app/actions/finance").then(async (actions) => {
      try {
        const [invs, bls, accs, jrnls] = await Promise.all([
          actions.getInvoices(),
          actions.getBills(),
          actions.getAccounts(),
          actions.getJournalEntries()
        ]);
        if (invs && invs.length > 0) setInvoices(invs);
        if (bls && bls.length > 0) setBills(bls);
        if (accs && accs.length > 0) {
          setAccounts(accs.map((a: any) => ({
            name: a.name, code: a.code, balance: Number(a.balance), type: a.type, change: 0
          })));
        }
        if (jrnls && jrnls.length > 0) setLedger(jrnls);
      } catch (err) {
        console.error("Failed to fetch finance data:", err);
      }
    });
  }, []);

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
  };
  const handleStatusChangeInvoice = (id: string, newStatus: string) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
  };
  const handleSaveInvoice = (data: any) => {
    setInvoices(invoices.map(inv => inv.id === data.id ? data : inv));
    setEditItem(null);
  };

  const handleDeleteBill = (id: string) => {
    setBills(bills.filter(b => b.id !== id));
  };
  const handleStatusChangeBill = (id: string, newStatus: string) => {
    setBills(bills.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };
  const handleSaveBill = (data: any) => {
    setBills(bills.map(b => b.id === data.id ? data : b));
    setEditItem(null);
  };

  const downloadPDF = () => {
    if (invoiceRef.current) {
      const content = invoiceRef.current.innerHTML;
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
          .map(el => el.outerHTML)
          .join('\n');
        
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Invoice ${viewItem?.data?.id || ''}</title>
              ${styleLinks}
              <style>
                body { background: white !important; margin: 0; padding: 40px; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              </style>
            </head>
            <body class="bg-white text-slate-900">
              ${content}
            </body>
          </html>
        `);
        doc.close();

        // Wait for styles to load then print
        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }, 500);
        };
      }
    }
  };

  const handleDownloadReport = (title: string) => {
    const csvContent = "data:text/csv;charset=utf-8,Category,Value\nRevenue,7230000\nExpenses,4890000\nProfit,2340000";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s+/g, '_').toLowerCase()}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (tabParam && ["overview", "gl", "ap", "ar", "budgets", "reports"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    router.push(`/dashboard/finance?tab=${tab}`);
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "gl", label: "General Ledger", icon: FileText },
    { id: "ar", label: "Accounts Receivable", icon: TrendingUp },
    { id: "ap", label: "Accounts Payable", icon: CreditCard },
    { id: "budgets", label: "Budgets", icon: Target },
    { id: "reports", label: "Financial Reports", icon: FileText },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-xl">Finance & Accounting</h1>
          <p className="section-subtitle">Real-time financial insights and management</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            New Transaction
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", value: "$7.23M", change: "+12.4%", up: true, icon: DollarSign, color: "from-indigo-500 to-purple-600" },
          { title: "Net Profit", value: "$1.87M", change: "+18.2%", up: true, icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
          { title: "Accounts Receivable", value: "$980K", change: "-8.1%", up: false, icon: ArrowUpRight, color: "from-blue-500 to-cyan-600" },
          { title: "Accounts Payable", value: "$420K", change: "+5.8%", up: false, icon: AlertCircle, color: "from-amber-500 to-orange-600" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="kpi-card">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{kpi.value}</div>
              <div className="text-sm text-black mt-1">{kpi.title}</div>
              <div className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change} vs last month
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "gradient-brand text-white shadow"
                  : "text-black hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cash Flow */}
            <div className="glass-card p-6">
              <h3 className="section-title text-base mb-1">Cash Flow</h3>
              <p className="section-subtitle text-xs mb-4">6-Month Trend</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={CASHFLOW_DATA}>
                  <defs>
                    <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "12px", fontSize: "12px" }} formatter={(v: any) => [`$${(v / 1000).toFixed(0)}K`]} />
                  <Area type="monotone" dataKey="inflow" name="Inflow" stroke="#22c55e" fill="url(#inflowGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="outflow" name="Outflow" stroke="#ef4444" fill="url(#outflowGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart of Accounts */}
            <div className="glass-card p-6">
              <h3 className="section-title text-base mb-4">Chart of Accounts</h3>
              <div className="space-y-2">
                {accounts.map((acc) => (
                  <div key={acc.code} className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-black w-12">{acc.code}</span>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{acc.name}</div>
                        <div className="text-xs text-black">{acc.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{formatCurrency(acc.balance)}</div>
                      <div className={`text-xs flex items-center gap-0.5 justify-end ${acc.change > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {acc.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(acc.change)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* P&L Summary */}
          <div className="glass-card p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title text-base">Profit & Loss Summary</h3>
              <button className="btn btn-secondary btn-sm">
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>
            <table className="data-table min-w-[600px]">
              <thead>
                <tr>
                  <th>Category</th>
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                    <th key={m} className="text-right">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PL_DATA.map((row, i) => (
                  <tr key={row.category} className={i === PL_DATA.length - 1 ? "font-bold" : ""}>
                    <td className={`font-semibold ${i === PL_DATA.length - 1 ? "text-indigo-400" : ""}`}>{row.category}</td>
                    {["jan", "feb", "mar", "apr", "may", "jun"].map((m) => (
                      <td key={m} className="text-right font-mono text-sm">
                        ${(row as any)[m]}K
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AR Tab */}
      {activeTab === "ar" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title text-base">Customer Invoices</h3>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm"><Filter className="w-4 h-4" /> Filter</button>
              <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> New Invoice</button>
            </div>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th className="text-right">Amount</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="font-mono text-indigo-400 text-sm">{inv.id}</td>
                    <td className="font-medium text-slate-900">{inv.customer}</td>
                    <td className="text-right font-bold text-slate-900">{formatCurrency(inv.amount)}</td>
                    <td className="text-black">{inv.date}</td>
                    <td className="text-black">{inv.due}</td>
                    <td>
                      <span className={`badge ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setViewItem({ type: "invoice", data: inv })} className="btn btn-secondary btn-icon btn-sm" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditItem({ type: "invoice", data: inv })} className="btn btn-secondary btn-icon btn-sm" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteInvoice(inv.id)} className="btn btn-secondary btn-icon btn-sm text-red-500 hover:text-red-700" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <select 
                          value={inv.status} 
                          onChange={(e) => handleStatusChangeInvoice(inv.id, e.target.value)}
                          className="ml-2 form-input py-1 px-2 text-xs h-auto cursor-pointer"
                        >
                          <option value="SENT">SENT</option>
                          <option value="PAID">PAID</option>
                          <option value="PARTIAL">PARTIAL</option>
                          <option value="OVERDUE">OVERDUE</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AP Tab */}
      {activeTab === "ap" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title text-base">Vendor Bills</h3>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm"><Filter className="w-4 h-4" /> Filter</button>
              <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> New Bill</button>
            </div>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Vendor</th>
                  <th className="text-right">Amount</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="font-mono text-amber-400 text-sm">{bill.id}</td>
                    <td className="font-medium text-slate-900">{bill.vendor}</td>
                    <td className="text-right font-bold text-slate-900">{formatCurrency(bill.amount)}</td>
                    <td className="text-black">{bill.date}</td>
                    <td className="text-black">{bill.due}</td>
                    <td>
                      <span className={`badge ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setViewItem({ type: "bill", data: bill })} className="btn btn-secondary btn-icon btn-sm" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditItem({ type: "bill", data: bill })} className="btn btn-secondary btn-icon btn-sm" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteBill(bill.id)} className="btn btn-secondary btn-icon btn-sm text-red-500 hover:text-red-700" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <select 
                          value={bill.status} 
                          onChange={(e) => handleStatusChangeBill(bill.id, e.target.value)}
                          className="ml-2 form-input py-1 px-2 text-xs h-auto cursor-pointer"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="PAID">PAID</option>
                          <option value="OVERDUE">OVERDUE</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GL Tab */}
      {activeTab === "gl" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title text-base">General Ledger</h3>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm"><Filter className="w-4 h-4" /> Filter</button>
              <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Add Journal Entry</button>
            </div>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <input type="text" placeholder="Search accounts, references..." className="form-input pl-10 w-full" />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Journal ID</th>
                  <th>Account</th>
                  <th>Description</th>
                  <th>Reference</th>
                  <th className="text-right">Debit</th>
                  <th className="text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry: any, idx: number) => (
                  <tr key={`${entry.id}-${idx}`}>
                    <td className="text-black">{entry.date}</td>
                    <td className="font-mono text-indigo-400 text-sm">{entry.id}</td>
                    <td className="font-semibold text-slate-900">{entry.account}</td>
                    <td className="text-black">{entry.desc}</td>
                    <td className="font-mono text-xs text-black">{entry.ref}</td>
                    <td className="text-right font-bold text-slate-900">{entry.debit ? formatCurrency(entry.debit) : "-"}</td>
                    <td className="text-right font-bold text-slate-900">{entry.credit ? formatCurrency(entry.credit) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === "budgets" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title text-base">Department Budgets</h3>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm"><Download className="w-4 h-4" /> Export</button>
              <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> New Budget</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {BUDGETS.map((budget) => {
              const percent = Math.min(100, Math.round((budget.spent / budget.allocated) * 100));
              let colorClass = "bg-emerald-500";
              if (percent > 90) colorClass = "bg-red-500";
              else if (percent > 75) colorClass = "bg-amber-500";

              return (
                <div key={budget.department} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900">{budget.department}</h4>
                    <span className={`badge ${budget.status === "ON_TRACK" ? "badge-success" : budget.status === "EXCEEDED" ? "badge-danger" : "badge-warning"}`}>
                      {budget.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="text-xs text-black mb-1">Spent</div>
                      <div className="text-xl font-bold text-slate-900">{formatCurrency(budget.spent)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-black mb-1">Allocated</div>
                      <div className="text-sm font-semibold text-black">{formatCurrency(budget.allocated)}</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1 overflow-hidden">
                    <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="text-right text-xs font-semibold text-black">{percent}% Used</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Profit & Loss", desc: "Income statement for any period", icon: TrendingUp, color: "from-indigo-500 to-purple-600" },
            { title: "Balance Sheet", desc: "Assets, liabilities, and equity", icon: BarChart3, color: "from-emerald-500 to-teal-600" },
            { title: "Cash Flow", desc: "Operating, investing, financing", icon: DollarSign, color: "from-blue-500 to-cyan-600" },
            { title: "Trial Balance", desc: "All account balances summary", icon: FileText, color: "from-amber-500 to-orange-600" },
            { title: "Aging Report", desc: "AR/AP aging by due date", icon: AlertCircle, color: "from-rose-500 to-pink-600" },
            { title: "Budget vs Actual", desc: "Variance analysis by department", icon: BarChart3, color: "from-violet-500 to-purple-600" },
          ].map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.title} className="glass-card p-6 group cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{report.title}</h3>
                <p className="text-sm text-black mb-4">{report.desc}</p>
                <div className="flex gap-2">
                  <button onClick={() => setViewReport(report.title)} className="btn btn-primary btn-sm flex-1">Generate</button>
                  <button onClick={() => handleDownloadReport(report.title)} className="btn btn-secondary btn-sm btn-icon">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={viewItem?.type === "invoice"}
        onClose={() => setViewItem(null)}
        title="Invoice Details"
      >
        {viewItem?.type === "invoice" && (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <button onClick={downloadPDF} className="btn btn-primary btn-sm flex items-center gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
            
            <div ref={invoiceRef} className="bg-white p-8 rounded-lg border border-slate-200 text-slate-800">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-extrabold text-indigo-600 mb-1">INVOICE</h1>
                  <p className="font-mono text-black">{viewItem.data.id}</p>
                </div>
                <div className="text-right">
                  <h2 className="font-bold text-slate-900 text-lg">AMDOX ERP Inc.</h2>
                  <p className="text-sm text-black">123 Tech Avenue, Suite 400</p>
                  <p className="text-sm text-black">San Francisco, CA 94107</p>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b border-slate-100 py-4">
                <div>
                  <p className="text-xs font-bold text-black uppercase tracking-wider mb-1">Bill To</p>
                  <p className="font-bold text-slate-900">{viewItem.data.customer}</p>
                  <p className="text-sm text-black">456 Customer Blvd</p>
                  <p className="text-sm text-black">New York, NY 10001</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-black">Invoice Date:</p>
                    <p className="font-semibold">{viewItem.data.date}</p>
                  </div>
                  <div>
                    <p className="text-black">Due Date:</p>
                    <p className="font-semibold">{viewItem.data.due}</p>
                  </div>
                  <div>
                    <p className="text-black">Status:</p>
                    <span className={`badge ${getStatusColor(viewItem.data.status)}`}>{viewItem.data.status}</span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-left mb-8">
                <thead>
                  <tr className="border-b border-slate-200 text-sm">
                    <th className="py-2 font-semibold text-black">Description</th>
                    <th className="py-2 font-semibold text-black text-right">Qty</th>
                    <th className="py-2 font-semibold text-black text-right">Rate</th>
                    <th className="py-2 font-semibold text-black text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-100">
                    <td className="py-3 text-slate-800">Enterprise Software License</td>
                    <td className="py-3 text-right">1</td>
                    <td className="py-3 text-right">{formatCurrency(viewItem.data.amount * 0.8)}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(viewItem.data.amount * 0.8)}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 text-slate-800">Implementation Services</td>
                    <td className="py-3 text-right">40</td>
                    <td className="py-3 text-right">{formatCurrency((viewItem.data.amount * 0.2) / 40)}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(viewItem.data.amount * 0.2)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-black">
                    <span>Subtotal</span>
                    <span>{formatCurrency(viewItem.data.amount)}</span>
                  </div>
                  <div className="flex justify-between text-black">
                    <span>Tax (0%)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-slate-900 border-t border-slate-200 pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(viewItem.data.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!viewReport}
        onClose={() => setViewReport(null)}
        title={`${viewReport} - Preview`}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => viewReport && handleDownloadReport(viewReport)} className="btn btn-secondary btn-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
          <div className="glass-card p-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Value (USD)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Revenue</td><td className="text-right font-mono">$7,230,000</td></tr>
                <tr><td>Operating Expenses</td><td className="text-right font-mono">$4,890,000</td></tr>
                <tr><td>Net Profit</td><td className="text-right font-mono font-bold text-emerald-600">$2,340,000</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-black text-center">This is a simulated report preview.</p>
        </div>
      </Modal>

      <Modal
        isOpen={viewItem?.type === "bill"}
        onClose={() => setViewItem(null)}
        title="Bill Details"
      >
        {viewItem?.type === "bill" && (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <button onClick={downloadPDF} className="btn btn-primary btn-sm flex items-center gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
            
            <div ref={invoiceRef} className="bg-white p-8 rounded-lg border border-slate-200 text-slate-800">
              {/* Bill Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-extrabold text-amber-600 mb-1">BILL</h1>
                  <p className="font-mono text-black">{viewItem.data.id}</p>
                </div>
                <div className="text-right">
                  <h2 className="font-bold text-slate-900 text-lg">{viewItem.data.vendor}</h2>
                  <p className="text-sm text-black">100 Vendor Street</p>
                  <p className="text-sm text-black">Business City, ST 99999</p>
                </div>
              </div>

              {/* Bill Meta */}
              <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b border-slate-100 py-4">
                <div>
                  <p className="text-xs font-bold text-black uppercase tracking-wider mb-1">Bill To</p>
                  <p className="font-bold text-slate-900">AMDOX ERP Inc.</p>
                  <p className="text-sm text-black">123 Tech Avenue, Suite 400</p>
                  <p className="text-sm text-black">San Francisco, CA 94107</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-black">Bill Date:</p>
                    <p className="font-semibold">{viewItem.data.date}</p>
                  </div>
                  <div>
                    <p className="text-black">Due Date:</p>
                    <p className="font-semibold">{viewItem.data.due}</p>
                  </div>
                  <div>
                    <p className="text-black">Status:</p>
                    <span className={`badge ${getStatusColor(viewItem.data.status)}`}>{viewItem.data.status}</span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-left mb-8">
                <thead>
                  <tr className="border-b border-slate-200 text-sm">
                    <th className="py-2 font-semibold text-black">Description</th>
                    <th className="py-2 font-semibold text-black text-right">Qty</th>
                    <th className="py-2 font-semibold text-black text-right">Rate</th>
                    <th className="py-2 font-semibold text-black text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-100">
                    <td className="py-3 text-slate-800">Products / Services</td>
                    <td className="py-3 text-right">1</td>
                    <td className="py-3 text-right">{formatCurrency(viewItem.data.amount)}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(viewItem.data.amount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-black">
                    <span>Subtotal</span>
                    <span>{formatCurrency(viewItem.data.amount)}</span>
                  </div>
                  <div className="flex justify-between text-black">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-slate-900 border-t border-slate-200 pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(viewItem.data.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title={`Edit ${editItem?.type === "invoice" ? "Invoice" : "Bill"}`}
      >
        {editItem && (
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-semibold text-black mb-1">{editItem.type === "invoice" ? "Customer" : "Vendor"}</label>
                <input 
                  type="text" 
                  className="form-input w-full" 
                  value={editItem.data.customer || editItem.data.vendor || ""} 
                  onChange={(e) => setEditItem({ ...editItem, data: { ...editItem.data, [editItem.type === "invoice" ? "customer" : "vendor"]: e.target.value } })} 
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-black mb-1">Amount</label>
                <input 
                  type="number" 
                  className="form-input w-full" 
                  value={editItem.data.amount} 
                  onChange={(e) => setEditItem({ ...editItem, data: { ...editItem.data, amount: Number(e.target.value) } })} 
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-semibold text-black mb-1">Date</label>
                  <input 
                    type="text" 
                    className="form-input w-full" 
                    value={editItem.data.date} 
                    onChange={(e) => setEditItem({ ...editItem, data: { ...editItem.data, date: e.target.value } })} 
                  />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-black mb-1">Due Date</label>
                  <input 
                    type="text" 
                    className="form-input w-full" 
                    value={editItem.data.due} 
                    onChange={(e) => setEditItem({ ...editItem, data: { ...editItem.data, due: e.target.value } })} 
                  />
               </div>
             </div>
             <div className="flex justify-end mt-6 gap-2">
               <button onClick={() => setEditItem(null)} className="btn btn-secondary">Cancel</button>
               <button onClick={() => editItem.type === "invoice" ? handleSaveInvoice(editItem.data) : handleSaveBill(editItem.data)} className="btn btn-primary">Save Changes</button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
