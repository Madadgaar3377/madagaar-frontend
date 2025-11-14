import React, { useState } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const apiUrl = backendBaseUrl.replace(/\/$/, "");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: "",
    fullName: "",
    email: "",
    number: "",
    whatsappNumber: "",
    businessNumber: "",
    cnic: "",
    password: "",
    refferenceCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        userType: "User", // required by backend
        walletDetails: [], // backend expects array
      };

      const res = await fetch(`${apiUrl}/auth/registration/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        const errMsg = data?.message || data?.error || `Signup failed (${res.status})`;
        setMessage(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
        setLoading(false);
        return;
      }

      // success — backend returns success: true and message telling to check email
      setMessage(data?.message || "Signup successful! Check your email for OTP.");

      // redirect to OTP verify page and pass the email in location state
      navigate("/account/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      console.error("Signup error:", err);
      setMessage("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>

        {message && <p className="mb-4 text-center text-red-600 font-medium">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="businessName" placeholder="Business Name" value={formData.businessName} onChange={handleChange} className="w-full p-3 border rounded-lg" required />

          <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="w-full p-3 border rounded-lg" required />

          <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-lg" required />

          <input name="number" type="text" placeholder="Phone Number" value={formData.number} onChange={handleChange} className="w-full p-3 border rounded-lg" required />

          <input name="whatsappNumber" placeholder="Whatsapp Number" value={formData.whatsappNumber} onChange={handleChange} className="w-full p-3 border rounded-lg" />

          <input name="businessNumber" placeholder="Business Number" value={formData.businessNumber} onChange={handleChange} className="w-full p-3 border rounded-lg" />

          <input name="cnic" placeholder="CNIC Number" value={formData.cnic} onChange={handleChange} className="w-full p-3 border rounded-lg" required />

          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 border rounded-lg" required />

          <div>
            <input name="refferenceCode" placeholder="Reference Code (optional)" value={formData.refferenceCode} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[rgb(183,36,42)] text-white font-semibold p-3 rounded-lg hover:bg-red-700 transition">
            {loading ? "Please wait..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
