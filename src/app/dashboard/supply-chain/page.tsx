"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Package, ShoppingCart, Building2, Warehouse, Brain,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Plus,
  Search, Filter, Download, Eye, TrendingUp, BarChart3,
  RefreshCw, CheckCircle2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

const INITIAL_INVENTORY_ITEMS = [
  { sku: "SKU-001", name: "Laptop Pro X", category: "Electronics", warehouse: "WH-001", qty: 245, reserved: 40, reorder: 50, value: 245000, status: "IN_STOCK" },
  { sku: "SKU-047", name: "USB-C Hub 7-Port", category: "Accessories", warehouse: "WH-001", qty: 12, reserved: 8, reorder: 100, value: 2400, status: "LOW_STOCK" },
  { sku: "SKU-112", name: "27\" 4K Monitor", category: "Electronics", warehouse: "WH-002", qty: 89, reserved: 20, reorder: 30, value: 89000, status: "IN_STOCK" },
  { sku: "SKU-203", name: "Mechanical Keyboard MX", category: "Accessories", warehouse: "WH-001", qty: 0, reserved: 0, reorder: 50, value: 0, status: "OUT_OF_STOCK" },
  { sku: "SKU-318", name: "Webcam HD 1080p", category: "Electronics", warehouse: "WH-003", qty: 156, reserved: 30, reorder: 40, value: 31200, status: "IN_STOCK" },
  { sku: "SKU-422", name: "Office Chair Ergonomic", category: "Furniture", warehouse: "WH-002", qty: 34, reserved: 10, reorder: 20, value: 51000, status: "IN_STOCK" },
];

const INITIAL_PURCHASE_ORDERS = [
  { id: "PO-2024-445", vendor: "TechSupply Corp", items: 8, total: 34200, date: "Dec 01", expected: "Dec 15", status: "SENT" },
  { id: "PO-2024-444", vendor: "Office Solutions Inc", items: 12, total: 18600, date: "Nov 28", expected: "Dec 10", status: "PARTIAL" },
  { id: "PO-2024-443", vendor: "Electronics Hub", items: 5, total: 125000, date: "Nov 25", expected: "Dec 08", status: "RECEIVED" },
  { id: "PO-2024-442", vendor: "Furniture World", items: 20, total: 48000, date: "Nov 20", expected: "Dec 05", status: "RECEIVED" },
  { id: "PO-2024-441", vendor: "Global Accessories", items: 3, total: 8400, date: "Dec 03", expected: "Dec 20", status: "DRAFT" },
];

const INITIAL_VENDORS = [
  { name: "TechSupply Corp", code: "VND-001", category: "Electronics", country: "USA", rating: 4.8, orders: 42, value: 890000, status: "ACTIVE" },
  { name: "Office Solutions Inc", code: "VND-002", category: "Office", country: "UK", rating: 4.2, orders: 28, value: 420000, status: "ACTIVE" },
  { name: "Electronics Hub", code: "VND-003", category: "Electronics", country: "Singapore", rating: 4.5, orders: 35, value: 640000, status: "ACTIVE" },
  { name: "Furniture World", code: "VND-004", category: "Furniture", country: "Germany", rating: 3.8, orders: 15, value: 280000, status: "ACTIVE" },
  { name: "Global Accessories", code: "VND-005", category: "Accessories", country: "China", rating: 4.1, orders: 22, value: 180000, status: "ACTIVE" },
];

const FORECAST_DATA = [
  { week: "W1", actual: 420, forecast: 410, lower: 380, upper: 440 },
  { week: "W2", actual: 465, forecast: 455, lower: 425, upper: 485 },
  { week: "W3", actual: 490, forecast: 480, lower: 450, upper: 510 },
  { week: "W4", actual: 510, forecast: 520, lower: 490, upper: 550 },
  { week: "W5", actual: null, forecast: 545, lower: 510, upper: 580 },
  { week: "W6", actual: null, forecast: 560, lower: 525, upper: 595 },
  { week: "W7", actual: null, forecast: 580, lower: 540, upper: 620 },
  { week: "W8", actual: null, forecast: 610, lower: 570, upper: 650 },
];

const SC_KPIs = [
  { title: "Inventory Value", value: "$4.2M", change: "+8.4%", up: true, icon: Package, color: "from-indigo-500 to-purple-600" },
  { title: "Open POs", value: "84", change: "-5.8%", up: true, icon: ShoppingCart, color: "from-emerald-500 to-teal-600" },
  { title: "Active Vendors", value: "127", change: "+12%", up: true, icon: Building2, color: "from-blue-500 to-cyan-600" },
  { title: "Low Stock Items", value: "18", change: "+3", up: false, icon: AlertTriangle, color: "from-amber-500 to-orange-600" },
];

const STOCK_STATUS = {
  in_stock: { label: "In Stock", color: "badge-success" },
  low_stock: { label: "Low Stock", color: "badge-warning" },
  out_of_stock: { label: "Out of Stock", color: "badge-danger" },
};

