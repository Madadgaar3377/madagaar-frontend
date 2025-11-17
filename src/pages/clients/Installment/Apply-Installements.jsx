// src/components/InstallmentApplicationForm.jsx
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getAuthToken, getUser } from "../../../utils/auth"; // adjust path to your auth.js
import { backendBaseUrl } from "../../../constants/apiUrl";

/**
 * Props:
 * - planId (optional) : prefill the installmentPlanId
 * - initialValues (optional) : object to prefill fields (e.g. from plan)
 * - onSuccess (optional) : callback({ data, message }) when creation succeeds
 * - onSuccessRedirect (optional) : string url to redirect after success
 */
/**
 * Props:
 * - planId (optional) : prefill the installmentPlanId
 * - initialValues (optional) : object to prefill fields (e.g. from plan)
 * - onSuccess (optional) : callback({ data, message }) when creation succeeds
 * - onSuccessRedirect (optional) : string url to redirect after success
 */
/**
 * Props:
 * - planId (optional): if provided, the component will auto-fetch the plan and lock product fields
 * - initialValues (optional): fallback initial values
 * - onSuccess (optional): callback({ data, message })
 * - onSuccessRedirect (optional): redirect url after success
 */
export default function InstallmentApplicationForm({
  planId = null,
  initialValues = {},
  onSuccess = null,
  onSuccessRedirect = "/",
}) {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const currentUser = getUser();

//   get id from url if planId not provided
  const params = useParams();
    if (!planId && params.id) {
      planId = params.id;
    }
    console.log("Using planId:", planId);

  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState("");
  const [productLocked, setProductLocked] = useState(false); // true when product fields should be read-only

  const [form, setForm] = useState({
    // product-related fields (will be auto-filled and locked if planId present)
    installmentPlanId: initialValues.installmentPlanId || "",
    productName: initialValues.productName || "",
    category: initialValues.category || "",
    postedBy: initialValues.postedBy || "",
    city: initialValues.city || "",
    totalPrice: initialValues.price || initialValues.totalPrice || "",
    downPayment: initialValues.downpayment || initialValues.downPayment || "",
    installmentAmount: initialValues.installment || initialValues.installmentAmount || "",
    numberOfInstallments: initialValues.tenure || initialValues.numberOfInstallments || "",
    description: initialValues.description || "",
    // applicant details
    fullName: currentUser?.fullName || "",
    fathersHusbandsName: "",
    cnicNumber: "",
    dateOfBirth: "",
    contactNumber: currentUser?.number || "",
    emailAddress: currentUser?.email || "",
    residentialAddress: "",
    permanentAddress: "",
    maritalStatus: "",
    occupation: "",
    employerName: "",
    employerAddress: "",
    jobTitle: "",
    monthlyIncome: "",
    otherIncomeSources: "",
    workContactNumber: "",
    orderNotes: "",
  });

  const [loading, setLoading] = useState(false); // submission loading
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // fetch product details when planId provided
  useEffect(() => {
    let mounted = true;
    async function fetchPlan(pid) {
      try {
        setProductLoading(true);
        setProductError("");
        setProductLocked(false);

        const res = await fetch(`${apiUrl}/installmentplan/get/public/${encodeURIComponent(pid)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const payload = await res.json().catch(() => null);
        if (!res.ok || (payload && payload.success === false)) {
          const msg = payload?.message || `Failed to fetch plan (${res.status})`;
          if (mounted) {
            setProductError(msg);
            setProductLocked(false);
          }
          return;
        }

        // backend may respond: { success: true, data: {...} } or data object directly or array
        let data = payload;
        if (payload && payload.success !== undefined && payload.data !== undefined) data = payload.data;
        const planObj = Array.isArray(data) ? data[0] : data;

        if (!planObj) {
          if (mounted) {
            setProductError("Plan not found");
            setProductLocked(false);
          }
          return;
        }

        // map server fields to our form fields (adjust depending on backend shape)
        const mapped = {
          installmentPlanId: planObj.installmentPlanId ,
          productName: planObj.productName || planObj.projectName || "",
          category: planObj.category || planObj.customCategory || "",
          postedBy: planObj.postedBy || (planObj.user && planObj.user.fullName) || "",
          city: planObj.city || planObj.propertyCity || "",
          totalPrice: planObj.price ?? planObj.totalPrice ?? "",
          downPayment: planObj.downpayment ?? planObj.downPayment ?? "",
          installmentAmount: planObj.installment ?? planObj.installmentAmount ?? "",
          numberOfInstallments: planObj.tenure ?? planObj.numberOfInstallments ?? "",
          description: planObj.description ?? planObj.productInfoOtherDetails ?? "",
        };

        if (mounted) {
          setForm((f) => ({ ...f, ...mapped }));
          setProductLocked(true);
          setProductError("");
        }
      } catch (err) {
        console.error("fetchPlan error:", err);
        if (mounted) setProductError("Network error while fetching product");
      } finally {
        if (mounted) setProductLoading(false);
      }
    }

    if (planId) {
      fetchPlan(planId);
    } else if (initialValues.installmentPlanId) {
      // allow initialValues to lock product if it contains id
      setForm((f) => ({ ...f, installmentPlanId: initialValues.installmentPlanId }));
      setProductLocked(!!initialValues.installmentPlanId);
    }

    return () => {
      mounted = false;
    };
  }, [apiUrl, planId, initialValues.installmentPlanId]);

  // validation
  const requiredFields = [
    "installmentPlanId",
    "fullName",
    "cnicNumber",
    "contactNumber",
    "emailAddress",
    "residentialAddress",
  ];

  function validate() {
    const e = {};
    requiredFields.forEach((k) => {
      if (!String(form[k] ?? "").trim()) {
        e[k] = "This field is required";
      }
    });
    if (form.emailAddress && !/^\S+@\S+\.\S+$/.test(form.emailAddress)) {
      e.emailAddress = "Invalid email";
    }
    if (form.cnicNumber && !/^\d{5,20}$/.test(form.cnicNumber.replace(/[-\s]/g, ""))) {
      e.cnicNumber = "Invalid CNIC/ID";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setLoading(true);

      const token = getAuthToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      // payload consistent with your backend expectation
      const payload = {
        installmentPlanId: form.installmentPlanId,
        productName: form.productName,
        category: form.category,
        postedBy: form.postedBy,
        city: form.city,
        totalPrice: form.totalPrice,
        downPayment: form.downPayment,
        installmentAmount: form.installmentAmount,
        numberOfInstallments: form.numberOfInstallments,
        description: form.description,
        fullName: form.fullName,
        fathersHusbandsName: form.fathersHusbandsName,
        cnicNumber: form.cnicNumber,
        dateOfBirth: form.dateOfBirth,
        contactNumber: form.contactNumber,
        emailAddress: form.emailAddress,
        residentialAddress: form.residentialAddress,
        permanentAddress: form.permanentAddress,
        maritalStatus: form.maritalStatus,
        occupation: form.occupation,
        employerName: form.employerName,
        employerAddress: form.employerAddress,
        jobTitle: form.jobTitle,
        monthlyIncome: form.monthlyIncome,
        otherIncomeSources: form.otherIncomeSources,
        workContactNumber: form.workContactNumber,
        orderNotes: form.orderNotes,
      };

      const res = await fetch(`${apiUrl}/installment-application`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        if (body && body.errors) {
          setErrors(body.errors);
          setServerError(body.message || "Validation failed");
        } else {
          setServerError(body?.message || `Request failed (${res.status})`);
        }
      } else {
        setSuccessMsg(body?.message || "Application submitted successfully");
        setErrors({});
        if (onSuccess) onSuccess({ data: body?.data, message: body?.message });
        if (onSuccessRedirect) {
          setTimeout(() => (window.location.href = onSuccessRedirect), 1200);
        }
      }
    } catch (err) {
      console.error(err);
      setServerError("Network error — could not submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Apply for Installment</h2>

      {/* product fetch status */}
      {productLoading && <div className="mb-3 text-sm text-gray-600">Loading product data…</div>}
      {productError && <div className="mb-3 text-sm text-red-600">{productError}</div>}
      {serverError && <div className="mb-3 text-sm text-red-600">{serverError}</div>}
      {successMsg && <div className="mb-3 text-sm text-green-700">{successMsg}</div>}

      {/* Product fields (disabled if productLocked === true) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Installment Plan ID" name="installmentPlanId" value={form.installmentPlanId} onChange={handleChange} error={errors.installmentPlanId} disabled={productLocked} />
        <Input label="Product Name" name="productName" value={form.productName} onChange={handleChange} disabled={productLocked} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <Input label="Category" name="category" value={form.category} onChange={handleChange} disabled={productLocked} />
        <Input label="City" name="city" value={form.city} onChange={handleChange} disabled={productLocked} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <Input label="Total Price" name="totalPrice" value={form.totalPrice} onChange={handleChange} disabled={productLocked} />
        <Input label="Down Payment" name="downPayment" value={form.downPayment} onChange={handleChange} disabled={productLocked} />
        <Input label="Installment Amount" name="installmentAmount" value={form.installmentAmount} onChange={handleChange} disabled={productLocked} />
      </div>

      <div className="mt-3">
        <label className="block text-sm text-gray-600 mb-1">Number of Installments</label>
        <input className="w-full px-3 py-2 border rounded" name="numberOfInstallments" value={form.numberOfInstallments} onChange={handleChange} disabled={productLocked} />
      </div>

      <div className="mt-3">
        <label className="block text-sm text-gray-600 mb-1">Description / Notes</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 border rounded h-24" disabled={productLocked} />
      </div>

      <hr className="my-4" />

      <h3 className="text-lg font-medium mb-2">Applicant Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} />
        <Input label="Father / Husband Name" name="fathersHusbandsName" value={form.fathersHusbandsName} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <Input label="CNIC / ID Number" name="cnicNumber" value={form.cnicNumber} onChange={handleChange} error={errors.cnicNumber} />
        <Input label="Date of Birth" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <Input label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} error={errors.contactNumber} />
        <Input label="Email Address" name="emailAddress" value={form.emailAddress} onChange={handleChange} error={errors.emailAddress} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <Input label="Residential Address" name="residentialAddress" value={form.residentialAddress} onChange={handleChange} error={errors.residentialAddress} />
        <Input label="Permanent Address" name="permanentAddress" value={form.permanentAddress} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <Input label="Marital Status" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} />
        <Input label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <Input label="Employer Name" name="employerName" value={form.employerName} onChange={handleChange} />
        <Input label="Employer Address" name="employerAddress" value={form.employerAddress} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <Input label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} />
        <Input label="Monthly Income" name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <Input label="Other Income Sources" name="otherIncomeSources" value={form.otherIncomeSources} onChange={handleChange} />
        <Input label="Work Contact Number" name="workContactNumber" value={form.workContactNumber} onChange={handleChange} />
      </div>

      <div className="mt-3">
        <label className="block text-sm text-gray-600 mb-1">Order Notes</label>
        <textarea name="orderNotes" value={form.orderNotes} onChange={handleChange} className="w-full px-3 py-2 border rounded h-24" />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || productLoading}
          className="px-4 py-2 rounded bg-[rgb(183,36,42)] text-white disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>

        <button
          type="button"
          onClick={() => {
            // reset applicant fields (keep product)
            setForm((f) => ({
              ...f,
              fathersHusbandsName: "",
              cnicNumber: "",
              dateOfBirth: "",
              contactNumber: currentUser?.number || "",
              emailAddress: currentUser?.email || "",
              residentialAddress: "",
              permanentAddress: "",
              maritalStatus: "",
              occupation: "",
              employerName: "",
              employerAddress: "",
              jobTitle: "",
              monthlyIncome: "",
              otherIncomeSources: "",
              workContactNumber: "",
              orderNotes: "",
            }));
            setErrors({});
            setServerError("");
            setSuccessMsg("");
          }}
          className="px-4 py-2 rounded border"
        >
          Reset Applicant Fields
        </button>
      </div>
    </form>
  );
}

/* Small input helper */
function Input({ label, name, value, onChange, type = "text", error, disabled = false }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">
        {label}
      </label>
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        type={type}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded ${disabled ? "bg-gray-100 cursor-not-allowed" : error ? "border-red-400" : "border-gray-300"}`}
      />
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}
