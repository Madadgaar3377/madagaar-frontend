"use client";

import React, { useEffect, useState, Suspense } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { pushWithState } from "../utils/navigationState";
import AuthSplitLayout, {
  AuthFormCard,
  AuthPrimaryButton,
  authLinkClass,
} from "./AuthSplitLayout";

function VerifyEmailInner() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = (searchParams.get("token") || "").trim();

  const [status, setStatus] = useState(token ? "loading" : "missing");
  const [message, setMessage] = useState("");
  const [emailHint, setEmailHint] = useState("");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/verifyEmailToken`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => null);
        if (cancelled) return;

        if (!res.ok || data?.success === false) {
          setStatus("error");
          setMessage(data?.message || "Verification failed");
          if (data?.email) setEmailHint(data.email);
          if (data?.code === "TOKEN_EXPIRED" && data?.email) {
            toast.error("Link expired. Request a new verification email.");
          }
          return;
        }

        setStatus("success");
        setMessage(data?.message || "Account verified successfully");
        toast.success("Email verified! You can sign in now.");
        setTimeout(() => {
          pushWithState(router, "/account", {
            verified: true,
            message: "Account verified. Please sign in.",
          });
        }, 1200);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, apiUrl, router]);

  return (
    <AuthSplitLayout
      tagline="SECURE · VERIFY · CONTINUE"
      title="Confirming your Madadgaar account."
      subtitle="One click from your email unlocks loans, insurance, installments and more."
      footLinks={["Secure link", "No code needed", "Expires in 24h"]}
    >
      <div className="mb-6">
        <h2
          className="text-[1.75rem] font-semibold text-slate-900 tracking-tight"
          style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
        >
          {status === "loading" && "Verifying…"}
          {status === "success" && "You’re verified"}
          {status === "error" && "Link didn’t work"}
          {status === "missing" && "Missing link"}
        </h2>
        <p className="mt-2 text-[14px] text-slate-500 leading-relaxed">
          {status === "loading" && "Please wait while we activate your account."}
          {status === "success" && "Redirecting you to sign in…"}
          {status === "error" && (message || "This verification link is invalid or expired.")}
          {status === "missing" && "Open the Verify Account button from your email to continue."}
        </p>
      </div>

      <AuthFormCard>
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <span className="size-8 border-2 border-[#b7242a] border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-slate-500">Confirming your email…</p>
          </div>
        )}

        {status === "success" && (
          <p className="text-[14px] text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-3">
            {message}
          </p>
        )}

        {(status === "error" || status === "missing") && (
          <div className="space-y-4">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Request a new verification email from the login or signup page, then use the fresh
              link.
            </p>
            <AuthPrimaryButton
              type="button"
              onClick={() =>
                pushWithState(router, "/account/verify-email", {
                  email: emailHint || undefined,
                  message: "Request a new verification link below.",
                })
              }
            >
              Resend verification email
            </AuthPrimaryButton>
            <p className="text-center text-[13px] text-slate-500">
              Already verified?{" "}
              <Link href="/account" className={authLinkClass}>
                Log in
              </Link>
            </p>
          </div>
        )}
      </AuthFormCard>
    </AuthSplitLayout>
  );
}

export default function VerifyEmailByTokenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
          <p className="text-slate-500 text-sm">Loading…</p>
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
