// src/pages/admin/AdminCreateLoan.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl";
import { getAuthToken } from "../../../utils/auth";
import NavbarDashboard from "../Dashboard/Navbar-Dashboard";

const API = (backendBaseUrl || "").replace(/\/$/, "");
const CREATE_LOAN_API = `${API}/loanpost`;
const IMAGE_UPLOAD_API = `${API}/image-upload/single`;
const UPLOADED_PDF_PATH = "/mnt/data/Installment Updates.pdf";

export default function AdminCreateLoan() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    loanAmount: "",
    tenure: "other",
    tenureCustom: "",
    planBy: "",
    interestRate: "",
    interestType: "",
    interestTypeCustom: "",
    repayment: "",
    repaymentCustom: "",
    eligibilityRequirement: "",
    description: "",
    videoUrl: "",
    status: "pending",          // 🔹 default status
  });

  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newEntries = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "idle",
      url: null,
      progress: 0,
      error: null,
    }));
    setImages((prev) => [...prev, ...newEntries]);
    e.target.value = "";
  }

  async function uploadImageAt(index) {
    const entry = images[index];
    if (!entry || !entry.file) return;

    setImages((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, status: "uploading", progress: 0, error: null } : it
      )
    );

    try {
      const fd = new FormData();
      fd.append("image", entry.file);

      const res = await fetch(IMAGE_UPLOAD_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken() || ""}`,
        },
        body: fd,
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message || "Upload failed");

      const url =
        body?.url ||
        (body?.data && body.data?.url) ||
        body?.data ||
        null;

      if (!url) {
        if (body?.data && body.data[0]) {
          setImages((prev) =>
            prev.map((it, i) =>
              i === index ? { ...it, status: "done", url: body.data[0] } : it
            )
          );
        } else {
          throw new Error("Upload response missing URL");
        }
      } else {
        setImages((prev) =>
          prev.map((it, i) => (i === index ? { ...it, status: "done", url } : it))
        );
      }
    } catch (err) {
      setImages((prev) =>
        prev.map((it, i) =>
          i === index ? { ...it, status: "error", error: err.message } : it
        )
      );
    }
  }

  async function uploadAllImages() {
    const pendingIndexes = images
      .map((it, i) => (it.status === "idle" || it.status === "error" ? i : -1))
      .filter((i) => i >= 0);

    for (const i of pendingIndexes) {
      // eslint-disable-next-line no-await-in-loop
      await uploadImageAt(i);
    }
  }

  function removeImage(index) {
    const toRevoke = images[index]?.preview;
    if (toRevoke) URL.revokeObjectURL(toRevoke);
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!form.title.trim()) {
      setMessage("Title is required");
      return;
    }
    if (!form.loanAmount || isNaN(Number(form.loanAmount))) {
      setMessage("Loan amount must be a number");
      return;
    }

    setSubmitting(true);

    try {
      if (images.length > 0) {
        await uploadAllImages();
      }

      const loanImages = images
        .filter((it) => it.status === "done" && it.url)
        .map((it) => it.url);

      if (loanImages.length === 0) {
        loanImages.push(UPLOADED_PDF_PATH);
      }

      const payload = {
        ...form,
        loanAmount: String(Number(form.loanAmount)),
        loanImages,
      };

      const res = await fetch(CREATE_LOAN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken() || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const errMsg = body?.message || body?.error || "Failed to create loan plan";
        throw new Error(errMsg);
      }

      setMessage("Loan plan created successfully.");
      setTimeout(() => {
        navigate("/dashboard/loan");
      }, 900);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
        <NavbarDashboard />
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Create Loan Plan
        </h2>

        {message && <div className="mb-4 text-sm text-red-600">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          {/* Amount + PlanBy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Loan Amount (numeric)
              </label>
              <input
                name="loanAmount"
                value={form.loanAmount}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Plan By / Provider
              </label>
              <input
                name="planBy"
                value={form.planBy}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* Tenure + TenureCustom + InterestRate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Tenure</label>
              <select
                name="tenure"
                value={form.tenure}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="other">Other / Custom</option>
                <option value="6_months">6 months</option>
                <option value="12_months">12 months</option>
                <option value="24_months">24 months</option>
                <option value="36_months">36 months</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Tenure Custom (if other)
              </label>
              <input
                name="tenureCustom"
                value={form.tenureCustom}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Interest Rate
              </label>
              <input
                name="interestRate"
                value={form.interestRate}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* InterestType + Repayment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Interest Type
              </label>
              <input
                name="interestType"
                value={form.interestType}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="e.g., Annual / Variable"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Repayment
              </label>
              <input
                name="repayment"
                value={form.repayment}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Monthly / Quarterly"
              />
            </div>
          </div>

          {/* 🔹 Status dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          {/* Eligibility */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Eligibility Requirements (multiline)
            </label>
            <textarea
              name="eligibilityRequirement"
              value={form.eligibilityRequirement}
              onChange={handleChange}
              rows={4}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Video URL (optional)
            </label>
            <input
              name="videoUrl"
              value={form.videoUrl}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          {/* Images */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Product Images (multiple allowed)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="mt-2"
            />

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((it, i) => (
                <div
                  key={i}
                  className="relative bg-gray-50 p-2 rounded-lg border"
                >
                  <img
                    src={it.preview}
                    alt={`preview-${i}`}
                    className="w-full h-28 object-cover rounded"
                  />
                  <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                    <div>
                      {it.status === "idle" && (
                        <span className="text-amber-600">Ready</span>
                      )}
                      {it.status === "uploading" && (
                        <span className="text-blue-600">Uploading...</span>
                      )}
                      {it.status === "done" && (
                        <span className="text-emerald-600">Uploaded</span>
                      )}
                      {it.status === "error" && (
                        <span className="text-red-600">Error</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {it.status !== "done" && (
                        <button
                          type="button"
                          onClick={() => uploadImageAt(i)}
                          className="text-xs px-2 py-1 rounded bg-blue-50 border"
                        >
                          Upload
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="text-xs px-2 py-1 rounded border"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {it.error && (
                    <div className="mt-1 text-xs text-red-500">
                      {it.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Tip: upload at least 1–3 images. If you skip images, a default
              brochure path will be attached.
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 rounded-md text-white font-semibold ${
                submitting ? "bg-gray-400" : "bg-[rgb(183,36,42)]"
              }`}
            >
              {submitting ? "Creating..." : "Create Loan Plan"}
            </button>

            <div className="text-sm text-gray-500">
              {images.filter((it) => it.status === "done").length} uploaded •{" "}
              {images.length} selected
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
