"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "./utils/auth";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const [allowed, setAllowed] = useState(() =>
    typeof window !== "undefined" ? isAuthenticated() : false
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/account");
    } else {
      setAllowed(true);
    }
  }, [router]);

  if (!allowed) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
