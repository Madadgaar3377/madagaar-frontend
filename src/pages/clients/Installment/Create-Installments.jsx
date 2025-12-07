import React, { useState, useEffect } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path
import { getAuthToken } from "../../../utils/auth"; // adjust path
import { useNavigate } from "react-router-dom";
import NavbarDashboard from "../Dashboard/Navbar-Dashboard";

const API = (backendBaseUrl || "").replace(/\/$/, "");
const UPLOAD_URL = `${API}/image-upload/single`;
const SUBMIT_URL = `${API}/installmentplan`;

const defaultPlan = {
  planName: "",
  installmentPrice: 0,
  downPayment: 0,
  monthlyInstallment: 0,
  tenureMonths: 0,
  interestRatePercent: 0,
  interestType: "Flat Rate",
  markup: 0,
  otherChargesNote: "",
};

const CATEGORY_OPTIONS = [
  { value: "", label: "Select category" },
  { value: "phones", label: "Phones / Mobile" },
  { value: "bikes_mechanical", label: "Bikes — Mechanical" },
  { value: "bikes_electric", label: "Bikes — Electric" },
  { value: "air_conditioner", label: "Air Conditioner" },
  { value: "appliances", label: "Home Appliances / Other" },
  { value: "other", label: "Other (custom)" },
];

