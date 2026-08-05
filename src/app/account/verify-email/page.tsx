"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** /account/verify-email → OTP page (web uses OTP like the app). */
function RedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.toString();
    router.replace(q ? `/account/verify-otp?${q}` : "/account/verify-otp");
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <p className="text-slate-500 text-sm">Redirecting…</p>
    </div>
  );
}

export default function VerifyEmailToOtpRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
          <p className="text-slate-500 text-sm">Redirecting…</p>
        </div>
      }
    >
      <RedirectInner />
    </Suspense>
  );
}
