// src/components/layout/topbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Bell, Sun, Moon, ChevronRight, LogOut, Search, Menu } from "lucide-react";
import type { Session } from "next-auth";

interface TopBarProps {
  collapsed: boolean;
  user?: Session["user"];
  setMobileMenuOpen?: (v: boolean) => void;
}

export function TopBar({ collapsed, user, setMobileMenuOpen }: TopBarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setProfileName(user?.name || "User");
    const loadProfile = () => {
      const savedName = localStorage.getItem("erp_profile_name");
      const savedImage = localStorage.getItem("erp_profile_image");
      if (savedName) setProfileName(savedName);
      if (savedImage) setProfileImage(savedImage);
    };
    
    loadProfile();
    window.addEventListener("profileUpdate", loadProfile);
    return () => window.removeEventListener("profileUpdate", loadProfile);
  }, [user?.name]);

  const getTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "Dashboard";
    return parts[parts.length - 1]
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getInitials = () => {
    if (!profileName) return "U";
    return profileName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          onClick={() => setMobileMenuOpen?.(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {getTitle()}
        </h2>
        <div className="hidden md:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span>AMDOX ERP</span>
          {pathname
            .split("/")
            .slice(1)
            .map((part, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3" />
                <span className={i === arr.length - 1 ? "text-slate-700 dark:text-slate-300" : ""}>
                  {part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ")}
                </span>
              </span>
            ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-500 dark:text-slate-400 w-56 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent">
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <span className="ml-auto text-xs">⌘K</span>
        </div>

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Link>

        {/* Dark mode */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {mounted && theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {profileName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {(user as any)?.role || "Employee"}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer overflow-hidden">
            {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : getInitials()}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