export default function SupplyChainPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as any;
  const [activeTab, setActiveTab] = useState<"inventory" | "procurement" | "vendors" | "forecasting">(tabParam || "inventory");
  const [viewItem, setViewItem] = useState<{ type: "inventory" | "procurement" | "vendor"; data: any } | null>(null);

  const [inventory, setInventory] = useState(INITIAL_INVENTORY_ITEMS);
  const [orders, setOrders] = useState(INITIAL_PURCHASE_ORDERS);
  const [vendors, setVendors] = useState(INITIAL_VENDORS);

  useEffect(() => {
    if (tabParam && ["inventory", "procurement", "vendors", "forecasting"].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    import("@/app/actions/supply").then(async (actions) => {
      try {
        const [invs, vndrs, pos] = await Promise.all([
          actions.getInventory(),
          actions.getVendors(),
          actions.getPurchaseOrders()
        ]);
        if (invs && invs.length > 0) setInventory(invs);
        if (vndrs && vndrs.length > 0) setVendors(vndrs);
        if (pos && pos.length > 0) setOrders(pos);
      } catch (err) {
        console.error("Failed to fetch supply chain data:", err);
      }
    });
  }, [tabParam]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    router.push(`/dashboard/supply-chain?tab=${tab}`);
  };

  const TABS = [
    { id: "inventory", label: "Inventory" },
    { id: "procurement", label: "Procurement" },
    { id: "vendors", label: "Vendors" },
    { id: "forecasting", label: "AI Forecasting" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-xl">Supply Chain Management</h1>
          <p className="section-subtitle">Inventory, procurement, vendors, and AI forecasting</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm"><Download className="w-4 h-4" /> Export</button>
          <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> New PO</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SC_KPIs.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="kpi-card">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{kpi.value}</div>
              <div className="text-sm text-black mt-1">{kpi.title}</div>
              <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
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
              activeTab === tab.id ? "gradient-brand text-white shadow" : "text-black hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
              <input className="form-input pl-10" placeholder="Search products by SKU or name..." />
            </div>
            <button className="btn btn-secondary btn-sm"><Filter className="w-4 h-4" /> Filter</button>
            <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Add Product</button>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Warehouse</th>
                  <th className="text-right">Quantity</th>
                  <th className="text-right">Reserved</th>
                  <th className="text-right">Available</th>
                  <th className="text-right">Value</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const statusKey = item.status.toLowerCase();
                  const statusInfo = STOCK_STATUS[statusKey as keyof typeof STOCK_STATUS];
                  return (
                    <tr key={item.sku}>
                      <td className="font-mono text-indigo-400 text-sm">{item.sku}</td>
                      <td className="font-semibold text-slate-900">{item.name}</td>
                      <td className="text-black text-sm">{item.category}</td>
                      <td className="font-mono text-black text-sm">{item.warehouse}</td>
                      <td className="text-right font-bold text-slate-900">{item.qty}</td>
                      <td className="text-right text-amber-400">{item.reserved}</td>
                      <td className="text-right text-emerald-400 font-semibold">{item.qty - item.reserved}</td>
                      <td className="text-right font-mono text-sm">{formatCurrency(item.value)}</td>
                      <td>
                        <span className={`badge ${statusInfo?.color || "badge-neutral"}`}>
                          {statusInfo?.label || item.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => setViewItem({ type: "inventory", data: item })} className="btn btn-secondary btn-icon btn-sm"><Eye className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Procurement Tab */}
      {activeTab === "procurement" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="section-title text-base">Purchase Orders</h3>
            <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Create PO</button>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Vendor</th>
                  <th className="text-right">Items</th>
                  <th className="text-right">Total</th>
                  <th>Date</th>
                  <th>Expected</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((po) => (
                  <tr key={po.id}>
                    <td className="font-mono text-amber-400 text-sm">{po.id}</td>
                    <td className="font-semibold text-slate-900">{po.vendor}</td>
                    <td className="text-right">{po.items}</td>
                    <td className="text-right font-bold text-slate-900">{formatCurrency(po.total)}</td>
                    <td className="text-black">{po.date}</td>
                    <td className="text-black">{po.expected}</td>
                    <td><span className={`badge ${getStatusColor(po.status)}`}>{po.status}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setViewItem({ type: "procurement", data: po })} className="btn btn-secondary btn-icon btn-sm"><Eye className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === "vendors" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="section-title text-base">Vendor Registry</h3>
            <button className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Add Vendor</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <div key={vendor.code} className="glass-card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-bold text-slate-900">{vendor.name}</div>
                    <div className="text-xs text-black mt-0.5">{vendor.code} · {vendor.country}</div>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${i < Math.floor(vendor.rating) ? "text-amber-400" : "text-black"}`}
                    >★</span>
                  ))}
                  <span className="text-sm text-slate-900 font-bold ml-1">{vendor.rating}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black">Category</span>
                    <span className="text-slate-300">{vendor.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Total Orders</span>
                    <span className="text-slate-900 font-semibold">{vendor.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Total Value</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(vendor.value)}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setViewItem({ type: "vendor", data: vendor })} className="btn btn-secondary btn-sm flex-1"><Eye className="w-4 h-4" /> View</button>
                  <button className="btn btn-primary btn-sm flex-1">New PO</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Forecasting Tab */}
      {activeTab === "forecasting" && (
        <div className="space-y-4">
          <div className="glass-card p-6 gradient-mesh relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-purple-500/10 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">AI Demand Forecasting</h3>
                  <p className="text-sm text-black">Prophet model · Last trained: Dec 5, 2024 · MAPE: 4.2%</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="btn btn-secondary btn-sm"><RefreshCw className="w-4 h-4" /> Retrain</button>
                  <span className="badge badge-success">98.2% Accuracy</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="section-title text-base mb-1">SKU-001 Laptop Pro X — 8-Week Demand Forecast</h3>
            <p className="section-subtitle text-xs mb-4">95% confidence interval shown</p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={FORECAST_DATA}>
                <defs>
                  <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "12px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="upper" fill="url(#ciGrad)" stroke="none" name="Upper Bound" />
                <Area type="monotone" dataKey="lower" fill="white" fillOpacity={0} stroke="none" name="Lower Bound" />
                <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} name="Actual" connectNulls={false} />
                <Line type="monotone" dataKey="forecast" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { sku: "SKU-001", name: "Laptop Pro X", forecast: 1240, trend: "up", conf: 94, mape: 3.8 },
              { sku: "SKU-047", name: "USB-C Hub", forecast: 3850, trend: "up", conf: 89, mape: 5.2 },
              { sku: "SKU-112", name: "27\" Monitor", forecast: 620, trend: "stable", conf: 96, mape: 4.1 },
              { sku: "SKU-203", name: "Keyboard MX", forecast: 2100, trend: "down", conf: 91, mape: 6.3 },
              { sku: "SKU-318", name: "Webcam HD", forecast: 890, trend: "up", conf: 93, mape: 4.8 },
              { sku: "SKU-422", name: "Office Chair", forecast: 145, trend: "stable", conf: 88, mape: 7.1 },
            ].map((item) => (
              <div key={item.sku} className="glass-card p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-xs text-black">{item.sku}</div>
                  </div>
                  <span className={`badge ${item.trend === "up" ? "badge-success" : item.trend === "down" ? "badge-danger" : "badge-neutral"}`}>
                    {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : "→"} {item.trend}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-indigo-400">{item.forecast.toLocaleString()}</div>
                <div className="text-xs text-black mb-3">units / next 8 weeks</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-black">Confidence</span>
                    <span className="text-slate-900 font-semibold">{item.conf}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">MAPE</span>
                    <span className="text-slate-900 font-semibold">{item.mape}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={viewItem?.type === "inventory"}
        onClose={() => setViewItem(null)}
        title="Product Details"
      >
        {viewItem?.type === "inventory" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                <Package className="w-8 h-8 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewItem.data.name}</h3>
                <p className="text-black font-mono text-sm">{viewItem.data.sku}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Category</p>
                <p className="font-semibold">{viewItem.data.category}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Warehouse</p>
                <p className="font-semibold">{viewItem.data.warehouse}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Quantity</p>
                <p className="font-semibold">{viewItem.data.qty}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Value</p>
                <p className="font-semibold">{formatCurrency(viewItem.data.value)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Reserved</p>
                <p className="font-semibold text-amber-600">{viewItem.data.reserved}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Reorder Point</p>
                <p className="font-semibold">{viewItem.data.reorder}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={viewItem?.type === "procurement"}
        onClose={() => setViewItem(null)}
        title="Purchase Order Details"
      >
        {viewItem?.type === "procurement" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-mono text-slate-900">{viewItem.data.id}</h3>
              <span className={`badge ${getStatusColor(viewItem.data.status)}`}>{viewItem.data.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Vendor</p>
                <p className="font-semibold">{viewItem.data.vendor}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Total Amount</p>
                <p className="font-semibold">{formatCurrency(viewItem.data.total)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Order Date</p>
                <p className="font-semibold">{viewItem.data.date}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Expected Delivery</p>
                <p className="font-semibold">{viewItem.data.expected}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Items Count</p>
                <p className="font-semibold">{viewItem.data.items}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={viewItem?.type === "vendor"}
        onClose={() => setViewItem(null)}
        title="Vendor Details"
      >
        {viewItem?.type === "vendor" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewItem.data.name}</h3>
                <p className="text-black font-mono text-sm">{viewItem.data.code}</p>
              </div>
              <span className="badge badge-success">{viewItem.data.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Category</p>
                <p className="font-semibold">{viewItem.data.category}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Country</p>
                <p className="font-semibold">{viewItem.data.country}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Rating</p>
                <p className="font-semibold">★ {viewItem.data.rating}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Total Orders</p>
                <p className="font-semibold">{viewItem.data.orders}</p>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-black mb-1">Total Value</p>
                <p className="font-semibold text-lg text-emerald-600">{formatCurrency(viewItem.data.value)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
