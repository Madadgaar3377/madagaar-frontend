import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path
import { getAuthToken } from "../../../utils/auth"; // adjust path
import LoadingPage from "../../../compontents/Loader";
import cities from "../../../constants/cities";

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

  const [step, setStep] = useState(0);
  const steps = ["Personal", "Financial", "Residence", "References", "Review"];

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
    loanPlanId: "",
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
    maritalStatus: "",
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

  useEffect(() => {
    if (!planId) return;
    let cancelled = false;
    (async () => {
      setLoadingPlan(true);
      try {
        const res = await fetch(`${LOAN_POST_API}/${encodeURIComponent(planId)}`);
        const body = await res.json().catch(() => null);
        let data = body?.data || body;
        if (Array.isArray(data)) data = data[0] || null;
        if (!data) {
          console.warn("Plan not found for ID:", planId);
          setPlan(null);
          return;
        }
        if (cancelled) return;
        setPlan(data);
        setForm((f) => ({
          ...f,
          typeOfLoan: data?.title || f.typeOfLoan,
          appliedPlanId: data?._id || data?.loanPlanId || f.appliedPlanId,
          loanPlanId: data?.loanPlanId || f.loanPlanId,
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
      setForm((f) => ({ ...f, commonForm: { ...f.commonForm, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [path]: value }));
    }
  }

  function addInquiryRow() {
    setForm((f) => ({
      ...f,
      commonForm: {
        ...f.commonForm,
        typeOfInquiry: [
          ...(f.commonForm.typeOfInquiry || []),
          { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, inquiry: "", comment: "" },
        ],
      },
    }));
  }

  function updateInquiryRow(id, key, value) {
    setForm((f) => {
      const arr = [...(f.commonForm.typeOfInquiry || [])];
      const idx = arr.findIndex((r) => r.id === id);
      if (idx === -1) return f;
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...f, commonForm: { ...f.commonForm, typeOfInquiry: arr } };
    });
  }

  function removeInquiryRow(id) {
    setForm((f) => {
      const arr = (f.commonForm.typeOfInquiry || []).filter((r) => r.id !== id);
      return { ...f, commonForm: { ...f.commonForm, typeOfInquiry: arr } };
    });
  }

  function validateStep(currentStep = step) {
    if (currentStep === 0) {
      if (!form.name || !form.name.trim()) return "Please enter your name.";
      if (!form.phone || form.phone.trim().length < 6) return "Please enter a valid phone number.";
    }
    if (currentStep === 1) {
      if (!form.netSalary || !String(form.netSalary).trim()) return "Please enter your net salary or income.";
    }
    if (currentStep === 2) {
      if (!form.city || !form.city.trim()) return "Please enter your city.";
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const err = validateStep(0) || validateStep(1) || validateStep(2);
    if (err) {
      setMessage({ type: "error", text: err });
      setStep(err === validateStep(0) ? 0 : err === validateStep(1) ? 1 : 2);
      return;
    }

    setLoadingSubmit(true);
    try {
      const payload = { ...form };
      if (!payload.commonForm) payload.commonForm = {};
      const token = getAuthToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(LOAN_FORM_API, {
        method: "POST",
        headers,
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

  if (loadingSubmit) return <LoadingPage />;

  function StepIndicator() {
    return (
      <div className="mt-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 min-w-max">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i === step ? "bg-[rgb(183,36,42)] text-white" : "bg-gray-200 text-gray-700"
                }`}
                aria-current={i === step ? "step" : undefined}
                aria-label={`Step ${i + 1} ${s}`}
              >
                {i + 1}
              </div>
              <div className={`text-xs ${i === step ? "text-gray-800" : "text-gray-500"}`}>{s}</div>
              {i !== steps.length - 1 && <div className="w-6 h-px bg-gray-200 mx-2 hidden sm:block" />}
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">Step {step + 1} of {steps.length}</div>
      </div>
    );
  }

  function PersonalStep() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Name</label>
            <input
              aria-label="Full name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Phone</label>
            <input
              aria-label="Phone number"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]"
              inputMode="tel"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Email</label>
            <input
              aria-label="Email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]"
              type="email"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Employment Type</label>
            <select
              value={form.employmentType}
              onChange={(e) => updateField("employmentType", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select employment type</option>
              <option value="Salaried">Salaried</option>
              <option value="Existing Businessman">Existing Businessman</option>
              <option value="New Entrepreneur">New Entrepreneur</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600">Type of Loan</label>
            <select
              value={form.loanType || form.typeOfLoan}
              onChange={(e) => {
                updateField("loanType", e.target.value);
                updateField("typeOfLoan", e.target.value);
              }}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select loan type</option>
              <option value="Personal Loan">Personal Loan</option>
              <option value="Fori Cash Loan">Fori Cash Loan</option>
              <option value="Mortgage Loan / Home">Mortgage Loan / Home</option>
              <option value="SME Loan">SME Loan</option>
              <option value="Agri Loan">Agri Loan</option>
              <option value="Corporate / Commercial Loan">Corporate / Commercial Loan</option>
              <option value="Scheme Loan">Scheme Loan</option>
              <option value="Bachat Loan">Bachat Loan</option>
              <option value="Interest Free Loan">Interest Free Loan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600">Education Background</label>
            <select
              value={form.qualification}
              onChange={(e) => updateField("qualification", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select</option>
              <option value="matriculate">Matriculate</option>
              <option value="intermediate">Intermediate</option>
              <option value="graduate">Graduate</option>
              <option value="master">Master</option>
              <option value="phd/doctorate">Phd/Doctorate</option>
              <option value="specializedDiploma">Specialized Diploma</option>
              <option value="underMatric">Under Matric</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Age</label>
            <input
              value={form.age}
              onChange={(e) => updateField("age", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              type="number"
              min={18}
              aria-label="Age"
            />
          </div>
        </div>
      </div>
    );
  }

  function FinancialStep() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Net Salary / Income</label>
            <input
              value={form.netSalary}
              onChange={(e) => updateField("netSalary", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 50000"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Other Income Source</label>
            <input
              value={form.otherSrcOfIncome}
              onChange={(e) => updateField("otherSrcOfIncome", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Monthly Income From Other Source</label>
            <input
              value={form.monthlyIncomeFromOtherSrc}
              onChange={(e) => updateField("monthlyIncomeFromOtherSrc", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">Relevant Experience</label>
          <input
            value={form.relevantExperience}
            onChange={(e) => updateField("relevantExperience", e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    );
  }

  function ResidenceStep() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">City</label>
            <select
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c.value} value={c.value}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Residence Type</label>
            <input
              value={form.residenceType}
              onChange={(e) => updateField("residenceType", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Marital Status</label>
            <select
              value={form.maritalStatus}
              onChange={(e) => updateField("maritalStatus", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">No. of Dependents</label>
            <input
              value={form.noOfDependents}
              onChange={(e) => updateField("noOfDependents", e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              type="number"
              min={0}
            />
          </div>
        </div>
      </div>
    );
  }

  function ReferencesStep() {
    return (
      <div className="space-y-4 bg-gray-50 p-3 rounded-md border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">Contact / Reference</div>
          <button type="button" onClick={addInquiryRow} className="text-xs px-2 py-1 bg-white border rounded">+ Inquiry</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <input
            placeholder="Referrer"
            value={form.commonForm.reference}
            onChange={(e) => updateField("commonForm.reference", e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <input
            placeholder="WhatsApp"
            value={form.commonForm.whatsApp}
            onChange={(e) => updateField("commonForm.whatsApp", e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <input
            placeholder="CNIC"
            value={form.commonForm.cnic}
            onChange={(e) => updateField("commonForm.cnic", e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>

        {form.commonForm.typeOfInquiry?.length > 0 && (
          <div className="mt-3 space-y-2">
            {form.commonForm.typeOfInquiry.map((row) => (
              <div key={row.id} className="flex flex-col sm:flex-row gap-2 items-start">
                <input
                  placeholder="Inquiry"
                  value={row.inquiry}
                  onChange={(e) => updateInquiryRow(row.id, "inquiry", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <input
                  placeholder="Comment"
                  value={row.comment}
                  onChange={(e) => updateInquiryRow(row.id, "comment", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button type="button" onClick={() => removeInquiryRow(row.id)} className="px-2 py-1 rounded border">Remove</button>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600">Additional Notes / Previous Loan History</label>
          <textarea
            value={form.previousLoanHistory}
            onChange={(e) => updateField("previousLoanHistory", e.target.value)}
            rows={4}
            className="mt-1 w-full px-3 py-2 border rounded-md resize-vertical"
          />
        </div>
      </div>
    );
  }

  function ReviewStep() {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded border">
          <div className="text-sm font-medium text-gray-700">Summary</div>
          <div className="mt-3 text-sm text-gray-700 space-y-2">
            <div><strong>Name:</strong> {form.name || "—"}</div>
            <div><strong>Phone:</strong> {form.phone || "—"}</div>
            <div><strong>Email:</strong> {form.email || "—"}</div>
            <div><strong>City:</strong> {form.city || "—"}</div>
            <div><strong>Net Salary:</strong> {form.netSalary || "—"}</div>
            <div><strong>Loan Plan:</strong> {form.typeOfLoan || (plan && plan.title) || "—"}</div>
            <div><strong>Previous Loan History:</strong> {form.previousLoanHistory || "—"}</div>
          </div>
        </div>

        <div className="text-sm text-gray-500">Attached: <span className="font-medium text-gray-700">Brochure</span></div>
      </div>
    );
  }

  function renderStep() {
    switch (step) {
      case 0:
        return <PersonalStep />;
      case 1:
        return <FinancialStep />;
      case 2:
        return <ResidenceStep />;
      case 3:
        return <ReferencesStep />;
      case 4:
        return <ReviewStep />;
      default:
        return <PersonalStep />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow border p-6">
          <h1 className="text-2xl font-semibold text-gray-800">Apply for Loan</h1>
          <p className="mt-1 text-sm text-gray-500">Fill the form below to apply. We will review and get back to you.</p>

          {planId && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
              {loadingPlan ? (
                <div className="text-sm text-gray-500">Loading plan info...</div>
              ) : plan ? (
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    <img
                      src={plan.loanImages?.[0] || ""}
                      alt={plan.title || "Loan Plan"}
                      className="object-contain max-h-full"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
                          `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial' font-size='12'>Loan</text></svg>`
                        );
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">{plan.title || plan.planBy}</div>
                    <div className="text-xs text-gray-500 mt-1">Provider: {plan.planBy || plan.user?.businessName || "—"} • Amount: {plan.loanAmount || "—"}</div>
                    <div className="mt-2 text-sm text-gray-600">{(plan.description || "").slice(0, 180)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Plan not found.</div>
              )}
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${message.type === "error" ? "bg-red-50 text-red-700 border border-red-100" : "bg-emerald-50 text-emerald-800 border border-emerald-100"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <StepIndicator />

            <div className="mt-4">{renderStep()}</div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-500">Attached: <span className="font-medium text-gray-700">Brochure</span></div>

              <div className="flex w-full sm:w-auto gap-2 flex-col sm:flex-row">
                <div className="flex gap-2 w-full sm:w-auto">
                  {step > 0 && (
                    <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className="w-full sm:w-auto px-4 py-2 rounded bg-white border">Back</button>
                  )}

                  {step < steps.length - 1 && (
                    <button type="button" onClick={() => { const err = validateStep(step); if (err) { setMessage({ type: "error", text: err }); return; } setMessage(null); setStep((s) => Math.min(steps.length - 1, s + 1)); }} className="w-full sm:w-auto px-4 py-2 rounded bg-[rgb(183,36,42)] text-white">Next</button>
                  )}
                </div>

                {step === steps.length - 1 && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button type="button" onClick={() => { setForm((f) => ({ ...f, attachedBrochure: UPLOADED_PDF_PATH })); setMessage({ type: "success", text: "Brochure attached" }); }} className="w-full sm:w-auto px-4 py-2 rounded bg-white border">Attach Brochure</button>
                    <button type="submit" disabled={loadingSubmit} className={`w-full sm:w-auto px-4 py-2 rounded ${loadingSubmit ? "bg-gray-400 text-white" : "bg-[rgb(183,36,42)] text-white"}`}>{loadingSubmit ? "Submitting..." : "Submit Application"}</button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
