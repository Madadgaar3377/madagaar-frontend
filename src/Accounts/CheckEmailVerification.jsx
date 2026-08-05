"use client";

import React, { useState, useEffect, Suspense } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { consumeNavigationState, pushWithState } from "../utils/navigationState";
import AuthSplitLayout, {
  AuthFormCard,
  AuthPrimaryButton,
  authInputClass,
  authLabelClass,
  authLinkClass,
} from "./AuthSplitLayout";

/** Web-only: wait for magic-link email (no OTP entry). */
function CheckEmailInner() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [navState] = useState(() => consumeNavigationState() || {});

  const urlEmail = (searchParams.get("email") || "").trim().toLowerCase();
  const prefilledEmail = navState?.email || urlEmail || "";
  const fromUnverified = navState?.fromUnverified === true;
  const verifyMessage =
    navState?.message ||
    "We've sent a verification link to your email. Open it to activate your account.";

  const [email, setEmail] = useState(prefilledEmail);
  const [emailForResend, setEmailForResend] = useState(prefilledEmail);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const effectiveEmail = (email || emailForResend || "").trim().toLowerCase();

  useEffect(() => {
    if (!email && urlEmail) setEmail(urlEmail);
  }, [urlEmail, email]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResend = async (e) => {
    e?.preventDefault?.();
    const toUse = effectiveEmail || emailForResend.trim().toLowerCase();
    if (!toUse) {
      toast.error("Email is required");
      return;
    }
    if (resendLoading || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      const res = await fetch(`${apiUrl}/reSendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: toUse, platform: "web" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        toast.error(data?.message || "Failed to send verification email");
      } else {
        setEmail(toUse);
        toast.success(data?.message || "Verification link sent. Check your inbox.");
        setResendCooldown(60);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error  please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      tagline="SECURE · VERIFY · CONTINUE"
      title="Check your inbox to activate."
      subtitle="We emailed you a secure Verify Account link. Open it on this device or any browser — no code to type."
      footLinks={["Secure link", "No OTP", "Expires in 24h"]}
    >
      <div className="mb-6">
        <h2
          className="text-[1.75rem] font-semibold text-slate-900 tracking-tight"
          style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
        >
          Verify your email
        </h2>
        <p className="mt-2 text-[14px] text-slate-500 leading-relaxed">
          Click <strong>Verify Account</strong> in the email — your account confirms automatically.
        </p>
      </div>

      <AuthFormCard>
        {(fromUnverified || navState?.message || effectiveEmail) && (
          <div className="mb-5 text-[13px] text-amber-900 bg-amber-50 border border-amber-100 px-3.5 py-2.5 rounded-xl leading-relaxed">
            {verifyMessage}
          </div>
        )}

        <form onSubmit={handleResend} className="space-y-4">
          <div>
            <label className={authLabelClass}>Email</label>
            <input
              type="email"
              value={effectiveEmail || emailForResend}
              onChange={(e) => {
                setEmailForResend(e.target.value);
                setEmail(e.target.value);
              }}
              placeholder="you@example.com"
              className={authInputClass}
              required
              autoComplete="email"
            />
          </div>

          <AuthPrimaryButton disabled={resendLoading || resendCooldown > 0}>
            {resendLoading
              ? "Sending…"
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend verification email"}
          </AuthPrimaryButton>
        </form>

        <p className="mt-5 text-center text-[13px] text-slate-500">
          Already verified?{" "}
          <Link href="/account" className={authLinkClass}>
            Log in
          </Link>
        </p>
        <p className="mt-3 text-center text-[12px] text-slate-400">
          Wrong email?{" "}
          <button
            type="button"
            className={authLinkClass}
            onClick={() =>
              pushWithState(router, "/account/register", {
                previousFormData: { email: effectiveEmail },
                currentUnverifiedEmail: effectiveEmail,
              })
            }
          >
            Update &amp; resend
          </button>
        </p>
      </AuthFormCard>
    </AuthSplitLayout>
  );
}

export default function CheckEmailVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
          <p className="text-slate-500 text-sm">Loading…</p>
        </div>
      }
    >
      <CheckEmailInner />
    </Suspense>
  );
}
