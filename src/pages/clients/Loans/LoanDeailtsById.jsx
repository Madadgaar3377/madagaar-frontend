// src/pages/LoanDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path if needed
import LoadingPage from "../../../compontents/Loader";
import OurPartners from "../OverPartener";

const API = (backendBaseUrl || "").replace(/\/$/, "");
const PDF_ASSET = "/mnt/data/Installment Updates.pdf"; // developer-provided upload path

export default function LoanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // fetch plan by id
        const res = await fetch(`${API}/loanpost/get/public/${encodeURIComponent(id)}`);
        const body = await res.json().catch(() => null);
        // body might be { success: true, data: {...} } or { data: {...} } or data itself
        let data = null;
        if (!body) data = null;
        else if (body.data) data = body.data;
        else data = body;

        // if API returns array, pick first
        if (Array.isArray(data)) data = data[0] || null;

        if (!data) throw new Error("Loan plan not found");
        if (!cancelled) setPlan(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load loan plan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleApply = () => {
    const planId = plan?._id || plan?.loanPlanId;
    if (planId) navigate(`/loan/apply/planId/${encodeURIComponent(planId)}`);
    else navigate("/loan/apply");
  };

  if (loading) {
    return (
      <LoadingPage />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl p-6 border shadow-sm text-center">
          <div className="text-red-500 font-semibold mb-2">Error</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-gray-600">No loan plan selected.</div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{plan.title}</h1>
            <div className="text-sm text-gray-500 mt-1">
              {plan.planBy || plan.user?.businessName || ""}
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <strong>Loan Amount:</strong> {plan.loanAmount || "—"} •{" "}
              <strong>Tenure:</strong>{" "}
              {plan.tenure === "other" ? plan.tenureCustom || "Custom" : plan.tenure || "—"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={PDF_ASSET}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-md border bg-white text-sm font-medium hover:shadow"
            >
              Download Brochure
            </a>

            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white font-semibold"
            >
              Apply Now
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            {/* Left: images */}
            <div className="md:col-span-1 space-y-4">
              <div className="rounded-lg overflow-hidden bg-gray-100 h-56">
                <img
                  src={(plan.loanImages && plan.loanImages[0]) || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60"}
                  alt={plan.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {Array.isArray(plan.loanImages) && plan.loanImages.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {plan.loanImages.slice(0, 6).map((img, i) => (
                    <img key={i} src={img} alt={plan.title} className="w-full h-20 object-cover rounded" />
                  ))}
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div><strong>Interest:</strong> {plan.interestRate || plan.interestType || "—"}</div>
                <div className="mt-1"><strong>Repayment:</strong> {plan.repayment || plan.repaymentCustom || "—"}</div>
                <div className="mt-1"><strong>Repayment Amount:</strong> {plan.repaymentAmount || "—"}</div>
              </div>
            </div>

            {/* Right: details */}
            <div className="md:col-span-2 space-y-4">
              <section className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-800">Description</h3>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {/* description often long text with newlines */}
                  {plan.description || "-"}
                </div>
              </section>

              <section className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800">Eligibility & Documents</h4>
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                  {plan.eligibilityRequirement || "Not specified."}
                </div>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-xs text-gray-500">Provider</div>
                  <div className="font-medium text-gray-800">{plan.planBy || plan.user?.businessName || "-"}</div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-xs text-gray-500">Interest Type</div>
                  <div className="font-medium text-gray-800">{plan.interestType || plan.interestTypeCustom || "-"}</div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-xs text-gray-500">Tenure</div>
                  <div className="font-medium text-gray-800">{plan.tenure === "other" ? plan.tenureCustom || "-" : plan.tenure || "-"}</div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-medium text-gray-800">{plan.status || "-"}</div>
                </div>
              </section>

              {/* full raw details for admin / power users */}
              <section className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-2">Full Details</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <div><strong>Loan Plan ID:</strong> {plan.loanPlanId || plan._id}</div>
                  <div><strong>Interest Rate:</strong> {plan.interestRate || "-"}</div>
                  <div><strong>Interest Period:</strong> {plan.interestType || "-"}</div>
                  <div><strong>Repayment:</strong> {plan.repayment || "-"}</div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-600">Have questions? Contact our loan consultants for help with eligibility and docs.</div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/contact")} className="px-4 py-2 rounded-md border">Contact Us</button>
            <button onClick={handleApply} className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white">Apply for this plan</button>
          </div>
        </div>
      </div>
    </div>
    <OurPartners />
    </>
  );
}
