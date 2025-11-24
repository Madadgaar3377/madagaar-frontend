// src/pages/LoanApply.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path
import { getAuthToken } from "../../../utils/auth"; // adjust path
import LoadingPage from "../../../compontents/Loader";

const API = (backendBaseUrl || "").replace(/\/$/, "");
const LOAN_FORM_API = `${API}/loanForm`;
const LOAN_POST_API = `${API}/loanpost/get/public`;
const UPLOADED_PDF_PATH = "/mnt/data/Installment Updates.pdf";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function LoanApply() {
  const query = useQuery();
  const navigate = useNavigate();
  const planId = query.get("planId") || query.get("id") || "";

  const [loadingPlan, setLoadingPlan] = useState(false);
  const [plan, setPlan] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    eligibility: "",
    typeOfLoan: "",
    commonForm: {
      name: "",
      email: "",
      number: "",
      whatsApp: "",
      cnic: "",
      city: "",
      area: "",
      reference: "",
      interCode: "",
      typeOfInquiry: [],
    },
    name: "",
    email: "",
    phone: "",
    loanPlanId:"",
    city: "",
    netSalary: "",
    otherSrcOfIncome: "",
    monthlyIncomeFromOtherSrc: "",
    relevantExperience: "",
    lenOfCurrentEmpOrBusiness: "",
    age: "",
    qualification: "",
    residenceInfo: "",
    residenceType: "",
    materialStatus: "",
    noOfDependents: "",
    vehicleOwnershipStatus: "",
    noOfConsumersLoanCurrAvailed: "",
    appliedLoanBefore: "",
    previousLoanHistory: "",
    offerAnyTangibleAsset: "",
    equityContributionPer: "",
    guarantorsForLoanRepayment: "",
    equityStatusOfAvalOwnership: "",
    eduBackground: "",
    businessStructure: "",
    incomeBracket: "",
    compositionOfIncome: "",
    netWorthAvailCapital: "",
    ownerOfAvailableCollateral: "",
    equityInvestment: "",
    equityOwnerShip: "",
    anyBankFinancing: "",
    haveOrHasfeasibilityReportForIdea: "",
    personInvolvedInBusiness: "",
    remunerationOwnersPartnersDirectors: "",
    isVerified: false,
    loanType: "",
    employmentType: "",
    appliedPlanId: planId || "",
    attachedBrochure: UPLOADED_PDF_PATH,
  });

  // Fetch plan info safely
  useEffect(() => {
    if (!planId) return;
    let cancelled = false;

    (async () => {
      setLoadingPlan(true);
      try {
        const res = await fetch(`${LOAN_POST_API}/${encodeURIComponent(planId)}`);
        const body = await res.json().catch(() => null);
        let data = body?.data || body;

        // If API returns array, pick first
        if (Array.isArray(data)) data = data[0] || null;

        if (!data) {
          console.warn("Plan not found for ID:", planId);
          setPlan(null);
          return;
        }

        if (cancelled) return;

        setPlan(data);

        // Prefill a few fields safely
        setForm((f) => ({
          ...f,
          typeOfLoan: data?.title || f.typeOfLoan,
          appliedPlanId: data?._id || data?.loanPlanId || f.appliedPlanId,
          loanPlanId:data?.loanPlanId
        }));
      } catch (err) {
        console.warn("Prefill plan failed:", err);
      } finally {
        if (!cancelled) setLoadingPlan(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [planId]);

  function updateField(path, value) {
    if (path.startsWith("commonForm.")) {
      const key = path.replace("commonForm.", "");
      setForm((f) => ({
        ...f,
        commonForm: { ...f.commonForm, [key]: value },
      }));
    } else {
      setForm((f) => ({ ...f, [path]: value }));
    }
  }

  function addInquiryRow() {
    setForm((f) => ({
      ...f,
      commonForm: {
        ...f.commonForm,
        typeOfInquiry: [...(f.commonForm.typeOfInquiry || []), { inquiry: "", comment: "" }],
      },
    }));
  }

  function updateInquiryRow(idx, key, value) {
    setForm((f) => {
      const arr = [...(f.commonForm.typeOfInquiry || [])];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...f, commonForm: { ...f.commonForm, typeOfInquiry: arr } };
    });
  }

  function removeInquiryRow(idx) {
    setForm((f) => {
      const arr = [...(f.commonForm.typeOfInquiry || [])];
      arr.splice(idx, 1);
      return { ...f, commonForm: { ...f.commonForm, typeOfInquiry: arr } };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!form.name.trim()) {
      setMessage({ type: "error", text: "Name is required" });
      return;
    }
    if (!form.phone?.trim() || form.phone.trim().length < 6) {
      setMessage({ type: "error", text: "Valid phone number is required" });
      return;
    }

    setLoadingSubmit(true);
    try {
      const payload = { ...form };
      if (!payload.commonForm) payload.commonForm = {};

      const res = await fetch(LOAN_FORM_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken() || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message || body?.error || "Failed to submit form");

      setMessage({ type: "success", text: "Application submitted successfully." });
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      console.error("Submit error:", err);
      setMessage({ type: "error", text: err.message || "Submission failed" });
    } finally {
      setLoadingSubmit(false);
    }
  }

  if(loadingSubmit){
    return <LoadingPage />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h1 className="text-2xl font-semibold text-gray-800">Apply for Loan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill the form below to apply. We will review and get back to you.
          </p>

          {planId && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
              {loadingPlan ? (
                <div className="text-sm text-gray-500">Loading plan info...</div>
              ) : plan ? (
                <div className="flex gap-4 items-start">
                  <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    <img
                      src={(plan.loanImages?.[0]) || ""}
                      alt={plan.title || "Loan Plan"}
                      className="object-contain max-h-full"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "data:image/svg+xml;charset=UTF-8," +
                          encodeURIComponent(
                            `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial' font-size='12'>Loan</text></svg>`
                          );
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">{plan.title || plan.planBy}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Provider: {plan.planBy || plan.user?.businessName || "—"} • Amount: {plan.loanAmount || "—"}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">{(plan.description || "").slice(0, 180)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Plan not found.</div>
              )}
            </div>
          )}

          {message && (
            <div
              className={`mt-4 p-3 rounded-md text-sm ${
                message.type === "error" ? "bg-red-50 text-red-700 border border-red-100" : "bg-emerald-50 text-emerald-800 border border-emerald-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Name / Phone / Email */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Name</label>
                <input value={form.name} onChange={(e) => updateField("name", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Phone</label>
                <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Email</label>
                <input value={form.email} onChange={(e) => updateField("email", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            {/* Location + Financials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">City</label>
                <input value={form.city} onChange={(e) => updateField("city", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Net Salary / Income</label>
                <input value={form.netSalary} onChange={(e) => updateField("netSalary", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="e.g., 50000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Other Income Source</label>
                <input value={form.otherSrcOfIncome} onChange={(e) => updateField("otherSrcOfIncome", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            {/* Qualification / Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Qualification</label>
                <input value={form.qualification} onChange={(e) => updateField("qualification", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Age</label>
                <input value={form.age} onChange={(e) => updateField("age", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            {/* Residence / Marital */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Residence Type</label>
                <input value={form.residenceType} onChange={(e) => updateField("residenceType", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Marital Status</label>
                <input value={form.materialStatus} onChange={(e) => updateField("materialStatus", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            {/* Tangible Asset / Guarantors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Offer Any Tangible Asset</label>
                <input value={form.offerAnyTangibleAsset} onChange={(e) => updateField("offerAnyTangibleAsset", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="Yes / No / Details" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Guarantors Details</label>
                <input value={form.guarantorsForLoanRepayment} onChange={(e) => updateField("guarantorsForLoanRepayment", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
            </div>

            {/* CommonForm: Contact / Reference */}
            <div className="bg-gray-50 p-3 rounded-md border">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">Contact / Reference</div>
                <button type="button" onClick={addInquiryRow} className="text-xs px-2 py-1 bg-white border rounded">+ Inquiry</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <input placeholder="Referrer" value={form.commonForm.reference} onChange={(e) => updateField("commonForm.reference", e.target.value)} className="px-3 py-2 border rounded" />
                <input placeholder="WhatsApp" value={form.commonForm.whatsApp} onChange={(e) => updateField("commonForm.whatsApp", e.target.value)} className="px-3 py-2 border rounded" />
                <input placeholder="CNIC" value={form.commonForm.cnic} onChange={(e) => updateField("commonForm.cnic", e.target.value)} className="px-3 py-2 border rounded" />
              </div>

              {form.commonForm.typeOfInquiry?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.commonForm.typeOfInquiry.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input placeholder="Inquiry" value={row.inquiry} onChange={(e) => updateInquiryRow(idx, "inquiry", e.target.value)} className="flex-1 px-3 py-2 border rounded" />
                      <input placeholder="Comment" value={row.comment} onChange={(e) => updateInquiryRow(idx, "comment", e.target.value)} className="flex-1 px-3 py-2 border rounded" />
                      <button type="button" onClick={() => removeInquiryRow(idx)} className="px-2 py-1 rounded border">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-600">Additional Notes / Previous Loan History</label>
              <textarea value={form.previousLoanHistory} onChange={(e) => updateField("previousLoanHistory", e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>

            {/* Attach / Submit */}
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-500">
                Attached: <span className="font-medium text-gray-700">Brochure</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setForm((f) => ({ ...f, attachedBrochure: UPLOADED_PDF_PATH })); setMessage({ type: "success", text: "Brochure attached" }); }} className="px-4 py-2 rounded bg-white border">Attach Brochure</button>
                <button type="submit" disabled={loadingSubmit} className={`px-4 py-2 rounded ${loadingSubmit ? "bg-gray-400 text-white" : "bg-[rgb(183,36,42)] text-white"}`}>
                  {loadingSubmit ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
