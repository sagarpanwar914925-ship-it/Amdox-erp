"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  BarChart3, Shield, Zap, Globe, Users, TrendingUp,
  CheckCircle2, ArrowRight, ChevronRight, Star,
  Brain, Layers, Lock, Activity, Database, Cloud
} from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Finance & Accounting",
    desc: "Complete GL, AP/AR, budgeting, multi-currency, and real-time financial reports.",
    color: "from-indigo-500 to-purple-600",
  },
  {
    icon: Users,
    title: "HR & Payroll",
    desc: "End-to-end employee lifecycle, attendance, leave, payroll, and performance tracking.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Layers,
    title: "Supply Chain",
    desc: "Procurement, vendor management, real-time inventory, warehousing, and GRN.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Activity,
    title: "Project Management",
    desc: "Interactive Gantt charts, task dependencies, resource allocation, and budget tracking.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: Brain,
    title: "AI Forecasting",
    desc: "ML-powered demand forecasting, anomaly detection, and intelligent recommendations.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: TrendingUp,
    title: "Business Intelligence",
    desc: "Drag-and-drop dashboards, KPI widgets, and automated PDF/Excel reporting.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "RBAC, MFA, audit trails, GDPR compliance, and SOC 2 controls.",
    color: "from-slate-500 to-gray-600",
  },
  {
    icon: Globe,
    title: "Multi-Tenant SaaS",
    desc: "Full tenant isolation, custom domains, subscription management, and usage analytics.",
    color: "from-sky-500 to-blue-600",
  },
];

const STATS = [
  { label: "Modules", value: "12+" },
  { label: "Database Tables", value: "25+" },
  { label: "API Endpoints", value: "150+" },
  { label: "Test Coverage", value: "90%" },
];

const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "CFO, TechCorp Global",
    text: "AMDOX transformed our financial operations. Real-time insights across 15 subsidiaries in 8 currencies.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "CTO, Nexus Enterprises",
    text: "The AI forecasting alone saved us $2M in inventory costs. Best ERP investment we've made.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "HR Director, Apex Solutions",
    text: "Payroll processing went from 3 days to 2 hours. The employee self-service portal is outstanding.",
    rating: 5,
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* ─── NAVBAR ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass py-3 shadow-lg" : "py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-brand-text">AMDOX</span>
            <span className="text-sm text-slate-400 hidden sm:block">Technologies</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {["Features", "Modules", "Pricing", "Docs"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-secondary btn-sm hidden sm:flex">
              Sign In
            </Link>
            <Link href="/login" className="btn btn-primary btn-sm">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden gradient-mesh">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-indigo-400 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered Enterprise ERP Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in">
            <span className="gradient-brand-text">AMDOX</span>
            <br />
            <span className="text-white">AI Cloud ERP Suite</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 animate-fade-in leading-relaxed">
            The complete enterprise resource planning platform that combines Finance, HR, Supply Chain,
            Projects, and AI into one intelligent, cloud-native system. Built for scale.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link href="/login" className="btn btn-primary btn-lg group">
              Launch ERP Dashboard
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-fade-in">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card p-6 text-center">
                <div className="text-3xl font-extrabold gradient-brand-text mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Every Business Function,
              <br />
              <span className="gradient-brand-text">One Platform</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              12 fully-integrated modules covering every aspect of your enterprise operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="glass-card p-6 group cursor-pointer">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TECH STACK BANNER ─── */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-slate-500 mb-8 uppercase tracking-widest">
            Built with enterprise-grade technologies
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-400">
            {[
              "Next.js 15", "React 19", "TypeScript", "PostgreSQL", "Prisma ORM",
              "Redis", "Docker", "Kubernetes", "GitHub Actions", "OpenTelemetry"
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 glass rounded-full border border-white/5 hover:border-indigo-500/30 hover:text-indigo-400 transition-all"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI SECTION ─── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-purple-400 mb-6">
              <Brain className="w-4 h-4" />
              AI-Powered Intelligence
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Machine Learning at the
              <span className="gradient-brand-text"> Core</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              AMDOX uses advanced ML models to forecast demand, detect anomalies, optimize inventory,
              predict cash flow, and surface insights — automatically.
            </p>
            <div className="space-y-4">
              {[
                { icon: TrendingUp, label: "Demand Forecasting (Prophet / LSTM)" },
                { icon: Activity, label: "Anomaly Detection & Alerts" },
                { icon: Database, label: "Inventory Optimization" },
                { icon: Cloud, label: "Cash Flow Predictions" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-slate-300">AI Demand Forecast</span>
                <span className="badge badge-success">98.2% Accuracy</span>
              </div>
              {[
                { sku: "SKU-001", product: "Laptop Pro X", forecast: 1240, confidence: 94 },
                { sku: "SKU-047", product: "USB-C Hub", forecast: 3850, confidence: 89 },
                { sku: "SKU-112", product: "Monitor 27\"", forecast: 620, confidence: 96 },
                { sku: "SKU-203", product: "Keyboard MX", forecast: 2100, confidence: 91 },
              ].map((item) => (
                <div key={item.sku} className="flex items-center justify-between p-3 glass rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-white">{item.product}</div>
                    <div className="text-xs text-slate-500">{item.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-400">{item.forecast.toLocaleString()} units</div>
                    <div className="text-xs text-slate-500">{item.confidence}% confidence</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Trusted by <span className="gradient-brand-text">Enterprise Teams</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-card p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center glass-card p-16 relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Ready to Transform
              <br />
              <span className="gradient-brand-text">Your Enterprise?</span>
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Start your journey with AMDOX ERP today. Full access, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="btn btn-primary btn-lg">
                Launch Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                View Demo
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500">
              {["No credit card", "14-day trial", "SOC 2 compliant", "99.9% uptime"].map((item) => (
                <div key={item} className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">AMDOX Technologies</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2024 AMDOX Technologies. AI-Powered Cloud ERP Suite.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
