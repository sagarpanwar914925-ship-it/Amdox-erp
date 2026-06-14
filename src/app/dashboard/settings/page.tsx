"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Settings, Shield, Bell, User, Building, Lock, Globe, Database, ArrowLeft, Upload, Camera } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "EMPLOYEE";
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // Profile States
  const [profileName, setProfileName] = useState(session?.user?.name || "");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const savedName = localStorage.getItem("erp_profile_name");
    const savedImage = localStorage.getItem("erp_profile_image");
    if (savedName) setProfileName(savedName);
    if (savedImage) setProfileImage(savedImage);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    if (activeModule === "Profile") {
      localStorage.setItem("erp_profile_name", profileName);
      if (profileImage) {
        localStorage.setItem("erp_profile_image", profileImage);
      }
      // Force a reload or dispatch event so sidebar updates
      window.dispatchEvent(new Event("profileUpdate"));
      alert("Profile updated successfully!");
    } else {
      alert("Settings saved!");
    }
  };

  const SETTING_MODULES = [
    { title: "Profile", icon: User, desc: "Manage your personal information and preferences", roles: "ALL" },
    { title: "Security", icon: Lock, desc: "Password, 2FA, and access control", roles: "ALL" },
    { title: "Notifications", icon: Bell, desc: "Email and push notification preferences", roles: "ALL" },
    { title: "Company", icon: Building, desc: "Organization details, branding, and billing", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
    { title: "Roles & Permissions", icon: Shield, desc: "Manage user roles and access rights", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
    { title: "Integrations", icon: Globe, desc: "Connected apps and API keys", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
    { title: "Data Management", icon: Database, desc: "Backups, exports, and data retention", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
  ];

  const filteredModules = SETTING_MODULES.filter(mod => {
    if (mod.roles === "ALL") return true;
    return mod.roles.includes(userRole);
  });

  if (activeModule) {
    const activeModDetails = filteredModules.find(m => m.title === activeModule);
    const Icon = activeModDetails?.icon || Settings;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button 
              onClick={() => setActiveModule(null)} 
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold mb-2 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Settings
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="section-title text-xl m-0">{activeModule}</h1>
            </div>
          </div>
          <button onClick={handleSaveSettings} className="btn btn-primary btn-sm">Save Changes</button>
        </div>

        <div className="glass-card p-6 min-h-[400px]">
          {activeModule === "Profile" ? (
            <div className="max-w-2xl space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex items-center gap-6">
                <div 
                  className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Profile Picture</h4>
                  <p className="text-xs text-slate-500 mb-3">Upload a high-res image (max 5MB).</p>
                  <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary btn-sm">
                    <Upload className="w-4 h-4" /> Choose File
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input w-full" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                  <input type="email" className="form-input w-full" defaultValue={session?.user?.email || ""} disabled className="form-input w-full bg-slate-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                  <input type="text" className="form-input w-full bg-slate-50 cursor-not-allowed" disabled value={userRole.replace("_", " ")} />
                </div>
              </div>
            </div>
          ) : activeModule === "Security" ? (
            <div className="max-w-2xl space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
                <input type="password" className="form-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                <input type="password" className="form-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input type="password" className="form-input w-full" />
              </div>
            </div>
          ) : activeModule === "Notifications" ? (
             <div className="max-w-2xl space-y-4">
              <h4 className="font-semibold text-slate-900 mb-2">Notification Preferences</h4>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 w-4 h-4" />
                <span className="text-sm font-medium text-slate-700">Email Notifications for tasks and mentions</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 w-4 h-4" />
                <span className="text-sm font-medium text-slate-700">Push Notifications for important alerts</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" className="rounded text-indigo-600 w-4 h-4" />
                <span className="text-sm font-medium text-slate-700">Weekly Summary Emails</span>
              </label>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
              <Icon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">{activeModule} Configuration</h3>
              <p>This module interface is under construction.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-xl">System Settings</h1>
          <p className="section-subtitle">Manage your account and organization preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div 
              key={mod.title} 
              onClick={() => setActiveModule(mod.title)}
              className="glass-card p-6 flex flex-col items-center text-center cursor-pointer hover:border-indigo-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{mod.title}</h3>
              <p className="text-sm text-slate-600">{mod.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
