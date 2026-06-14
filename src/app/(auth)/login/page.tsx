// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { Loader2, AlertCircle, Eye, EyeOff, Hexagon, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "admin@amdox.local",
    password: "Demo@123",
  });

  const errorParam = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!formData.email) {
        setError("Email is required");
        setIsLoading(false);
        return;
      }

      if (!formData.password) {
        setError("Password is required");
        setIsLoading(false);
        return;
      }

      // Attempt sign in
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        if (result.error === "MFA_REQUIRED") {
          // Store email for MFA verification
          sessionStorage.setItem("mfa_email", formData.email);
          router.push("/mfa-verify");
        } else {
          setError(result.error || "Invalid credentials");
        }
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Redirect to callback URL or dashboard
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-100/40 blur-3xl" />
      </div>
      
      <div className="w-full max-w-md z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Hexagon className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AMDOX ERP</h1>
          <p className="text-slate-500 mt-2 font-medium">
            AI-Powered Cloud ERP Suite
          </p>
        </div>

        {/* Login Card */}
        <Card className="border border-white/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center font-medium">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error Alert */}
            {(error || errorParam) && (
              <Alert variant="destructive" className="mb-6 bg-red-50 text-red-600 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {error || "An error occurred. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            {/* Demo Credentials Alert */}
            <Alert className="mb-6 bg-indigo-50 border-indigo-100 shadow-sm">
              <Icons.lightbulb className="h-4 w-4 text-indigo-600" />
              <AlertDescription className="text-indigo-900 text-sm font-medium">
                Demo: admin@amdox.local / Demo@123
              </AlertDescription>
            </Alert>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@amdox.local"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    className="h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20 transition-all duration-200"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                <span className="bg-white px-3 text-slate-400 rounded-full">
                  or
                </span>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <Button
                variant="outline"
                disabled={true}
                className="w-full h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
              >
                <Icons.google className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>

              <Button
                variant="outline"
                disabled={true}
                className="w-full h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
              >
                <Icons.microsoft className="mr-2 h-4 w-4" />
                Continue with Microsoft
              </Button>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 mt-8 font-medium">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
              >
                Sign up
              </Link>
            </p>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-slate-400 font-medium">
              <Lock size={12} />
              <span>Your data is encrypted and secure</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="flex justify-center gap-5 mt-8 text-xs text-slate-500 font-semibold">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/docs" className="hover:text-indigo-600 transition-colors">
            Documentation
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/support" className="hover:text-indigo-600 transition-colors">
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}
