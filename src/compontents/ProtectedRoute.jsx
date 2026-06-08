"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../utils/auth";

/**
 * Usage:
 * <ProtectedRoute><Dashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(() =>
    typeof window !== "undefined" ? isAuthenticated() : false
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setAllowed(true);
    }
  }, [router]);

  if (!allowed) {
    return null;
  }

  return children;
}
