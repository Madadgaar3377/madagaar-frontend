import React, { useEffect, useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path
import { getAuthToken } from "../../../utils/auth"; // adjust path
import { useParams, useNavigate } from "react-router-dom";
import NavbarDashboard from "../Dashboard/Navbar-Dashboard";
import LoadingPage from "../../../compontents/Loader";

const API = backendBaseUrl.replace(/\/$/, "");
const GET_URL = `${API}/installmentplan/get/public/`;
const UPDATE_URL = `${API}/installmentplan/update/`;
const UPLOAD_URL = `${API}/image-upload/single`;

const emptyPlan = {
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

export default function UpdateInstallmentPlan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localImages, setLocalImages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    productName: "",
    city: "",
    price: "",
    downpayment: "",
    installment: "",
    tenure: "",
    customTenure: "",
    companyName: "",
    category: "",
    status: "pending",
    description: "",
    videoUrl: "",
    productImages: [],
    paymentPlans: [emptyPlan],
  });

  // Fetch existing data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${GET_URL}${encodeURIComponent(id)}`);
        const body = await res.json();

        if (!body.success || !body.data) {
          setError("Failed to fetch installment plan");
          return;
        }

        const d = body.data;

        setForm({
          productName: d.productName || "",
          city: d.city || "",
          price: d.price || "",
          downpayment: d.downpayment || "",
          installment: d.installment || "",
          tenure: d.tenure || "",
          customTenure: d.customTenure || "",
          companyName: d.companyName || "",
          category: d.category || "",
          status: d.status || "pending",
          description: d.description || "",
          videoUrl: d.videoUrl || "",
          productImages: d.productImages || [],
          paymentPlans: d.paymentPlans?.length ? d.paymentPlans : [emptyPlan],
        });

        setLoading(false);
      } catch (err) {
        setError("Failed to load data");
      }
    }
    fetchData();
  }, [id]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updatePlan(index, key, value) {
    setForm((prev) => {
      const copy = [...prev.paymentPlans];
      copy[index][key] = value;
      return { ...prev, paymentPlans: copy };
    });
  }

  function addPlan() {
    setForm((prev) => ({
      ...prev,
      paymentPlans: [...prev.paymentPlans, { ...emptyPlan }],
    }));
  }

  function removePlan(idx) {
    setForm((prev) => ({
      ...prev,
      paymentPlans: prev.paymentPlans.filter((_, i) => i !== idx),
    }));
  }

  // image upload
  function handleFilesChange(e) {
    const files = Array.from(e.target.files);
    setLocalImages((prev) => [...prev, ...files]);
  }

  async function uploadImage(file) {
    const token = getAuthToken();
    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    const body = await res.json();
    if (body?.url) return body.url;
    throw new Error("Upload failed");
  }

  async function uploadAllImages() {
    setUploading(true);
    try {
      const uploaded = [];
      for (let f of localImages) {
        uploaded.push(await uploadImage(f));
      }
      setForm((prev) => ({
        ...prev,
        productImages: [...prev.productImages, ...uploaded],
      }));
      setLocalImages([]);
      setMessage("Images uploaded successfully");
    } catch (err) {
      setError("Image upload failed");
    }
    setUploading(false);
  }

  function removeUploadedImage(idx) {
    setForm((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== idx),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    const token = getAuthToken();

    try {
      const res = await fetch(`${UPDATE_URL}${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const body = await res.json();

      if (!body.success) throw new Error(body.message);

      setMessage("Installment plan updated successfully");
      setTimeout(() => navigate("/admin/installment-plans"), 1000);
    } catch (err) {
      setError(err.message);
    }

    setSubmitting(false);
  }

  if (loading) return <LoadingPage />;

  return (
    <>
    <NavbarDashboard />
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-4">Update Installment Plan</h1>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        {message && <p className="text-green-600 mb-3">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* main inputs */}
          <div className="grid md:grid-cols-3 gap-4">
            <input
              value={form.productName}
              onChange={(e) => updateField("productName", e.target.value)}
              className="border p-2 rounded"
              placeholder="Product Name"
            />
            <input
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="border p-2 rounded"
              placeholder="Category"
            />
            <input
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              className="border p-2 rounded"
              placeholder="Company Name"
            />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="border p-2 rounded"
              placeholder="Price"
            />
            <input
              type="number"
              value={form.downpayment}
              onChange={(e) => updateField("downpayment", e.target.value)}
              className="border p-2 rounded"
              placeholder="Downpayment"
            />
            <input
              type="number"
              value={form.installment}
              onChange={(e) => updateField("installment", e.target.value)}
              className="border p-2 rounded"
              placeholder="Monthly Installment"
            />
            <input
              value={form.tenure}
              onChange={(e) => updateField("tenure", e.target.value)}
              className="border p-2 rounded"
              placeholder="Tenure"
            />
          </div>

          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="border p-2 rounded w-full"
            rows={4}
            placeholder="Description"
          ></textarea>

          {/* image uploader */}
          <div>
            <div className="text-sm font-semibold mb-2">Product Images</div>
            <input type="file" multiple onChange={handleFilesChange} />

            {localImages.length > 0 && (
              <button
                type="button"
                onClick={uploadAllImages}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
              >
                {uploading ? "Uploading..." : "Upload Selected"}
              </button>
            )}

            <div className="flex gap-3 mt-3 overflow-x-auto">
              {form.productImages.map((url, i) => (
                <div key={i} className="w-24 h-20 relative border rounded overflow-hidden">
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(i)}
                    className="absolute top-1 right-1 text-white bg-red-600 rounded px-1"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Plans */}
          <div>
            <div className="flex justify-between mb-2">
              <p className="font-semibold">Payment Plans</p>
              <button type="button" onClick={addPlan} className="px-3 py-1 border rounded">
                Add Plan
              </button>
            </div>

            {form.paymentPlans.map((p, idx) => (
              <div key={idx} className="border rounded p-4 mb-3 bg-gray-50">
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium">Plan #{idx + 1}</p>
                  {form.paymentPlans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlan(idx)}
                      className="text-sm text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    value={p.planName}
                    onChange={(e) => updatePlan(idx, "planName", e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Plan Name"
                  />
                  <input
                    type="number"
                    value={p.monthlyInstallment}
                    onChange={(e) => updatePlan(idx, "monthlyInstallment", e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Monthly Installment"
                  />
                  <input
                    type="number"
                    value={p.downPayment}
                    onChange={(e) => updatePlan(idx, "downPayment", e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Downpayment"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-3 mt-2">
                  <input
                    type="number"
                    value={p.tenureMonths}
                    onChange={(e) => updatePlan(idx, "tenureMonths", e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Tenure Months"
                  />
                  <input
                    type="number"
                    value={p.interestRatePercent}
                    onChange={(e) => updatePlan(idx, "interestRatePercent", e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Interest %"
                  />
                  <select
                    value={p.interestType}
                    onChange={(e) => updatePlan(idx, "interestType", e.target.value)}
                    className="border p-2 rounded"
                  >
                    <option>Flat Rate</option>
                    <option>Reducing Balance</option>
                    <option>Compound Interest</option>
                    <option>Profit-Based (Islamic/Shariah)</option>
                  </select>
                </div>

                <div className="mt-2">
                  <input
                    type="number"
                    value={p.markup}
                    onChange={(e) => updatePlan(idx, "markup", e.target.value)}
                    className="border p-2 rounded w-full"
                    placeholder="Markup"
                  />
                </div>

                <div className="mt-2">
                  <input
                    value={p.otherChargesNote}
                    onChange={(e) => updatePlan(idx, "otherChargesNote", e.target.value)}
                    className="border p-2 rounded w-full"
                    placeholder="Other Charges Note"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              disabled={submitting}
              className="px-4 py-2 bg-gray-200 rounded"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded"
              type="submit"
            >
              {submitting ? "Updating..." : "Update Plan"}
            </button>
          </div>

        </form>
      </div>
    </div>
    </>
  );
}
