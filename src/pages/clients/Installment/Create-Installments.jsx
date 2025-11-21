// src/pages/dashboard/CreateInstallmentPlan.jsx
import React, { useState, useRef } from "react";
import { getAuthToken } from "../../../utils/auth"; // adjust path if needed
import { backendBaseUrl } from "../../../constants/apiUrl";
import NavbarDashboard from "../Dashboard/Navbar-Dashboard";

const API_BASE = (backendBaseUrl || "").replace(/\/$/, "");
const ACCENT = "rgb(183,36,42)";

// categories available for selection. Keys should match your backend's category field names
const CATEGORIES = [
  { key: "mobile", label: "Mobile / Phone" },
  { key: "airConditioner", label: "Air Conditioner" },
  { key: "electricalBike", label: "Electrical Bike" },
  { key: "mechanicalBike", label: "Mechanical Bike" },
  { key: "other", label: "Other / Generic" },
];

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
    // minimal spec fields (mobile default)
    generalFeatures: { operatingSystem: "", simSupport: "", colors: "" },
    display: { screenSize: "", screenResolution: "", technology: "" },
    battery: { type: "" },
    camera: { frontCamera: "", backCamera: "", features: "" },
    memory: { internalMemory: "", ram: "", cardSlot: "" },
    connectivity: { data: "", nfc: "", bluetooth: "" },

    // air conditioner
    airConditioner: {
      brand: "",
      model: "",
      color: "",
      capacityInTon: "",
      type: "",
      energyEfficient: "",
      display: "",
      indoorDimension: "",
      outdoorDimension: "",
      indoorWeightKg: "",
      outdoorWeightKg: "",
      powerSupply: "",
      otherFeatures: "",
      warranty: "",
    },

    // electrical bike
    electricalBike: {
      motorRatedPower: "",
      battery: "",
      maxSpeed: "",
      maxDistanceRange: "",
      chargingTime: "",
      rimsTiresFront: "",
      rimsTiresBack: "",
      brakes: "",
      shocks: "",
      meter: "",
      maxLoad: "",
      dryWeight: "",
      vehicleDimensions: "",
      features: "",
      colors: "",
    },

    // mechanical bike
    mechanicalBike: {
      generalFeatures: { dimensions: "", weight: "", engine: "", colors: "", other: "" },
      performance: { transmission: "", groundClearance: "", starting: "", displacement: "", petrolCapacity: "" },
      assembly: { compressionRatio: "", boreAndStroke: "", tyreAtFront: "", tyreAtBack: "", seatHeight: "" },
    },

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

  // image upload UI state
  const [uploadingIndex, setUploadingIndex] = useState(null); // index being uploaded or null
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

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

  // When user clicks "Upload" for a slot, open file picker and remember index
  const triggerFilePickerForIndex = (i) => {
    setUploadError("");
    setUploadingIndex(i);
    if (fileInputRef.current) fileInputRef.current.value = null;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Upload selected file to /image-upload/single (key: image) and store returned url
  const handleFileSelected = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const idx = uploadingIndex;
    if (idx === null) return;

    setUploadError("");
    // set a temporary "uploading" marker
    const prevValue = form.productImages[idx];
    updateImage(idx, "__UPLOADING__");

    try {
      const token = getAuthToken();
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API_BASE}/image-upload/single`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = body?.message || `Upload failed: ${res.status}`;
        setUploadError(msg);
        updateImage(idx, prevValue);
      } else {
        // expected response hint: { success: true, url: "https://...", file: {...} }
        const url = body?.url || body?.data?.url || body?.file?.url;
        if (body?.success && typeof body.url === "string") {
          updateImage(idx, body.url);
        } else if (url) {
          updateImage(idx, url);
        } else {
          // fallback: try to read body.message or entire body
          setUploadError("Upload succeeded but server response missing URL");
          updateImage(idx, prevValue);
        }
      }
    } catch (err) {
      console.error(err);
      setUploadError("Network error during image upload");
      updateImage(idx, prevValue);
    } finally {
      setUploadingIndex(null);
    }
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
        productImages: (form.productImages || []).filter(Boolean).filter((v) => v !== "__UPLOADING__"),
        // specs (only include non-empty) — keep category-specific block
        generalFeatures: form.generalFeatures,
        display: form.display,
        battery: form.battery,
        camera: form.camera,
        memory: form.memory,
        connectivity: form.connectivity,
        airConditioner: form.airConditioner,
        electricalBike: form.electricalBike,
        mechanicalBike: form.mechanicalBike,
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
        // reset form
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
          airConditioner: {
            brand: "",
            model: "",
            color: "",
            capacityInTon: "",
            type: "",
            energyEfficient: "",
            display: "",
            indoorDimension: "",
            outdoorDimension: "",
            indoorWeightKg: "",
            outdoorWeightKg: "",
            powerSupply: "",
            otherFeatures: "",
            warranty: "",
          },
          electricalBike: {
            motorRatedPower: "",
            battery: "",
            maxSpeed: "",
            maxDistanceRange: "",
            chargingTime: "",
            rimsTiresFront: "",
            rimsTiresBack: "",
            brakes: "",
            shocks: "",
            meter: "",
            maxLoad: "",
            dryWeight: "",
            vehicleDimensions: "",
            features: "",
            colors: "",
          },
          mechanicalBike: {
            generalFeatures: { dimensions: "", weight: "", engine: "", colors: "", other: "" },
            performance: { transmission: "", groundClearance: "", starting: "", displacement: "", petrolCapacity: "" },
            assembly: { compressionRatio: "", boreAndStroke: "", tyreAtFront: "", tyreAtBack: "", seatHeight: "" },
          },
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

  // Renders specification inputs for selected category
  function renderCategorySpecs(category) {
    switch (category) {
      case "airConditioner":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Brand"><input value={form.airConditioner.brand} onChange={(e) => update("airConditioner.brand", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            <Field label="Model"><input value={form.airConditioner.model} onChange={(e) => update("airConditioner.model", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            <Field label="Type"><input value={form.airConditioner.type} onChange={(e) => update("airConditioner.type", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            <Field label="Capacity (Ton)"><input value={form.airConditioner.capacityInTon} onChange={(e) => update("airConditioner.capacityInTon", e.target.value)} type="number" className="w-full px-3 py-2 border rounded" /></Field>
            <Field label="Energy Efficient"><input value={form.airConditioner.energyEfficient} onChange={(e) => update("airConditioner.energyEfficient", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            <Field label="Warranty"><input value={form.airConditioner.warranty} onChange={(e) => update("airConditioner.warranty", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            <Field label="Other Features"><input value={form.airConditioner.otherFeatures} onChange={(e) => update("airConditioner.otherFeatures", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
          </div>
        );

      case "electricalBike":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Motor Rated Power"><input value={form.electricalBike.motorRatedPower} onChange={(e) => update("electricalBike.motorRatedPower", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            <Field label="Battery"><input value={form.electricalBike.battery} onChange={(e) => update("electricalBike.battery", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            <Field label="Max Speed"><input value={form.electricalBike.maxSpeed} onChange={(e) => update("electricalBike.maxSpeed", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            <Field label="Max Distance Range"><input value={form.electricalBike.maxDistanceRange} onChange={(e) => update("electricalBike.maxDistanceRange", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            <Field label="Charging Time"><input value={form.electricalBike.chargingTime} onChange={(e) => update("electricalBike.chargingTime", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            <Field label="Features"><input value={form.electricalBike.features} onChange={(e) => update("electricalBike.features", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
          </div>
        );

      case "mechanicalBike":
        return (
          <div className="space-y-3">
            <h5 className="text-sm font-medium">General Features</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Dimensions"><input value={form.mechanicalBike.generalFeatures.dimensions} onChange={(e) => update("mechanicalBike.generalFeatures.dimensions", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="Weight"><input value={form.mechanicalBike.generalFeatures.weight} onChange={(e) => update("mechanicalBike.generalFeatures.weight", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="Engine"><input value={form.mechanicalBike.generalFeatures.engine} onChange={(e) => update("mechanicalBike.generalFeatures.engine", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            </div>

            <h5 className="text-sm font-medium">Performance</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Transmission"><input value={form.mechanicalBike.performance.transmission} onChange={(e) => update("mechanicalBike.performance.transmission", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="Displacement"><input value={form.mechanicalBike.performance.displacement} onChange={(e) => update("mechanicalBike.performance.displacement", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            </div>
          </div>
        );

      case "mobile":
        return (
          <div>
            <h5 className="text-sm font-medium">Mobile / Phone Specs</h5>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <Field label="Connectivity - Data"><input value={form.connectivity.data} onChange={(e) => update("connectivity.data", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
              <Field label="Connectivity - Bluetooth"><input value={form.connectivity.bluetooth} onChange={(e) => update("connectivity.bluetooth", e.target.value)} className="w-full px-3 py-2 border rounded" /></Field>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">Select a category above to expose category-specific specification fields.</div>
        );
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
              <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="">-- Select category --</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
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

          {/* category-specific specs */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Category Specifications</h4>
            <div className="mb-3 text-sm text-gray-600">Selected: {form.category || "None"}</div>
            <div className="bg-gray-50 p-4 rounded border">{renderCategorySpecs(form.category)}</div>
          </div>

          {/* images (with direct upload) */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Product Images (URLs) — upload files directly</h4>
            <div className="space-y-2">
              {form.productImages.map((img, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-24 h-16 border rounded overflow-hidden flex items-center justify-center bg-white">
                    {img === "" && <span className="text-xs text-gray-400">No image</span>}
                    {img === "__UPLOADING__" && <span className="text-xs text-gray-500">Uploading...</span>}
                    {img && img !== "__UPLOADING__" && (
                      <img src={img} alt={`img-${i}`} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelected}
                  />

                  <div className="flex-1">
                    <input value={img} onChange={(e) => updateImage(i, e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="https://... or upload file" />
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={() => triggerFilePickerForIndex(i)} className="px-3 py-1 rounded border text-sm">Upload File</button>
                      <button type="button" onClick={() => removeImage(i)} className="px-3 py-1 rounded border text-sm">Remove</button>
                      <button type="button" onClick={() => updateImage(i, "")} className="px-3 py-1 rounded border text-sm">Clear URL</button>
                    </div>
                    {uploadingIndex === i && <div className="text-xs text-gray-500 mt-1">Uploading image...</div>}
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <button type="button" onClick={addImageSlot} className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded border text-sm">+ Add Image Slot</button>
                <div className="text-sm text-red-600 mt-3">{uploadError}</div>
              </div>
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

          {/* specs (optional) -- mobile fallback also shown above in category specs */}

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
