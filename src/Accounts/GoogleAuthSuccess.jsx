"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setAuthData } from "../utils/auth";
import toast from "react-hot-toast";

export default function GoogleAuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    let redirectTimer;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const name = params.get("name");
    const email = params.get("email");
    const userType = params.get("userType");
    const profilePic = params.get("profilePic");

    if (token) {
      try {
        const userData = {
          userId,
          name,
          email,
          UserType: userType || "user",
          profilePic,
          emailVerify: true,
          isActive: true,
          isVerified: true,
        };

        setAuthData(token, userData);

        toast.success("Google Login Successful!");

        redirectTimer = setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } catch (error) {
        console.error("Error saving auth data:", error);
        toast.error("Authentication failed. Please try again.");
        router.push("/account?error=auth_persistence_failed");
      }
    } else {
      toast.error("Authentication failed or was cancelled.");
      router.push("/account?error=no_token");
    }
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="size-12 border-4 border-[rgb(183,36,42)] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
      <h2 className="text-xl font-semibold text-gray-800">Finalizing Google Sign-in...</h2>
      <p className="text-gray-500 mt-2">Please wait while we secure your session.</p>
    </div>
  );
}
