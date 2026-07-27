"use client";

import React, { useState } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { pushWithState } from "../utils/navigationState";
import AuthSplitLayout, {
  AuthFormCard,
  authInputClass,
  authLabelClass,
  authPrimaryBtnClass,
} from "./AuthSplitLayout";

const API = (backendBaseUrl || "").replace(/\/$/, "");

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function validateEmail(e) {
    return /\S+@\S+\.\S+/.test(e);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/forgetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok || (body && body.success === false)) {
        toast.error(body?.message || "Failed to send reset OTP.");
      } else {
        toast.success(body?.message || "OTP sent to your email. Check your inbox.");
        setTimeout(() => {
          pushWithState(router, "/account/reset", { email: email.trim() });
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      tagline="SECURE · RESET · CONTINUE"
      title="Forgot your password? We’ve got you."
      subtitle="Enter your email and we’ll send a one-time code to reset your Madadgaar password."
      footLinks={["Secure OTP", "Fast recovery", "Account safety"]}
    >
      <div className="mb-6">
        <h2
          className="text-[1.75rem] font-semibold text-slate-900 tracking-tight"
          style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
        >
          Forgot password
        </h2>
        <p className="mt-2 text-[14px] text-slate-500 leading-relaxed">
          Enter the email tied to your account. We’ll send a reset OTP.
        </p>
      </div>

      <AuthFormCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={authLabelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={authInputClass}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" disabled={loading} className={authPrimaryBtnClass}>
            {loading ? "Sending…" : "Send OTP"}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-slate-500">
          Remembered it?{" "}
          <Link href="/account" className="font-semibold text-[#b7242a] hover:underline">
            Back to login
          </Link>
        </p>
      </AuthFormCard>

      <p className="mt-8 text-center text-[11px] text-slate-400 leading-relaxed">
        If you don’t get an email in a few minutes, check spam or try again.
      </p>
    </AuthSplitLayout>
  );
}
