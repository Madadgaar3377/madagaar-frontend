import React, { useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path
import { getAuthToken } from "../../../utils/auth"; // adjust path
import { useNavigate } from "react-router-dom";
import {
  typeOfProject,
  home,
  plots,
  commercial,
  stage as stageOptions,
  flooring as flooringOptions,
  electricityBackup as electricityOptions,
  powerSupply as powerSupplyOptions,
  pakistaniCities,
} from "../../../constants/PropertiesData"; // adjust path to your exported arrays
import NavbarDashboard from "../Dashboard/Navbar-Dashboard";

const API = (backendBaseUrl || "").replace(/\/$/, "");
const UPLOAD_URL = `${API}/image-upload/single`;
const POST_URL = `${API}/property`; // endpoint that uses createProperty backend function

export default function CreatePropertyForm() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [localFiles, setLocalFiles] = useState([]); // File objects for preview
  const [uploadProgress, setUploadProgress] = useState(0);

  const [form, setForm] = useState({
    projectName: "",
    projectType: "",
    projectDuration: "",
    plottingSize: "",
    stage: "",
    possessionType: "",
    projectInfoOtherDetails: "",
    projectInfoSpecialDetails: "",
    propertyType: "", // e.g. Home / Plots / Commercial etc
    otherPropertyType: "",
    propertyCity: "",
    propertyLocation: "",
    areaSize: "",
    areaUnit: "Marla",
    price: "", // string in schema
    readyForPossission: "",
    advanceAmount: "", // will be converted to Number before sending
    videoUrl: "",
    isInstallment: false,
    noOfInstallment: "",
    monthlyInstallment: "",
    floors: "",
    flooring: "",
    builtInYear: "",
    parkingSpaces: "",
    electricityBackup: "",
    powerSupply: "",
    address: "",
    longitude: "",
    lattitude: "",
    furnished: "",
    view: "",
    wasteDisposal: "",
    otherMainFeatures: "",
    bedRooms: "",
    otherRooms: "",
    bathRooms: "",
    kitchnes: "",
    storeRooms: "",
    drawingRoom: "",
    dinningRoom: "",
    studyRoom: "",
    prayerRoom: "",
    servantQuarter: "",
    loungeOrSittingRoom: "",
    communityLawnOrGarden: "",
    firstAidOrMedicalCenter: "",
    dayCareCenter: "",
    communitySwimmingPool: "",
    kidsPlayArea: "",
    mosque: "",
    communityGym: "",
    barbequeArea: "",
    communityCenter: "",
    otherCommunityFacilities: "",
    nearBySchool: "",
    nearByHospital: "",
    nearByShopingMall: "",
    nearByCollege: "",
    nearByRestuartant: "",
    nearByPublicTransport: "",
    nearByUniversity: "",
    distanceFromAirport: "",
    otherNearByPlaces: "",
    fullName: "",
    mobile: "",
    whatsapp: "",
    email: "",
    anyMessage: "",
    title: "",
    description: "",
    projectImages: [], // array of URLs (uploaded)
  });

  function updateField(key, val) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  // handle selecting multiple files for upload/preview
  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLocalFiles((prev) => [...prev, ...files]);
  }

  function removeLocalFile(idx) {
    setLocalFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeUploadedImage(idx) {
    setForm((prev) => ({
      ...prev,
      projectImages: prev.projectImages.filter((_, i) => i !== idx),
    }));
  }

  // upload a single file to UPLOAD_URL, returns url string
  async function uploadFile(file, token) {
    const fd = new FormData();
    fd.append("image", file); // backend expects 'image' in body
    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const body = await res.json();
    // expected: { url: "https://..." } or similar - adjust if your backend returns different key
    if (body?.url) return body.url;
    if (body?.data?.url) return body.data.url;
    throw new Error(body?.message || "Upload failed");
  }

  // upload all local files
  async function handleUploadAll() {
    if (!localFiles.length) return;
    setUploading(true);
    setError("");
    setUploadProgress(0);
    const token = getAuthToken();
    try {
      const uploadedUrls = [];
      for (let i = 0; i < localFiles.length; i++) {
        const url = await uploadFile(localFiles[i], token);
        uploadedUrls.push(url);
        setUploadProgress(Math.round(((i + 1) / localFiles.length) * 100));
      }
      setForm((prev) => ({
        ...prev,
        projectImages: [...prev.projectImages, ...uploadedUrls],
      }));
      setLocalFiles([]);
      setSuccess("Images uploaded");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  // validate before final submit
  function validateBeforeSubmit() {
    if (!form.projectName || !form.propertyCity || !form.projectImages.length) {
      setError("Please provide project name, city and at least one image.");
      return false;
    }
    // advanceAmount if provided must be number
    if (form.advanceAmount && isNaN(Number(form.advanceAmount))) {
      setError("Advance amount must be a number.");
      return false;
    }
    // price is string per schema — optional
    return true;
  }

  // final submit to backend
  async function handleSubmit(e) {
    e && e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateBeforeSubmit()) return;

    setLoading(true);
    const token = getAuthToken();

    // prepare body: price remains a string (schema expects String)
    const bodyToSend = {
      ...form,
      advanceAmount:
        form.advanceAmount !== "" ? Number(form.advanceAmount) : undefined,
    };

    try {
      const res = await fetch(POST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      const body = await res.json();
      if (body?.success) {
        setSuccess(body.message || "Property created.");
        // optionally navigate to admin list or clear form
        setTimeout(() => navigate("/admin/properties"), 1200);
      } else {
        setError(body?.message || "Failed to create property");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  // step navigation helpers
  function goNext() {
    if (step === 1) {
      // small validation on step 1
      if (!form.projectName || !form.propertyCity) {
        setError("Please fill project name and city before continuing.");
        return;
      }
    }
    setError("");
    setStep((s) => Math.min(3, s + 1));
  }
  function goPrev() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  // auto-subselect subtype arrays if projectType chosen
  const subtypeOptions =
    form.projectType === "Home"
      ? home
      : form.projectType === "Plots"
      ? plots
      : form.projectType === "Commercial"
      ? commercial
      : [];

  return (
    <>
    <NavbarDashboard />
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Create Property
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Fill property details step-by-step. Fields marked * are important.
        </p>

        {/* stepper */}
        <div className="flex items-center gap-3 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div
                className={`w-full h-2 rounded-full ${
                  step >= s ? "bg-[rgb(183,36,42)]" : "bg-gray-200"
                }`}
              />
              <div className="text-xs mt-1 text-center text-gray-500">
                {s === 1 ? "Basic" : s === 2 ? "Details" : "Media & Contact"}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project Name *
                </label>
                <input
                  value={form.projectName}
                  onChange={(e) => updateField("projectName", e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                  placeholder="e.g. Johnson Residencia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <select
                  value={form.propertyCity}
                  onChange={(e) => updateField("propertyCity", e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                >
                  <option value="">Select city</option>
                  {pakistaniCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project Type
                </label>
                <select
                  value={form.projectType}
                  onChange={(e) => updateField("projectType", e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                >
                  <option value="">Select project type</option>
                  {typeOfProject.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Property / Subtype
                </label>
                <select
                  value={form.propertyType}
                  onChange={(e) => updateField("propertyType", e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                >
                  <option value="">Select</option>
                  {subtypeOptions.length
                    ? subtypeOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))
                    : ["Home", "Plot", "Commercial", "Other"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location / Area
                </label>
                <input
                  value={form.propertyLocation}
                  onChange={(e) =>
                    updateField("propertyLocation", e.target.value)
                  }
                  className="mt-1 block w-full border rounded p-2"
                  placeholder="e.g. Johar Town"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (string allowed by schema)
                </label>
                <input
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                  placeholder="e.g. 4,500,000 or 'Contact for price'"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Advance Amount
                </label>
                <input
                  type="number"
                  value={form.advanceAmount}
                  onChange={(e) => updateField("advanceAmount", e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                  placeholder="Numeric"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Is Installment?
                </label>
                <select
                  value={form.isInstallment ? "yes" : "no"}
                  onChange={(e) =>
                    updateField("isInstallment", e.target.value === "yes")
                  }
                  className="mt-1 block w-full border rounded p-2"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Installment
                </label>
                <input
                  value={form.monthlyInstallment}
                  onChange={(e) =>
                    updateField("monthlyInstallment", e.target.value)
                  }
                  className="mt-1 block w-full border rounded p-2"
                  placeholder="e.g. 15000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Installments
                </label>
                <input
                  value={form.noOfInstallment}
                  onChange={(e) => updateField("noOfInstallment", e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                  placeholder="e.g. 12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Floors
                </label>
                <input
                  value={form.floors}
                  onChange={(e) => updateField("floors", e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Flooring
                </label>
                <select
                  value={form.flooring}
                  onChange={(e) => updateField("flooring", e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                >
                  <option value="">Select</option>
                  {flooringOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Electricity Backup
                </label>
                <select
                  value={form.electricityBackup}
                  onChange={(e) =>
                    updateField("electricityBackup", e.target.value)
                  }
                  className="mt-1 block w-full border rounded p-2"
                >
                  <option value="">Select</option>
                  {electricityOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Power Supply
                </label>
                <select
                  value={form.powerSupply}
                  onChange={(e) => updateField("powerSupply", e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                >
                  <option value="">Select</option>
                  {powerSupplyOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Short Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border rounded p-2"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Images (select multiple)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
                {localFiles.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUploadAll}
                      disabled={uploading}
                      className="px-3 py-2 rounded bg-[rgb(183,36,42)] text-white"
                    >
                      {uploading ? `Uploading (${uploadProgress}%)` : "Upload"}
                    </button>
                    <div className="text-sm text-gray-500">
                      {localFiles.length} file(s) ready to upload
                    </div>
                  </div>
                )}

                <div className="mt-3 flex gap-3 overflow-x-auto">
                  {localFiles.map((f, i) => (
                    <div key={i} className="w-28 h-20 border rounded overflow-hidden relative">
                      <img
                        alt={f.name}
                        src={URL.createObjectURL(f)}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeLocalFile(i)}
                        className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  {form.projectImages.map((u, i) => (
                    <div key={i} className="relative w-full h-28 border rounded overflow-hidden">
                      <img src={u} alt={`img-${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700">Contact Name</label>
                  <input value={form.fullName} onChange={e=>updateField("fullName", e.target.value)} className="mt-1 w-full border rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm text-gray-700">Mobile</label>
                  <input value={form.mobile} onChange={e=>updateField("mobile", e.target.value)} className="mt-1 w-full border rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm text-gray-700">Email</label>
                  <input value={form.email} onChange={e=>updateField("email", e.target.value)} className="mt-1 w-full border rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm text-gray-700">Address</label>
                  <input value={form.address} onChange={e=>updateField("address", e.target.value)} className="mt-1 w-full border rounded p-2" />
                </div>
              </div>
            </div>
          )}

          {/* actions */}
          <div className="flex items-center justify-between mt-4">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={goPrev}
                  className="px-3 py-2 rounded border mr-2"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {step < 3 ? (
                <button type="button" onClick={goNext} className="px-4 py-2 bg-[rgb(183,36,42)] text-white rounded">
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[rgb(183,36,42)] text-white rounded"
                >
                  {loading ? "Submitting..." : "Create Property"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