export default function CreateInstallmentPlan() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productName: "",
    city: "",
    price: "",
    downpayment: "",
    installment: "",
    tenure: "",
    customTenure: "",
    postedBy: "",
    videoUrl: "",
    description: "",
    companyName: "",
    companyNameOther: "",
    category: "",
    customCategory: "",
    status: "pending",
    productImages: [],
    paymentPlans: [{ ...defaultPlan }],
    // mobile / product specs
    generalFeatures: {
      operatingSystem: "",
      simSupport: "",
      phoneDimensions: "",
      phoneWeight: "",
      colors: "",
    },
    performance: { processor: "", gpu: "" },
    display: { screenSize: "", screenResolution: "", technology: "", protection: "" },
    battery: { type: "" },
    camera: { frontCamera: "", backCamera: "", features: "" },
    memory: { internalMemory: "", ram: "", cardSlot: "" },
    connectivity: { data: "", nfc: "", bluetooth: "", infrared: "" },

    // AC
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

    // electrical bike (added fields preserved, plus new fields from schema)
    electricalBike: {
      // General Features
      model: "",
      dimensions: "",
      weight: "",
      speed: "",
      batterySpec: "",
      chargingTime: "",
      brakes: "",
      warranty: "",

      // Performance
      transmission: "",
      rangeKm: "",
      groundClearance: "",
      starting: "",
      motor: "",
      motorRatedPower: "",
      controllers: "",
      electricityConsumption: "",

      // Assembly / other specs
      recommendedLoadCapacity: "",
      wheelBase: "",
      shocks: "",
      tyreFront: "",
      tyreBack: "",
      otherFeatures: "",
      maxDistanceRange: "",
      rimsTiresFront: "",
      rimsTiresBack: "",
      meter: "",
      maxLoad: "",
      dryWeight: "",
      vehicleDimensions: "",
      features: "",
      colors: "",
    },

    // mechanical bike (added model and engine kept)
    mechanicalBike: {
      generalFeatures: {
        model: "",
        dimensions: "",
        weight: "",
        engine: "",
        colors: "",
        other: "",
      },
      performance: {
        transmission: "",
        groundClearance: "",
        starting: "",
        displacement: "",
        petrolCapacity: "",
      },
      assembly: {
        compressionRatio: "",
        boreAndStroke: "",
        tyreAtFront: "",
        tyreAtBack: "",
        seatHeight: "",
      },
    },
  });

  const [localImages, setLocalImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // helper to update nested path safely (supports dotted paths)
  function updateForm(path, value) {
    if (!path) return;
    if (path.includes(".")) {
      const parts = path.split(".");
      setForm((prev) => {
        const copy = JSON.parse(JSON.stringify(prev)); // simple deep copy
        let cur = copy;
        for (let i = 0; i < parts.length - 1; i++) {
          if (cur[parts[i]] === undefined) cur[parts[i]] = {};
          cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = value;
        return copy;
      });
      return;
    }
    setForm((f) => ({ ...f, [path]: value }));
  }

  function updatePaymentPlan(index, key, value) {
    setForm((f) => {
      const pp = [...(f.paymentPlans || [])];
      pp[index] = { ...pp[index], [key]: value };
      return { ...f, paymentPlans: pp };
    });
  }

  function addPaymentPlan() {
    setForm((f) => ({ ...f, paymentPlans: [...(f.paymentPlans || []), { ...defaultPlan }] }));
  }

  function removePaymentPlan(idx) {
    setForm((f) => ({ ...f, paymentPlans: f.paymentPlans.filter((_, i) => i !== idx) }));
  }

  function handleFilesChange(e) {
    const files = Array.from(e.target.files || []);
    setLocalImages((prev) => [...prev, ...files]);
  }

  function removeLocalImage(idx) {
    setLocalImages((s) => s.filter((_, i) => i !== idx));
  }

  async function uploadSingleFile(file) {
    const token = getAuthToken?.();
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed: ${res.status} ${text}`);
    }
    const body = await res.json().catch(() => null);
    if (body?.url) return body.url;
    if (body?.data?.url) return body.data.url;
    if (body?.data && typeof body.data === "string") return body.data;
    if (body?.success && body?.data && Array.isArray(body.data) && body.data[0]) return body.data[0];
    if (body && typeof body === "object") {
      const str = Object.values(body).find((v) => typeof v === "string" && v.startsWith("http"));
      if (str) return str;
    }
    throw new Error("Unexpected upload response");
  }

  async function handleUploadAll() {
    if (!localImages.length) return [];
    setUploading(true);
    setError(null);
    try {
      const urls = [];
      for (let i = 0; i < localImages.length; i++) {
        const u = await uploadSingleFile(localImages[i]);
        urls.push(u);
      }
      setForm((f) => ({ ...f, productImages: [...(f.productImages || []), ...urls] }));
      setLocalImages([]);
      setMessage("Images uploaded successfully.");
      return urls;
    } catch (err) {
      console.error("upload error", err);
      setError(err.message || "Image upload failed.");
      throw err;
    } finally {
      setUploading(false);
    }
  }

  function removeUploadedImage(idx) {
    setForm((f) => ({ ...f, productImages: f.productImages.filter((_, i) => i !== idx) }));
  }

  // --- installment calculation helpers ---

  // amortization formula (monthly rate) for reducing/compound interest
  function amortizedMonthlyPayment(principal, annualInterestPercent, months) {
    if (!months || months <= 0) return 0;
    const r = Number(annualInterestPercent) / 100 / 12;
    if (!r) return principal / months;
    const monthly = (principal * r) / (1 - Math.pow(1 + r, -months));
    return monthly;
  }

  // flat rate interest: interest calculated on original principal for full term
  function flatRateMonthlyPayment(principal, annualInterestPercent, months) {
    if (!months || months <= 0) return 0;
    const years = months / 12;
    const totalInterest = (principal * (Number(annualInterestPercent) / 100) * years);
    const totalPayable = principal + totalInterest;
    return totalPayable / months;
  }

  // Calculate a single plan based on current form values and plan fields
  function calcPlanValues(planIndex) {
    const p = form.paymentPlans[planIndex];
    const rawPrice = parseFloat(form.price) || 0;
    // product-level downpayment used as source of truth; plan-level downPayment will be calculated and shown (not editable)
    const productDown = parseFloat(form.downpayment || 0);
    const markupAmount = parseFloat(p.markup || 0) || 0;

    const principal = Math.max(0, rawPrice - productDown + markupAmount);
    const months = parseInt(p.tenureMonths || 0, 10) || 0;
    const rate = parseFloat(p.interestRatePercent || 0) || 0;

    let monthly = 0;
    if (months <= 0) {
      monthly = 0;
    } else if (p.interestType === "Flat Rate") {
      monthly = flatRateMonthlyPayment(principal, rate, months);
    } else {
      monthly = amortizedMonthlyPayment(principal, rate, months);
    }

    const installmentPrice = Number((monthly * months).toFixed(2));
    const totalInterest = Number((installmentPrice - principal).toFixed(2));

    return {
      monthlyInstallment: Number(monthly.toFixed(2)),
      installmentPrice,
      principal: Number(principal.toFixed(2)),
      totalInterest,
      downPayment: Number(productDown || 0),
    };
  }

  // Recalculate a plan and update form state (monthly & downPayment become computed read-only values)
  function recalcPlan(index) {
    setForm((f) => {
      const pp = [...(f.paymentPlans || [])];
      const p = pp[index] || { ...defaultPlan };

      const rawPrice = parseFloat(f.price) || 0;
      const productDown = parseFloat(f.downpayment || 0);
      const markupAmount = parseFloat(p.markup || 0) || 0;
      const principal = Math.max(0, rawPrice - productDown + markupAmount);
      const months = parseInt(p.tenureMonths || 0, 10) || 0;
      const rate = parseFloat(p.interestRatePercent || 0) || 0;

      let monthly = 0;
      if (months <= 0) monthly = 0;
      else if (p.interestType === "Flat Rate") monthly = flatRateMonthlyPayment(principal, rate, months);
      else monthly = amortizedMonthlyPayment(principal, rate, months);

      const installmentPrice = Number((monthly * months).toFixed(2));
      const totalInterest = Number((installmentPrice - principal).toFixed(2));

      pp[index] = {
        ...pp[index],
        monthlyInstallment: Number(monthly.toFixed(2)),
        installmentPrice,
        principal: Number(principal.toFixed(2)),
        totalInterest,
        downPayment: Number(productDown || 0), // calculated, not editable when added
      };

      return { ...f, paymentPlans: pp };
    });
  }

  // Recalc all plans whenever price or product-level downpayment changes
  useEffect(() => {
    if (!form.paymentPlans || !form.paymentPlans.length) return;
    form.paymentPlans.forEach((_, idx) => recalcPlan(idx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.price, form.downpayment]);

  // Validation per step
  function validateStep(currentStep = step) {
    const errs = [];
    if (currentStep === 1) {
      if (!form.productName || form.productName.trim().length < 3) errs.push("Product name min 3 chars.");
      if (!form.price || Number(form.price) <= 0) errs.push("Price must be > 0.");
      if (!form.category) errs.push("Select category.");
    }
    if (currentStep === 2) {
      if (form.category === "phones") {
        if (!form.generalFeatures.operatingSystem) errs.push("Operating system required.");
        if (!form.performance.processor) errs.push("Processor required.");
        if (!form.display.screenSize) errs.push("Screen size required.");
        if (!form.memory.internalMemory) errs.push("Internal memory required.");
      }
      // add other category checks if needed
    }
    if (currentStep === 3) {
      // images optional — no validation
    }
    if (currentStep === 4) {
      if (!form.paymentPlans || !form.paymentPlans.length) errs.push("At least one payment plan required.");
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // final validation: run all steps' validations
    for (let s = 1; s <= totalSteps; s++) {
      const v = validateStep(s);
      if (v.length) {
        setError(`Step ${s} error: ${v.join(" ")}`);
        setStep(s);
        return;
      }
    }

    setSubmitting(true);
    try {
      // if local images selected, upload them first
      if (localImages.length > 0) {
        await handleUploadAll();
      }

      const body = {
        productName: form.productName,
        city: form.city,
        price: parseInt(form.price || 0),
        downpayment: parseInt(form.downpayment || 0),
        installment: parseInt(form.installment || 0),
        tenure: form.tenure,
        customTenure: form.customTenure,
        postedBy: form.postedBy,
        videoUrl: form.videoUrl,
        description: form.description,
        companyName: form.companyName,
        companyNameOther: form.companyNameOther,
        category: form.category === "other" ? form.customCategory || "" : form.category,
        customCategory: form.customCategory,
        status: "approved",
        productImages: form.productImages,
        paymentPlans: Array.isArray(form.paymentPlans)
          ? form.paymentPlans.map((p) => ({
              planName: p.planName || "",
              installmentPrice: Number(p.installmentPrice) || 0,
              downPayment: Number(p.downPayment) || 0,
              monthlyInstallment: Number(p.monthlyInstallment) || 0,
              tenureMonths: parseInt(p.tenureMonths || 0),
              interestRatePercent: Number(p.interestRatePercent || 0),
              interestType: p.interestType || "Flat Rate",
              markup: Number(p.markup || 0),
              otherChargesNote: p.otherChargesNote || "",
            }))
          : [],
        generalFeatures: form.generalFeatures,
        performance: form.performance,
        display: form.display,
        battery: form.battery,
        camera: form.camera,
        memory: form.memory,
        connectivity: form.connectivity,
        airConditioner: form.airConditioner,
        electricalBike: form.electricalBike,
        mechanicalBike: form.mechanicalBike,
      };

      const token = getAuthToken?.();

      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const resBody = await res.json().catch(() => null);

      if (!res.ok || !resBody?.success) {
        throw new Error(resBody?.message || resBody?.error?.serverError || `Submit failed (${res.status})`);
      }

      setMessage("Installment Plan created successfully.");
      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      console.error("submit error", err);
      setError(err.message || "Failed to submit installment plan.");
    } finally {
      setSubmitting(false);
    }
  }

  // Render mobile-specific full form
  function renderMobileFields() {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-medium">Mobile — Full specifications</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <div className="text-xs text-gray-500">Operating System</div>
            <input value={form.generalFeatures.operatingSystem} onChange={(e)=>updateForm("generalFeatures.operatingSystem", e.target.value)} placeholder="e.g. Android 14" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">SIM Support</div>
            <input value={form.generalFeatures.simSupport} onChange={(e)=>updateForm("generalFeatures.simSupport", e.target.value)} placeholder="e.g. Dual SIM" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">Processor</div>
            <input value={form.performance.processor} onChange={(e)=>updateForm("performance.processor", e.target.value)} placeholder="e.g. Snapdragon 8 Gen 3" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">GPU</div>
            <input value={form.performance.gpu} onChange={(e)=>updateForm("performance.gpu", e.target.value)} placeholder="GPU" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">Screen Size</div>
            <input value={form.display.screenSize} onChange={(e)=>updateForm("display.screenSize", e.target.value)} placeholder="e.g. 6.7 inch" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">Screen Resolution</div>
            <input value={form.display.screenResolution} onChange={(e)=>updateForm("display.screenResolution", e.target.value)} placeholder="e.g. 1080x2400" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">Display Tech / Protection</div>
            <input value={form.display.technology} onChange={(e)=>updateForm("display.technology", e.target.value)} placeholder="e.g. AMOLED, Gorilla Glass" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">Battery</div>
            <input value={form.battery.type} onChange={(e)=>updateForm("battery.type", e.target.value)} placeholder="e.g. 5000 mAh, Fast charge 120W" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">Front Camera</div>
            <input value={form.camera.frontCamera} onChange={(e)=>updateForm("camera.frontCamera", e.target.value)} placeholder="e.g. 16 MP" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">Back Camera</div>
            <input value={form.camera.backCamera} onChange={(e)=>updateForm("camera.backCamera", e.target.value)} placeholder="e.g. 50 MP + 8 MP" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block col-span-1 sm:col-span-2">
            <div className="text-xs text-gray-500">Camera Features</div>
            <input value={form.camera.features} onChange={(e)=>updateForm("camera.features", e.target.value)} placeholder="e.g. OIS, Night mode" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">Internal Memory</div>
            <input value={form.memory.internalMemory} onChange={(e)=>updateForm("memory.internalMemory", e.target.value)} placeholder="e.g. 128 GB" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">RAM</div>
            <input value={form.memory.ram} onChange={(e)=>updateForm("memory.ram", e.target.value)} placeholder="e.g. 8 GB" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">Card Slot</div>
            <input value={form.memory.cardSlot} onChange={(e)=>updateForm("memory.cardSlot", e.target.value)} placeholder="e.g. microSD upto 1TB" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">Connectivity (data)</div>
            <input value={form.connectivity.data} onChange={(e)=>updateForm("connectivity.data", e.target.value)} placeholder="e.g. 5G, LTE" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block">
            <div className="text-xs text-gray-500">NFC / Bluetooth / Infrared</div>
            <input value={form.connectivity.nfc} onChange={(e)=>updateForm("connectivity.nfc", e.target.value)} placeholder="e.g. NFC: Yes, Bluetooth 5.3" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block col-span-1 sm:col-span-2">
            <div className="text-xs text-gray-500">Colors / Finishes</div>
            <input value={form.generalFeatures.colors} onChange={(e)=>updateForm("generalFeatures.colors", e.target.value)} placeholder="e.g. Black, Blue" className="px-3 py-2 border rounded w-full" />
          </label>

          <label className="block col-span-1 sm:col-span-2">
            <div className="text-xs text-gray-500">Short Description (if any)</div>
            <input value={form.description} onChange={(e)=>updateForm("description", e.target.value)} placeholder="Short product highlights" className="px-3 py-2 border rounded w-full" />
          </label>
        </div>
      </section>
    );
  }

  // Render category step content
  function renderCategoryStep() {
    if (!form.category) {
      return <div className="text-sm text-gray-500">Choose a category in step 1 to see category-specific fields here.</div>;
    }
    if (form.category === "phones") {
      return renderMobileFields();
    }
    if (form.category === "bikes_mechanical") {
      return (
        <section>
          <h3 className="text-sm font-medium">Mechanical Bike Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <input value={form.mechanicalBike.generalFeatures.model} onChange={(e)=>updateForm("mechanicalBike.generalFeatures.model", e.target.value)} placeholder="Model (e.g. 2015)" className="px-3 py-2 border rounded w-full" />
            <input value={form.mechanicalBike.generalFeatures.dimensions} onChange={(e)=>updateForm("mechanicalBike.generalFeatures.dimensions", e.target.value)} placeholder="Dimensions (L x W x H)" className="px-3 py-2 border rounded w-full" />
            <input value={form.mechanicalBike.generalFeatures.weight} onChange={(e)=>updateForm("mechanicalBike.generalFeatures.weight", e.target.value)} placeholder="Weight (e.g. 82kg)" className="px-3 py-2 border rounded w-full" />
            <input value={form.mechanicalBike.generalFeatures.engine} onChange={(e)=>updateForm("mechanicalBike.generalFeatures.engine", e.target.value)} placeholder="Engine (e.g. 4-Stroke , OHC Air Cooled)" className="px-3 py-2 border rounded w-full" />

            <input value={form.mechanicalBike.performance.transmission} onChange={(e)=>updateForm("mechanicalBike.performance.transmission", e.target.value)} placeholder="Transmission (e.g. 4 Speed Constant Mesh)" className="px-3 py-2 border rounded w-full" />
            <input value={form.mechanicalBike.performance.groundClearance} onChange={(e)=>updateForm("mechanicalBike.performance.groundClearance", e.target.value)} placeholder="Ground Clearance (e.g. 136 mm)" className="px-3 py-2 border rounded w-full" />
            <input value={form.mechanicalBike.performance.starting} onChange={(e)=>updateForm("mechanicalBike.performance.starting", e.target.value)} placeholder="Starting (e.g. Kick Starter)" className="px-3 py-2 border rounded w-full" />
            <input value={form.mechanicalBike.performance.displacement} onChange={(e)=>updateForm("mechanicalBike.performance.displacement", e.target.value)} placeholder="Displacement (e.g. 72 cm3)" className="px-3 py-2 border rounded w-full" />

            <input value={form.mechanicalBike.performance.petrolCapacity} onChange={(e)=>updateForm("mechanicalBike.performance.petrolCapacity", e.target.value)} placeholder="Petrol Capacity (e.g. 8.6 Liters)" className="px-3 py-2 border rounded w-full" />

            <input value={form.mechanicalBike.assembly.compressionRatio} onChange={(e)=>updateForm("mechanicalBike.assembly.compressionRatio", e.target.value)} placeholder="Compression Ratio (e.g. 8.8:1)" className="px-3 py-2 border rounded w-full" />
            <input value={form.mechanicalBike.assembly.boreAndStroke} onChange={(e)=>updateForm("mechanicalBike.assembly.boreAndStroke", e.target.value)} placeholder="Bore and Stroke (e.g. 47.0 x 41.4 mm)" className="px-3 py-2 border rounded w-full" />
            <input value={form.mechanicalBike.assembly.tyreAtFront} onChange={(e)=>updateForm("mechanicalBike.assembly.tyreAtFront", e.target.value)} placeholder="Tyre at Front (e.g. 2.25 – 17)" className="px-3 py-2 border rounded w-full" />
            <input value={form.mechanicalBike.assembly.tyreAtBack} onChange={(e)=>updateForm("mechanicalBike.assembly.tyreAtBack", e.target.value)} placeholder="Tyre at Back (e.g. 2.50 – 17)" className="px-3 py-2 border rounded w-full" />
            <input value={form.mechanicalBike.assembly.seatHeight} onChange={(e)=>updateForm("mechanicalBike.assembly.seatHeight", e.target.value)} placeholder="Seat Height (e.g. N/A)" className="px-3 py-2 border rounded w-full" />

            <input value={form.mechanicalBike.generalFeatures.colors} onChange={(e)=>updateForm("mechanicalBike.generalFeatures.colors", e.target.value)} placeholder="Colors" className="px-3 py-2 border rounded w-full" />
          </div>
        </section>
      );
    }
    if (form.category === "bikes_electric") {
      return (
        <section>
          <h3 className="text-sm font-medium">Electric Bike Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <input value={form.electricalBike.model} onChange={(e)=>updateForm("electricalBike.model", e.target.value)} placeholder="Model (e.g. 2025)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.dimensions} onChange={(e)=>updateForm("electricalBike.dimensions", e.target.value)} placeholder="Dimensions (e.g. 1680 × 680 × 1080 mm)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.weight} onChange={(e)=>updateForm("electricalBike.weight", e.target.value)} placeholder="Weight (e.g. 75 kg)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.speed} onChange={(e)=>updateForm("electricalBike.speed", e.target.value)} placeholder="Speed (e.g. 35–45 km/h)" className="px-3 py-2 border rounded w-full" />

            <input value={form.electricalBike.batterySpec} onChange={(e)=>updateForm("electricalBike.batterySpec", e.target.value)} placeholder="Battery (e.g. Graphene Battery 48V 26AH)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.chargingTime} onChange={(e)=>updateForm("electricalBike.chargingTime", e.target.value)} placeholder="Charging Time (e.g. 9.5 hours)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.brakes} onChange={(e)=>updateForm("electricalBike.brakes", e.target.value)} placeholder="Brakes (e.g. Front Disc; Rear Drum)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.warranty} onChange={(e)=>updateForm("electricalBike.warranty", e.target.value)} placeholder="Warranty (e.g. 24 months / 20,000 km)" className="px-3 py-2 border rounded w-full" />

            <input value={form.electricalBike.transmission} onChange={(e)=>updateForm("electricalBike.transmission", e.target.value)} placeholder="Transmission (e.g. Automatic (Electric Drive))" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.rangeKm} onChange={(e)=>updateForm("electricalBike.rangeKm", e.target.value)} placeholder="Range (e.g. 60 km)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.groundClearance} onChange={(e)=>updateForm("electricalBike.groundClearance", e.target.value)} placeholder="Ground Clearance (e.g. 140 mm)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.starting} onChange={(e)=>updateForm("electricalBike.starting", e.target.value)} placeholder="Starting (e.g. Electric Start)" className="px-3 py-2 border rounded w-full" />

            <input value={form.electricalBike.motor} onChange={(e)=>updateForm("electricalBike.motor", e.target.value)} placeholder="Motor (e.g. 500 W)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.controllers} onChange={(e)=>updateForm("electricalBike.controllers", e.target.value)} placeholder="Controllers (e.g. 9 Tube 25 A)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.electricityConsumption} onChange={(e)=>updateForm("electricalBike.electricityConsumption", e.target.value)} placeholder="Electricity Consumption (e.g. 1.56 Units/KWH)" className="px-3 py-2 border rounded w-full" />

            <input value={form.electricalBike.recommendedLoadCapacity} onChange={(e)=>updateForm("electricalBike.recommendedLoadCapacity", e.target.value)} placeholder="Recommended Load Capacity (e.g. 150 kg)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.wheelBase} onChange={(e)=>updateForm("electricalBike.wheelBase", e.target.value)} placeholder="Wheel Base (e.g. 1220 mm)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.shocks} onChange={(e)=>updateForm("electricalBike.shocks", e.target.value)} placeholder="Shocks (e.g. Front & Rear Hydraulic Suspension)" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.tyreFront} onChange={(e)=>updateForm("electricalBike.tyreFront", e.target.value)} placeholder="Tyre at Front (e.g. 3.0–10)" className="px-3 py-2 border rounded w-full" />

            <input value={form.electricalBike.tyreBack} onChange={(e)=>updateForm("electricalBike.tyreBack", e.target.value)} placeholder="Tyre at Back (e.g. 3.0–10)" className="px-3 py-2 border rounded w-full" />

            <input value={form.electricalBike.otherFeatures} onChange={(e)=>updateForm("electricalBike.otherFeatures", e.target.value)} placeholder="Other Features" className="px-3 py-2 border rounded w-full" />
            <input value={form.electricalBike.colors} onChange={(e)=>updateForm("electricalBike.colors", e.target.value)} placeholder="Colors" className="px-3 py-2 border rounded w-full" />
          </div>
        </section>
      );
    }
    if (form.category === "air_conditioner") {
      return (
        <section>
          <h3 className="text-sm font-medium">Air Conditioner Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <input value={form.airConditioner.brand} onChange={(e)=>updateForm("airConditioner.brand", e.target.value)} placeholder="Brand" className="px-3 py-2 border rounded w-full" />
            <input value={form.airConditioner.capacityInTon} onChange={(e)=>updateForm("airConditioner.capacityInTon", e.target.value)} placeholder="Capacity (ton)" className="px-3 py-2 border rounded w-full" />
            <input value={form.airConditioner.energyEfficient} onChange={(e)=>updateForm("airConditioner.energyEfficient", e.target.value)} placeholder="Energy rating" className="px-3 py-2 border rounded w-full" />
          </div>
        </section>
      );
    }
    // default
    return (
      <section>
        <h3 className="text-sm font-medium">Product Details</h3>
        <div className="mt-3">
          <input value={form.generalFeatures.phoneDimensions} onChange={(e)=>updateForm("generalFeatures.phoneDimensions", e.target.value)} placeholder="Dimensions / Size" className="px-3 py-2 border rounded w-full" />
          <input value={form.generalFeatures.colors} onChange={(e)=>updateForm("generalFeatures.colors", e.target.value)} placeholder="Colors / Finishes" className="mt-2 px-3 py-2 border rounded w-full" />
        </div>
      </section>
    );
  }

  // Step navigation
  function goNext() {
    setError(null);
    const errs = validateStep(step);
    if (errs.length) {
      setError(errs.join(" "));
      return;
    }
    setStep((s) => Math.min(totalSteps, s + 1));
  }
  function goPrev() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  // small UI: step title
  function stepTitle(s) {
    switch (s) {
      case 1: return "Basic Info";
      case 2: return "Category Details";
      case 3: return "Images";
      case 4: return "Payment Plans & Submit";
      default: return "";
    }
  }

  return (
    <>
      <NavbarDashboard />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-gray-800">Create Installment Plan</h1>
            <p className="text-sm text-gray-500">Wizard: fill step-by-step. Use Back / Next to navigate. Monthly & Downpayment are calculated and shown (not editable) per plan.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            {/* progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">{stepTitle(step)}</div>
                <div className="text-xs text-gray-500">Step {step} of {totalSteps}</div>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${(step/totalSteps)*100}%` }} className="h-2 bg-[rgb(183,36,42)]"></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="block">
                      <div className="text-xs text-gray-500 mb-1">Product Name *</div>
                      <input required value={form.productName} onChange={(e)=>updateForm("productName", e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="e.g. Honda CG 125 2025" />
                    </label>

                    <label className="block">
                      <div className="text-xs text-gray-500 mb-1">Category *</div>
                      <select required value={form.category} onChange={(e)=>updateForm("category", e.target.value)} className="w-full px-3 py-2 border rounded">
                        {CATEGORY_OPTIONS.map((opt)=>(
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {form.category === "other" && (
                        <input value={form.customCategory} onChange={(e)=>updateForm("customCategory", e.target.value)} placeholder="Enter custom category" className="mt-2 w-full px-3 py-2 border rounded" />
                      )}
                    </label>

                    <label className="block">
                      <div className="text-xs text-gray-500 mb-1">Brand / Company</div>
                      <input value={form.companyName} onChange={(e)=>updateForm("companyName", e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="e.g. Honda" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <label>
                      <div className="text-xs text-gray-500 mb-1">Price (PKR) *</div>
                      <input required type="number" value={form.price} onChange={(e)=>updateForm("price", e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </label>

                    <label>
                      <div className="text-xs text-gray-500 mb-1">Downpayment (product-level)</div>
                      <input type="number" value={form.downpayment} onChange={(e)=>updateForm("downpayment", e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </label>

                    <label>
                      <div className="text-xs text-gray-500 mb-1">Monthly Installment (product-level)</div>
                      <input type="number" value={form.installment} onChange={(e)=>updateForm("installment", e.target.value)} className="w-full px-3 py-2 border rounded" />
                    </label>

                    <label>
                      <div className="text-xs text-gray-500 mb-1">Tenure</div>
                      <input value={form.tenure} onChange={(e)=>updateForm("tenure", e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="e.g. 12 months" />
                    </label>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Short Description</div>
                    <textarea value={form.description} onChange={(e)=>updateForm("description", e.target.value)} rows={3} className="w-full px-3 py-2 border rounded" />
                  </div>
                </div>
              )}

              {/* Step 2: Category-specific */}
              {step === 2 && (
                <div className="space-y-4">
                  {renderCategoryStep()}
                </div>
              )}

              {/* Step 3: Images */}
              {step === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-500">Product Images</div>
                    <div className="text-xs text-gray-400">Upload & preview</div>
                  </div>

                  {localImages.length > 0 && (
                    <div className="flex gap-3 mb-3 overflow-x-auto">
                      {localImages.map((f,i)=>(
                        <div key={i} className="w-28 h-20 relative rounded overflow-hidden border">
                          <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                          <button type="button" onClick={()=>removeLocalImage(i)} className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 text-xs">×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 items-center flex-wrap">
                    <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="text-sm" />
                    <button type="button" disabled={!localImages.length || uploading} onClick={handleUploadAll} className="px-3 py-1 rounded bg-[rgb(183,36,42)] text-white text-sm">
                      {uploading ? "Uploading..." : `Upload ${localImages.length ? `(${localImages.length})` : ""}`}
                    </button>
                  </div>

                  {form.productImages && form.productImages.length > 0 && (
                    <div className="mt-3 flex gap-3 overflow-x-auto">
                      {form.productImages.map((url, idx)=>(
                        <div key={idx} className="w-28 h-20 relative rounded overflow-hidden border">
                          <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={()=>removeUploadedImage(idx)} className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 text-xs">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Payment Plans & Submit */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-700">Payment Plans</div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={addPaymentPlan} className="text-sm px-3 py-1 rounded border">Add Plan</button>
                      <div className="text-xs text-gray-500">Click "Add Plan" to create another payment option</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {form.paymentPlans.map((p, idx)=>(
                      <div key={idx} className="p-3 rounded border bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-gray-600">Plan #{idx + 1}</div>
                          <div className="flex gap-2">
                            {form.paymentPlans.length > 1 && <button type="button" onClick={()=>removePaymentPlan(idx)} className="text-xs px-2 py-1 rounded border">Remove</button>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input value={p.planName} onChange={(e)=>updatePaymentPlan(idx,"planName",e.target.value)} placeholder="Plan name (e.g. 12 months)" className="px-3 py-2 border rounded" />

                          {/* Monthly Installment: SHOW ONLY (not editable) */}
                          <input
                            type="number"
                            value={p.monthlyInstallment || 0}
                            readOnly
                            disabled
                            placeholder="Monthly installment (calculated)"
                            className="px-3 py-2 border rounded bg-gray-100"
                          />

                          {/* Down Payment: SHOW ONLY (not editable). Uses product-level downpayment as source */}
                          <input
                            type="number"
                            value={p.downPayment || 0}
                            readOnly
                            disabled
                            placeholder="Down payment (calculated)"
                            className="px-3 py-2 border rounded bg-gray-100"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          <input type="number" value={p.tenureMonths} onChange={(e)=>{updatePaymentPlan(idx,"tenureMonths",e.target.value); setTimeout(()=>recalcPlan(idx), 0);}} placeholder="Tenure months" className="px-3 py-2 border rounded" />
                          <input type="number" value={p.interestRatePercent} onChange={(e)=>{updatePaymentPlan(idx,"interestRatePercent",e.target.value); setTimeout(()=>recalcPlan(idx), 0);}} placeholder="Interest % (e.g. 12.5)" className="px-3 py-2 border rounded" />
                          <select value={p.interestType} onChange={(e)=>{updatePaymentPlan(idx,"interestType",e.target.value); setTimeout(()=>recalcPlan(idx), 0);}} className="px-3 py-2 border rounded">
                            <option>Flat Rate</option>
                            <option>Reducing Balance</option>
                            <option>Compound Interest</option>
                            <option>Profit-Based (Islamic/Shariah)</option>
                          </select>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input type="number" value={p.markup} onChange={(e)=>{updatePaymentPlan(idx,"markup",e.target.value); setTimeout(()=>recalcPlan(idx), 0);}} placeholder="Markup (absolute amount)" className="px-3 py-2 border rounded w-full" />

                          <div className="flex items-center gap-2">
                            <button type="button" onClick={()=>recalcPlan(idx)} className="px-3 py-2 rounded border text-sm">Auto-calc</button>
                            <div className="text-xs text-gray-500">(calculate monthly & totals)</div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <input value={p.otherChargesNote} onChange={(e)=>updatePaymentPlan(idx,"otherChargesNote",e.target.value)} placeholder="Other charges / notes" className="px-3 py-2 border rounded w-full" />
                        </div>

                        {/* summary */}
                        <div className="mt-3 text-sm bg-white p-2 rounded border">
                          <div className="flex justify-between"><div>Principal (price - down + markup)</div><div>{Number(p.principal || 0).toLocaleString()}</div></div>
                          <div className="flex justify-between"><div>Total Interest</div><div>{Number(p.totalInterest || 0).toLocaleString()}</div></div>
                          <div className="flex justify-between"><div>Total Payable</div><div>{Number(p.installmentPrice || 0).toLocaleString()}</div></div>
                          <div className="flex justify-between"><div>Monthly</div><div>{Number(p.monthlyInstallment || 0).toLocaleString()}</div></div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* navigation & submit */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={goPrev} disabled={step === 1} className={`px-4 py-2 border rounded ${step===1 ? "opacity-50 cursor-not-allowed":""}`}>Back</button>
                  {step < totalSteps && <button type="button" onClick={goNext} className="px-4 py-2 rounded bg-[rgb(183,36,42)] text-white">Next</button>}
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={()=>{
                    setForm({
                      ...form,
                      productName:'', city:'', price:'', productImages:[], paymentPlans:[{...defaultPlan}],
                    });
                    setLocalImages([]);
                    setStep(1);
                    setError(null);
                    setMessage(null);
                  }} className="px-4 py-2 border rounded">Reset</button>

                  {step === totalSteps && (
                    <button type="submit" disabled={submitting || uploading} className="px-4 py-2 rounded bg-[rgb(183,36,42)] text-white">
                      {submitting ? "Submitting..." : "Create Installment Plan"}
                    </button>
                  )}
                </div>
              </div>

              {/* messages */}
              {message && <div className="text-sm text-green-600">{message}</div>}
              {error && <div className="text-sm text-red-600">{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
