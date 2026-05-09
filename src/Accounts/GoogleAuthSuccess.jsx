import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setAuthData } from "../utils/auth";
import toast from "react-hot-toast";

export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const userType = searchParams.get("userType");
    const profilePic = searchParams.get("profilePic");

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
          isVerified: true
        };
        
        // Save to localStorage using the existing auth utility
        setAuthData(token, userData);
        
        toast.success("Google Login Successful!");
        
        // Redirect to dashboard or home
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } catch (error) {
        console.error("Error saving auth data:", error);
        toast.error("Authentication failed. Please try again.");
        navigate("/account?error=auth_persistence_failed");
      }
    } else {
      toast.error("Authentication failed or was cancelled.");
      navigate("/account?error=no_token");
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="w-12 h-12 border-4 border-[rgb(183,36,42)] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
      <h2 className="text-xl font-semibold text-gray-800">Finalizing Google Sign-in...</h2>
      <p className="text-gray-500 mt-2">Please wait while we secure your session.</p>
    </div>
  );
}
