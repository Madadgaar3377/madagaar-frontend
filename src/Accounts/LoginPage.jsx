"use client";

import React, { useState, useEffect } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { getUser } from "../utils/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { consumeNavigationState, pushWithState } from "../utils/navigationState";
import AuthSplitLayout from "./AuthSplitLayout";

export default function LoginPage() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const router = useRouter();
  const [navState] = useState(() => consumeNavigationState() || {});
  const verifiedMessage =
    navState?.message || (navState?.verified ? "Account verified. Please sign in." : null);

  useEffect(() => {
    // Check if user is already logged in
    if (getUser()) {
      const userType = getUser().userType || getUser().UserType;
      if (userType === "user") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/"; // Admin/other types can use same dashboard for now
      }
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const fetchClientIp = async () => {
    try {
      const r = await fetch("https://api.ipify.org?format=json", {
        signal: AbortSignal.timeout(3000),
      });
      const d = await r.json();
      return d?.ip || null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      const clientIp = await fetchClientIp();
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          loginSource: "madadgaar",
          ...(clientIp && { clientIp }),
        }),
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        if (data?.code === "EMAIL_NOT_VERIFIED" && data?.email) {
          const message =
            data?.message ||
            "Please verify your email before logging in. We've sent you a verification code.";
          toast(message, { icon: "📧", duration: 5000 });
          pushWithState(router, "/account/verify-otp", {
            email: data.email,
            fromUnverified: true,
            message,
          });
          setLoading(false);
          return;
        }
        toast.error(data?.message || `Login failed (${res.status})`);
        setLoading(false);
        return;
      }

      const token = data?.token;
      const userType = (data?.user?.UserType || data?.user?.userType || "user").toLowerCase();

      // If agent, redirect to agent panel with token for auto-login
      if (userType === "agent" && token) {
        const agentPanelUrl = "https://agent.madadgaar.com.pk";
        const url = `${agentPanelUrl}/login?token=${encodeURIComponent(token)}`;
        toast.success("Redirecting to agent panel...");
        window.location.href = url;
        return;
      }

      // If partner, redirect to partner panel with token for auto-login
      if (userType === "partner" && token) {
        const partnerPanelUrl = "https://partner.madadgaar.com.pk";
        const url = `${partnerPanelUrl}?token=${encodeURIComponent(token)}`;
        toast.success("Redirecting to partner dashboard...");
        window.location.href = url;
        return;
      }

      // Store token and user for non-partner
      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("access_token", token);
      }
      if (data?.user) {
        const safeUser = { ...data.user };
        delete safeUser.password;
        delete safeUser.verificationOtp;
        delete safeUser.passwordResetOtp;
        delete safeUser.verificationOtpExpiryTime;
        delete safeUser.passwordResetOtpExpiryTime;
        localStorage.setItem("user", JSON.stringify(safeUser));
      }

      toast.success("Signed in successfully");
      window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Network error  please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]/25 focus:border-[rgb(183,36,42)] transition-all";

  return (
    <AuthSplitLayout
      eyebrow="Welcome back"
      title="Sign in to Madadgaar"
      subtitle="Access loans, insurance, installments and property — all from one account."
    >
      <div className="mb-6">
        <h2
          className="text-2xl font-extrabold text-stone-900 tracking-tight"
          style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
        >
          Sign in
        </h2>
        <p className="mt-1.5 text-sm text-stone-500">Enter your credentials to continue</p>
      </div>

      {verifiedMessage && (
        <div className="mb-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl">
          {verifiedMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-stone-600 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputBase} ${
                fieldErrors.email ? "border-red-300" : "border-stone-200"
              }`}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-stone-600 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputBase} ${
                fieldErrors.password ? "border-red-300" : "border-stone-200"
              }`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 rounded border-stone-300 text-[rgb(183,36,42)] focus:ring-[rgb(183,36,42)]" />
            <span className="text-stone-600 text-xs sm:text-sm">Remember me</span>
          </label>

          <Link
            href="/account/forgot"
            className="text-xs sm:text-sm font-semibold text-[rgb(183,36,42)] hover:underline"
          >
            Forgot?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[rgb(183,36,42)] text-white text-sm font-bold shadow-lg shadow-red-900/15 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
          <span className="bg-[#faf8f6] px-3 text-stone-400 font-semibold">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          window.location.href = `${apiUrl.replace(/\/api$/, "")}/auth/google`;
        }}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-stone-200 rounded-xl bg-white text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-all"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </button>

      <p className="mt-5 text-center text-sm text-stone-500">
        Don&apos;t have an account?{" "}
        <Link href="/account/register" className="text-[rgb(183,36,42)] font-bold hover:underline">
          Sign up
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
