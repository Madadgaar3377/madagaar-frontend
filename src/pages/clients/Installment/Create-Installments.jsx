// src/pages/dashboard/CreateInstallmentPlan.jsx
import React, { useState } from "react";
import { getAuthToken } from "../../../utils/auth"; // adjust path if needed
import { backendBaseUrl } from "../../../constants/apiUrl";
import NavbarDashboard from "../Dashboard/Navbar-Dashboard";

const API_BASE = (backendBaseUrl || "").replace(/\/$/, "");
const ACCENT = "rgb(183,36,42)";

export default function CreateInstallmentPlan() {
  const [form, setForm] = useState({
    productName: "",
    city: "",
    category: "",
    price: "",
    downpayment: "",
    installment: "",
    tenure: "",
    customTenure: "",
    postedBy: "",
    videoUrl: "",
    description: "",
    companyName: "",
    productImages: [""], // allow multiple URLs
    // minimal spec fields
    generalFeatures: { operatingSystem: "", simSupport: "", colors: "" },
    display: { screenSize: "", screenResolution: "", technology: "" },
    battery: { type: "" },
    camera: { frontCamera: "", backCamera: "", features: "" },
    memory: { internalMemory: "", ram: "", cardSlot: "" },
    connectivity: { data: "", nfc: "", bluetooth: "" },
    // dynamic payment plans
    paymentPlans: [
      {
        planName: "Plan 1",
        installmentPrice: "",
        downPayment: "",
        monthlyInstallment: "",
        tenureMonths: "",
        interestRatePercent: "",
        interestType: "Flat Rate",
        markup: "",
        otherChargesNote: "",
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  // helpers
  const update = (path, value) => {
    setForm((f) => {
      const next = JSON.parse(JSON.stringify(f));
      const parts = path.split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  // payment plans helpers
  const addPaymentPlan = () => {
    setForm((f) => ({
      ...f,
      paymentPlans: [
        ...f.paymentPlans,
        {
          planName: `Plan ${f.paymentPlans.length + 1}`,
          installmentPrice: "",
          downPayment: "",
          monthlyInstallment: "",
          tenureMonths: "",
          interestRatePercent: "",
          interestType: "Flat Rate",
          markup: "",
          otherChargesNote: "",
        },
      ],
    }));
  };

  const removePaymentPlan = (idx) => {
    setForm((f) => {
      const pp = [...f.paymentPlans];
      pp.splice(idx, 1);
      return { ...f, paymentPlans: pp };
    });
  };

  const handlePaymentPlanChange = (idx, key, value) => {
    setForm((f) => {
      const pp = f.paymentPlans.map((p, i) => (i === idx ? { ...p, [key]: value } : p));
      return { ...f, paymentPlans: pp };
    });
  };

  // product image helpers
  const addImageSlot = () => update("productImages", [...form.productImages, ""]);
  const updateImage = (i, v) => {
    const arr = [...form.productImages];
    arr[i] = v;
    update("productImages", arr);
  };
  const removeImage = (i) => {
    const arr = [...form.productImages];
    arr.splice(i, 1);
    update("productImages", arr);
  };

  // validation
  function validate() {
    const e = {};
    if (!form.productName.trim()) e.productName = "Product name is required";
    if (!form.price || isNaN(Number(form.price))) e.price = "Valid price required";
    if (!form.installment || isNaN(Number(form.installment))) e.installment = "Valid installment required";
    // at least one payment plan with numeric monthlyInstallment
    if (!Array.isArray(form.paymentPlans) || form.paymentPlans.length === 0) {
      e.paymentPlans = "Add at least one payment plan";
    } else {
      form.paymentPlans.forEach((p, idx) => {
        if (!p.planName?.trim()) e[`paymentPlans.${idx}.planName`] = "Plan name required";
        if (!p.monthlyInstallment || isNaN(Number(p.monthlyInstallment)))
          e[`paymentPlans.${idx}.monthlyInstallment`] = "Monthly installment required";
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccess("");
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      // prepare payload: convert numeric fields
      const payload = {
        productName: form.productName,
        city: form.city,
        category: form.category,
        price: Number(form.price) || 0,
        downpayment: Number(form.downpayment) || 0,
        installment: Number(form.installment) || 0,
        tenure: form.tenure,
        customTenure: form.customTenure,
        postedBy: form.postedBy,
        videoUrl: form.videoUrl,
        description: form.description,
        companyName: form.companyName,
        productImages: (form.productImages || []).filter(Boolean),
        // specs (only include non-empty)
        generalFeatures: form.generalFeatures,
        display: form.display,
        battery: form.battery,
        camera: form.camera,
        memory: form.memory,
        connectivity: form.connectivity,
        // payment plans: convert numeric inside each
        paymentPlans: (form.paymentPlans || []).map((p) => ({
          planName: p.planName,
          installmentPrice: Number(p.installmentPrice) || 0,
          downPayment: Number(p.downPayment) || 0,
          monthlyInstallment: Number(p.monthlyInstallment) || 0,
          tenureMonths: Number(p.tenureMonths) || 0,
          interestRatePercent: Number(p.interestRatePercent) || 0,
          interestType: p.interestType || "Flat Rate",
          markup: Number(p.markup) || 0,
          otherChargesNote: p.otherChargesNote || "",
        })),
      };

      const res = await fetch(`${API_BASE}/installmentplan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setServerError(body?.message || `Failed: ${res.status}`);
      } else {
        setSuccess(body?.message || "Installment plan created successfully");
        // optionally reset form or redirect
        setForm({
          productName: "",
          city: "",
          category: "",
          price: "",
          downpayment: "",
          installment: "",
          tenure: "",
          customTenure: "",
          postedBy: "",
          videoUrl: "",
          description: "",
          companyName: "",
          productImages: [""],
          generalFeatures: { operatingSystem: "", simSupport: "", colors: "" },
          display: { screenSize: "", screenResolution: "", technology: "" },
          battery: { type: "" },
          camera: { frontCamera: "", backCamera: "", features: "" },
          memory: { internalMemory: "", ram: "", cardSlot: "" },
          connectivity: { data: "", nfc: "", bluetooth: "" },
          paymentPlans: [
            {
              planName: "Plan 1",
              installmentPrice: "",
              downPayment: "",
              monthlyInstallment: "",
              tenureMonths: "",
              interestRatePercent: "",
              interestType: "Flat Rate",
              markup: "",
              otherChargesNote: "",
            },
          ],
        });
        setErrors({});
      }
    } catch (err) {
      console.error(err);
      setServerError("Network error — could not create plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
        <NavbarDashboard />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Create Installment Plan</h2>
        <p className="text-sm text-gray-500 mb-4">Create a new product and its payment plans. Fields marked required will be validated.</p>

        {serverError && <div className="mb-3 text-sm text-red-600">{serverError}</div>}
        {success && <div className="mb-3 text-sm text-green-700">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* product basics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Product Name" required error={errors.productName}>
              <input value={form.productName} onChange={(e) => update("productName", e.target.value)} className="w-full px-3 py-2 border rounded" />
            </Field>

            <Field label="Category">
              <input value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full px-3 py-2 border rounded" />
            </Field>

            <Field label="City">
              <input value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full px-3 py-2 border rounded" />
            </Field>

            <Field label="Company">
              <input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className="w-full px-3 py-2 border rounded" />
            </Field>

            <Field label="Price (PKR)" required error={errors.price}>
              <input value={form.price} onChange={(e) => update("price", e.target.value)} type="number" className="w-full px-3 py-2 border rounded" />
            </Field>

            <Field label="Downpayment (PKR)">
              <input value={form.downpayment} onChange={(e) => update("downpayment", e.target.value)} type="number" className="w-full px-3 py-2 border rounded" />
            </Field>

            <Field label="Installment (monthly) (PKR)" required error={errors.installment}>
              <input value={form.installment} onChange={(e) => update("installment", e.target.value)} type="number" className="w-full px-3 py-2 border rounded" />
            </Field>

            <Field label="Tenure / Label">
              <input value={form.tenure} onChange={(e) => update("tenure", e.target.value)} className="w-full px-3 py-2 border rounded" />
            </Field>
          </div>

          {/* images */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Product Images (URLs)</h4>
            <div className="space-y-2">
              {form.productImages.map((img, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={img} onChange={(e) => updateImage(i, e.target.value)} className="flex-1 px-3 py-2 border rounded" placeholder="https://..." />
                  <button type="button" onClick={() => removeImage(i)} className="px-3 py-1 rounded border text-sm">Remove</button>
                </div>
              ))}
              <button type="button" onClick={addImageSlot} className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded border text-sm">+ Add Image URL</button>
            </div>
          </div>

          {/* video and description */}
          <div>
            <Field label="Video URL">
              <input value={form.videoUrl} onChange={(e) => update("videoUrl", e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="YouTube or mp4 link" />
            </Field>

            <Field label="Description">
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="w-full px-3 py-2 border rounded h-28" />
            </Field>
          </div>

          {/* specs (optional) */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Specifications (optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="OS"><input value={form.generalFeatures.operatingSystem} onChange={(e) => update("generalFeatures.operatingSystem", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="SIM"><input value={form.generalFeatures.simSupport} onChange={(e) => update("generalFeatures.simSupport", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="Colors"><input value={form.generalFeatures.colors} onChange={(e) => update("generalFeatures.colors", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>

              <Field label="Screen Size"><input value={form.display.screenSize} onChange={(e) => update("display.screenSize", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="Resolution"><input value={form.display.screenResolution} onChange={(e) => update("display.screenResolution", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="Technology"><input value={form.display.technology} onChange={(e) => update("display.technology", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>

              <Field label="Battery"><input value={form.battery.type} onChange={(e) => update("battery.type", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="Camera Front"><input value={form.camera.frontCamera} onChange={(e) => update("camera.frontCamera", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="Camera Back"><input value={form.camera.backCamera} onChange={(e) => update("camera.backCamera", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>

              <Field label="Internal Memory"><input value={form.memory.internalMemory} onChange={(e) => update("memory.internalMemory", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="RAM"><input value={form.memory.ram} onChange={(e) => update("memory.ram", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="Card Slot"><input value={form.memory.cardSlot} onChange={(e) => update("memory.cardSlot", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            </div>
          </div>

          {/* dynamic payment plans */}
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-3">Payment Plans</h4>
            {errors.paymentPlans && <div className="text-sm text-red-600 mb-2">{errors.paymentPlans}</div>}

            <div className="space-y-4">
              {form.paymentPlans.map((p, idx) => (
                <div key={idx} className="border rounded p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <strong>Plan {idx + 1}</strong>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => removePaymentPlan(idx)} className="text-sm px-2 py-1 border rounded">Remove</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Field label="Plan Name" error={errors[`paymentPlans.${idx}.planName`]}>
                      <input value={p.planName} onChange={(e) => handlePaymentPlanChange(idx, "planName", e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </Field>

                    <Field label="Installment Price">
                      <input value={p.installmentPrice} onChange={(e) => handlePaymentPlanChange(idx, "installmentPrice", e.target.value)} type="number" className="w-full px-3 py-2 border rounded" />
                    </Field>

                    <Field label="Down Payment">
                      <input value={p.downPayment} onChange={(e) => handlePaymentPlanChange(idx, "downPayment", e.target.value)} type="number" className="w-full px-3 py-2 border rounded" />
                    </Field>

                    <Field label="Monthly Installment" required error={errors[`paymentPlans.${idx}.monthlyInstallment`]}>
                      <input value={p.monthlyInstallment} onChange={(e) => handlePaymentPlanChange(idx, "monthlyInstallment", e.target.value)} type="number" className="w-full px-3 py-2 border rounded" />
                    </Field>

                    <Field label="Tenure (months)">
                      <input value={p.tenureMonths} onChange={(e) => handlePaymentPlanChange(idx, "tenureMonths", e.target.value)} type="number" className="w-full px-3 py-2 border rounded" />
                    </Field>

                    <Field label="Interest %">
                      <input value={p.interestRatePercent} onChange={(e) => handlePaymentPlanChange(idx, "interestRatePercent", e.target.value)} type="number" className="w-full px-3 py-2 border rounded" />
                    </Field>

                    <Field label="Interest Type">
                      <select value={p.interestType} onChange={(e) => handlePaymentPlanChange(idx, "interestType", e.target.value)} className="w-full px-3 py-2 border rounded">
                        <option>Flat Rate</option>
                        <option>Reducing Balance</option>
                        <option>Compound Interest</option>
                        <option>Profit-Based (Islamic/Shariah)</option>
                      </select>
                    </Field>

                    <Field label="Markup">
                      <input value={p.markup} onChange={(e) => handlePaymentPlanChange(idx, "markup", e.target.value)} type="number" className="w-full px-3 py-2 border rounded" />
                    </Field>

                    <Field label="Other Charges / Note">
                      <input value={p.otherChargesNote} onChange={(e) => handlePaymentPlanChange(idx, "otherChargesNote", e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <button type="button" onClick={addPaymentPlan} className="inline-flex items-center gap-2 px-4 py-2 rounded border bg-white">
                + Add Payment Plan
              </button>
            </div>
          </div>

          {/* submit */}
          <div className="flex items-center gap-3 pt-4">
            <button type="submit" disabled={loading} style={{ background: ACCENT }} className="px-4 py-2 rounded text-white shadow">
              {loading ? "Creating..." : "Create Installment Plan"}
            </button>

            <button type="button" onClick={() => { /* optional: navigate back */ }} className="px-4 py-2 rounded border">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --- small UI helper --- */
function Field({ label, children, required = false, error = null }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div>{children}</div>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}
