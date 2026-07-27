"use client";

import React, { useState, useEffect } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { getUser } from "../utils/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { consumeNavigationState, pushWithState } from "../utils/navigationState";
import AuthSplitLayout, {
  AuthFormCard,
  authInputClass,
  authLabelClass,
  authPrimaryBtnClass,
} from "./AuthSplitLayout";

export default function LoginPage() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const router = useRouter();
  const [navState] = useState(() => consumeNavigationState() || {});
  const verifiedMessage =
    navState?.message || (navState?.verified ? "Account verified. Please sign in." : null);

  useEffect(() => {
    if (getUser()) {
      const userType = getUser().userType || getUser().UserType;
      if (userType === "user") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      if (userType === "agent" && token) {
        const agentPanelUrl = "https://agent.madadgaar.com.pk";
        const url = `${agentPanelUrl}/login?token=${encodeURIComponent(token)}`;
        toast.success("Redirecting to agent panel...");
        window.location.href = url;
        return;
      }

      if (userType === "partner" && token) {
        const partnerPanelUrl = "https://partner.madadgaar.com.pk";
        const url = `${partnerPanelUrl}?token=${encodeURIComponent(token)}`;
        toast.success("Redirecting to partner dashboard...");
        window.location.href = url;
        return;
      }

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

  return (
    <AuthSplitLayout
      tagline="DISCOVER · COMPARE · GROW"
      title="The platform people use to get financial help."
      subtitle="Sign in to browse loans, insurance, installments and property from trusted Madadgaar partners."
      footLinks={["Secure login", "Verified partners", "OTP protected"]}
    >
      <div className="mb-6">
        <h2
          className="text-[1.75rem] font-semibold text-slate-900 tracking-tight"
          style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
        >
          Welcome back
        </h2>
        <p className="mt-2 text-[14px] text-slate-500 leading-relaxed">
          Enter your email and password to continue to Madadgaar.
        </p>
      </div>

      <AuthFormCard>
        {verifiedMessage && (
          <div className="mb-5 text-[13px] text-emerald-800 bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 rounded-xl">
            {verifiedMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className={authLabelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${authInputClass} ${fieldErrors.email ? "ring-2 ring-red-200" : ""}`}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-[13px] font-medium text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-[12px] font-medium text-slate-500 hover:text-[#b7242a]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${authInputClass} ${fieldErrors.password ? "ring-2 ring-red-200" : ""}`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="mt-1.5 text-[12px] text-red-600">{fieldErrors.password}</p>
            )}
            <div className="mt-2 flex justify-end">
              <Link
                href="/account/forgot"
                className="text-[12px] text-slate-500 hover:text-[#b7242a]"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading} className={authPrimaryBtnClass}>
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-slate-500">
          No account yet?{" "}
          <Link href="/account/register" className="font-semibold text-[#b7242a] hover:underline">
            Sign up free
          </Link>
        </p>
      </AuthFormCard>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-[#f7f8fa] px-3 text-slate-400 font-medium">Or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          window.location.href = `${apiUrl.replace(/\/api$/, "")}/auth/google`;
        }}
        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-[14px] font-medium hover:bg-slate-50 transition-colors shadow-sm"
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
        Continue with Google
      </button>

      <p className="mt-8 text-center text-[11px] text-slate-400 leading-relaxed">
        By continuing you agree to Madadgaar{" "}
        <Link href="/terms-and-conditions" className="underline hover:text-slate-600">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="underline hover:text-slate-600">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthSplitLayout>
  );
}
