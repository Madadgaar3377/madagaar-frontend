import React, { useState } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
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
    userType: "User",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        // respect the selected userType from the form (default: User)
        userType: formData.userType || "User",
        walletDetails: [],
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

      setMessage(data?.message || "Signup successful! Check your email for OTP.");
      navigate("/account", { state: { email: formData.email } });
    } catch (err) {
      console.error("Signup error:", err);
      setMessage("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6">
        <h3 className="text-2xl font-semibold mb-4">Create your account</h3>
        <p className="text-sm text-gray-500 mb-4">Simple and quick signup. Fields are arranged in rows for faster entry.</p>

        {message && <div className="mb-4 p-3 rounded-md text-sm text-red-700 bg-red-50">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row: Business Name / Full Name */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-1/3 text-sm text-gray-600">Business Name</label>
            <input name="businessName" placeholder="Acme Traders" value={formData.businessName} onChange={handleChange} className="md:flex-1 p-2 border rounded-md" required />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-1/3 text-sm text-gray-600">Full Name</label>
            <input name="fullName" placeholder="Your full name" value={formData.fullName} onChange={handleChange} className="md:flex-1 p-2 border rounded-md" required />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-1/3 text-sm text-gray-600">Email</label>
            <input name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="md:flex-1 p-2 border rounded-md" required />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-1/3 text-sm text-gray-600">Phone</label>
            <input name="number" type="tel" placeholder="03xx-xxxxxxx" value={formData.number} onChange={handleChange} className="md:flex-1 p-2 border rounded-md" required />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-1/3 text-sm text-gray-600">Whatsapp</label>
            <input name="whatsappNumber" placeholder="Optional" value={formData.whatsappNumber} onChange={handleChange} className="md:flex-1 p-2 border rounded-md" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-1/3 text-sm text-gray-600">Business No.</label>
            <input name="businessNumber" placeholder="Optional" value={formData.businessNumber} onChange={handleChange} className="md:flex-1 p-2 border rounded-md" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-1/3 text-sm text-gray-600">CNIC</label>
            <input name="cnic" placeholder="XXXXX-XXXXXXX-X" value={formData.cnic} onChange={handleChange} className="md:flex-1 p-2 border rounded-md" required />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-1/3 text-sm text-gray-600">Password</label>
            <div className="md:flex-1 flex items-center">
              <input name="password" type={showPassword ? "text" : "password"} placeholder="Min 8 characters" value={formData.password} onChange={handleChange} className="flex-1 p-2 border rounded-l-md" required />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-md text-sm">{showPassword ? "Hide" : "Show"}</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-1/3 text-sm text-gray-600">Reference Code</label>
            <input name="refferenceCode" placeholder="Optional" value={formData.refferenceCode} onChange={handleChange} className="md:flex-1 p-2 border rounded-md" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="md:w-1/3 text-sm text-gray-600">User Type</label>
            <select name="userType" value={formData.userType} onChange={handleChange} className="md:flex-1 p-2 border rounded-md">
              <option value="User">User</option>
              <option value="Affiliate">Affiliate</option>
              <option value="Agent">Agent</option>
              <option value="Partner">Partner</option>
            </select>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full bg-[rgb(183,36,42)] text-white py-2 rounded-md font-medium hover:opacity-95 transition">{loading ? "Please wait..." : "Create account"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
