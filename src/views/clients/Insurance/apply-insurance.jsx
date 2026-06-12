import React, { useEffect, useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path if needed
import { getAuthToken } from "../../../utils/auth"; // optional: include auth if required
const API = (backendBaseUrl || "").replace(/\/$/, "");
const SUBMIT_API = `${API}/applyForInsurance`; // Updated to use new insurance application endpoint

const insuranceTypesTemplate = [
  "Life Insurance",
  "General Insurance",
  "Health Insurance",
  "Term Insurance",
  "Travel Insurance",
  "Motor Insurance",
];

// Lightweight Toast system (no external deps)
function Toast({ toasts, onClose }) {
  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`max-w-sm w-full px-4 py-2 rounded shadow-md border ${
            t.type === "success" ? "bg-green-50 border-green-300 text-green-800" :
            t.type === "error" ? "bg-red-50 border-red-300 text-red-800" :
            "bg-yellow-50 border-yellow-300 text-yellow-800"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm">{t.message}</div>
            <button type="button" aria-label="close" onClick={() => onClose(t.id)} className="text-xs opacity-80">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InsuranceApply() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // toast state
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "info", timeout = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    if (timeout > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, timeout);
    }
    return id;
  };
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const initial = {
    insuranceFormId: "",
    nameOfCompany: "",
    serviceOfficeAddress: "",
    nameOfAgent: "",
    numberOfAgent: "",
    idOfAgent: "",
    addressOfAgent: "",
    typeOfInsurance: [],
    yearOfInsured: "",
    yearOfCompletion: "",
    noOfPremium: "",
    amountMonthly: "",
    amountQuaterly: "",
    amountHalfYearly: "",
    amountYearly: "",
    detail: "",
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
  };

//   if (!getAuthToken) {
//     console.warn(
//       "getAuthToken function is not defined. If your API requires authentication, please implement this function to return a valid token."
//     );
//   }

  const [form, setForm] = useState(initial);

  useEffect(() => {
    // If getAuthToken exists and returns falsy, show a toast warning on mount
    try {
      if (typeof getAuthToken === "function") {
        const token = getAuthToken();
        if (!token) {
          addToast("User not Found , please Sigin or Signup" , 5000);
          Navigate("/insurance");
        }
      }
    } catch (e) {
      // If getAuthToken throws, warn as well
    //   addToast("Auth check failed (getAuthToken threw). Requests may be unauthenticated.", "warning", 5000);
      console.error(e.message
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper to update nested values
  function update(path, value) {
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!cur[p]) cur[p] = {};
        cur = cur[p];
      }
      cur[parts[parts.length - 1]] = value;
      return copy;
    });
  }

  function addInsuranceType() {
    setForm((p) => ({ ...p, typeOfInsurance: [...(p.typeOfInsurance || []), { complaint: "", comment: "" }] }));
  }
  function removeInsuranceType(idx) {
    setForm((p) => ({ ...p, typeOfInsurance: p.typeOfInsurance.filter((_, i) => i !== idx) }));
  }
  function updateInsuranceType(idx, key, value) {
    setForm((p) => {
      const arr = (p.typeOfInsurance || []).slice();
      arr[idx] = { ...(arr[idx] || {}), [key]: value };
      return { ...p, typeOfInsurance: arr };
    });
  }

  function addInquiry() {
    setForm((p) => ({ ...p, commonForm: { ...(p.commonForm || {}), typeOfInquiry: [...(p.commonForm?.typeOfInquiry || []), { inquiry: "", comment: "" }] } }));
  }
  function updateInquiry(idx, key, value) {
    setForm((p) => {
      const arr = (p.commonForm?.typeOfInquiry || []).slice();
      arr[idx] = { ...(arr[idx] || {}), [key]: value };
      return { ...p, commonForm: { ...(p.commonForm || {}), typeOfInquiry: arr } };
    });
  }
  function removeInquiry(idx) {
    setForm((p) => ({ ...p, commonForm: { ...(p.commonForm || {}), typeOfInquiry: (p.commonForm?.typeOfInquiry || []).filter((_, i) => i !== idx) } }));
  }

  function nextStep() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(5, s + 1));
    setError("");
  }
  function prevStep() {
    setStep((s) => Math.max(1, s - 1));
    setError("");
  }

  function validateStep(s) {
    if (s === 1) {
      if (!form.commonForm.name || !form.commonForm.number || !form.commonForm.email) {
        setError("Please provide your name, phone and email.");
        addToast("Please provide your name, phone and email.", "error");
        return false;
      }
    }
    if (s === 2) {
      if (!form.nameOfCompany && !form.nameOfAgent) {
        setError("Please provide either company name or agent details.");
        addToast("Please provide either company name or agent details.", "error");
        return false;
      }
    }
    if (s === 3) {
      if (!form.noOfPremium && !form.amountMonthly && !form.amountYearly) {
        setError("Please enter premium amounts or number of premiums.");
        addToast("Please enter premium amounts or number of premiums.", "error");
        return false;
      }
    }
    setError("");
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep(step)) return;

    // If getAuthToken exists and returns falsy, block and show toast (user asked for toaster when token not present)
    if (typeof getAuthToken === "function") {
      let token = null;
      try {
        token = getAuthToken();
      } catch (err) {
        console.error("getAuthToken threw:", err);
      }
      if (!token) {
        setError("Missing   please log in.");
        addToast("Missing   please log in.", "error");
        // Navigate("/account");
        return;
      }
    }

    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      const payload = JSON.parse(JSON.stringify(form));
      const toInt = (v) => (v === "" || v === null ? undefined : Number(v));
      payload.yearOfInsured = toInt(payload.yearOfInsured);
      payload.yearOfCompletion = toInt(payload.yearOfCompletion);
      payload.noOfPremium = toInt(payload.noOfPremium);
      payload.amountMonthly = toInt(payload.amountMonthly);
      payload.amountQuaterly = toInt(payload.amountQuaterly);
      payload.amountHalfYearly = toInt(payload.amountHalfYearly);
      payload.amountYearly = toInt(payload.amountYearly);

      const token = typeof getAuthToken === "function" ? getAuthToken() : "";

      const res = await fetch(SUBMIT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = body?.message || "Submission failed";
        Navigate("/insurance");
        throw new Error(msg);
      }
      setSuccessMsg(body?.message || "Insurance application submitted successfully.");
      addToast(body?.message || "Insurance application submitted successfully.", "success");
      setForm(initial);
      setStep(1);
    } catch (err) {
      console.error(err);
      const message = err.message || "Something went wrong.";
      setError(message);
      addToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = Math.round((step / 5) * 100);

  return (
    <>
      <Toast toasts={toasts} onClose={removeToast} />

      <div className="min-h-screen bg-gray-50 section-padding">
        <div className="container-content max-w-4xl">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Apply for Insurance</h2>
                <p className="text-sm text-gray-500">A simple multi-step form  complete in small parts.</p>
              </div>
              <div className="text-xs text-gray-500">{progress}%</div>
            </div>

            <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
              <div style={{ width: `${progress}%` }} className="h-full bg-[rgb(183,36,42)] rounded-full transition-all" />
            </div>

            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
            {successMsg && <div className="mb-4 text-sm text-green-600">{successMsg}</div>}

            <form onSubmit={handleSubmit}>
              {/* Step 1  Contact / Basic */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Your Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Full Name</label>
                      <input value={form.commonForm.name} onChange={(e) => update("commonForm.name", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Phone</label>
                      <input value={form.commonForm.number} onChange={(e) => update("commonForm.number", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">WhatsApp (optional)</label>
                      <input value={form.commonForm.whatsApp} onChange={(e) => update("commonForm.whatsApp", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Email</label>
                      <input value={form.commonForm.email} onChange={(e) => update("commonForm.email", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">CNIC (optional)</label>
                      <input value={form.commonForm.cnic} onChange={(e) => update("commonForm.cnic", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">City</label>
                      <input value={form.commonForm.city} onChange={(e) => update("commonForm.city", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={nextStep} className="px-4 py-2 rounded bg-[rgb(183,36,42)] text-white">Next</button>
                  </div>
                </div>
              )}

              {/* Step 2  Company / Agent */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Company / Agent Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Name of Company</label>
                      <input value={form.nameOfCompany} onChange={(e) => update("nameOfCompany", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Company Address</label>
                      <input value={form.serviceOfficeAddress} onChange={(e) => update("serviceOfficeAddress", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Agent Name</label>
                      <input value={form.nameOfAgent} onChange={(e) => update("nameOfAgent", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Agent Phone</label>
                      <input value={form.numberOfAgent} onChange={(e) => update("numberOfAgent", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Agent ID</label>
                      <input value={form.idOfAgent} onChange={(e) => update("idOfAgent", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Agent Address</label>
                      <input value={form.addressOfAgent} onChange={(e) => update("addressOfAgent", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Insurance Issues / Types</h4>
                      <button type="button" onClick={addInsuranceType} className="text-xs px-2 py-1 rounded border">Add</button>
                    </div>

                    <div className="space-y-2 mt-2">
                      {(form.typeOfInsurance || []).length === 0 && (
                        <div className="text-xs text-gray-500">No items added. (Optional) Add complaint / type of insurance.</div>
                      )}
                      {(form.typeOfInsurance || []).map((row, idx) => (
                        <div key={idx} className="p-3 border rounded grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                          <input value={row.complaint || ""} onChange={(e) => updateInsuranceType(idx, "complaint", e.target.value)} placeholder="Type / complaint (e.g. Claim Rejection)" className="px-3 py-2 border rounded md:col-span-2" />
                          <div className="flex gap-2 items-center">
                            <button type="button" onClick={() => removeInsuranceType(idx)} className="px-3 py-1 text-xs rounded border">Remove</button>
                          </div>
                          <div className="md:col-span-3">
                            <textarea value={row.comment || ""} onChange={(e) => updateInsuranceType(idx, "comment", e.target.value)} placeholder="Details (optional)" className="w-full mt-2 px-3 py-2 border rounded" rows={2} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between gap-2 mt-2">
                    <button type="button" onClick={prevStep} className="px-4 py-2 rounded border">Back</button>
                    <button type="button" onClick={nextStep} className="px-4 py-2 rounded bg-[rgb(183,36,42)] text-white">Next</button>
                  </div>
                </div>
              )}

              {/* Step 3  Payment / Premium */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Premium & Policy Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Year Insured</label>
                      <input type="number" value={form.yearOfInsured || ""} onChange={(e) => update("yearOfInsured", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Year of Completion</label>
                      <input type="number" value={form.yearOfCompletion || ""} onChange={(e) => update("yearOfCompletion", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">No. of Premiums</label>
                      <input type="number" value={form.noOfPremium || ""} onChange={(e) => update("noOfPremium", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Monthly Amount (PKR)</label>
                      <input type="number" value={form.amountMonthly || ""} onChange={(e) => update("amountMonthly", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Quarterly Amount (PKR)</label>
                      <input type="number" value={form.amountQuaterly || ""} onChange={(e) => update("amountQuaterly", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Half-yearly Amount (PKR)</label>
                      <input type="number" value={form.amountHalfYearly || ""} onChange={(e) => update("amountHalfYearly", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-600">Yearly Amount (PKR)</label>
                      <input type="number" value={form.amountYearly || ""} onChange={(e) => update("amountYearly", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-600">Short Details (optional)</label>
                      <textarea value={form.detail || ""} onChange={(e) => update("detail", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" rows={3} />
                    </div>
                  </div>

                  <div className="flex justify-between gap-2 mt-2">
                    <button type="button" onClick={prevStep} className="px-4 py-2 rounded border">Back</button>
                    <button type="button" onClick={nextStep} className="px-4 py-2 rounded bg-[rgb(183,36,42)] text-white">Next</button>
                  </div>
                </div>
              )}

              {/* Step 4  Extra Inquiries & Reference */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Extra Info & Reference</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Reference (optional)</label>
                      <input value={form.commonForm.reference} onChange={(e) => update("commonForm.reference", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Internal Code (optional)</label>
                      <input value={form.commonForm.interCode} onChange={(e) => update("commonForm.interCode", e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Type of Inquiry (optional)</h4>
                      <button type="button" onClick={addInquiry} className="text-xs px-2 py-1 rounded border">Add Inquiry</button>
                    </div>

                    <div className="space-y-2 mt-2">
                      {(form.commonForm?.typeOfInquiry || []).length === 0 && <div className="text-xs text-gray-500">No inquiry rows added.</div>}
                      {(form.commonForm?.typeOfInquiry || []).map((r, i) => (
                        <div key={i} className="p-3 border rounded grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                          <input value={r.inquiry || ""} onChange={(e) => updateInquiry(i, "inquiry", e.target.value)} placeholder="Inquiry title" className="px-3 py-2 border rounded md:col-span-2" />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => removeInquiry(i)} className="px-3 py-1 text-xs rounded border">Remove</button>
                          </div>
                          <div className="md:col-span-3">
                            <textarea value={r.comment || ""} onChange={(e) => updateInquiry(i, "comment", e.target.value)} placeholder="Comment (optional)" className="w-full mt-2 px-3 py-2 border rounded" rows={2} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between gap-2 mt-2">
                    <button type="button" onClick={prevStep} className="px-4 py-2 rounded border">Back</button>
                    <button type="button" onClick={nextStep} className="px-4 py-2 rounded bg-[rgb(183,36,42)] text-white">Review</button>
                  </div>
                </div>
              )}

              {/* Step 5  Review & Submit */}
              {step === 5 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Review & Submit</h3>

                  <div className="bg-gray-50 p-4 rounded space-y-3 text-sm">
                    <div><strong>Applicant:</strong> {form.commonForm.name} • {form.commonForm.number} • {form.commonForm.email}</div>
                    <div><strong>Company / Agent:</strong> {form.nameOfCompany || form.nameOfAgent || ""}</div>
                    <div><strong>Policy Dates:</strong> {form.yearOfInsured || "-"} → {form.yearOfCompletion || "-"}</div>
                    <div><strong>Premiums:</strong> Monthly {form.amountMonthly || "-"}, Quarterly {form.amountQuaterly || "-"}, Yearly {form.amountYearly || "-"}</div>
                    <div><strong>Type of Insurance Items:</strong>
                      <ul className="pl-4 list-disc">
                        {(form.typeOfInsurance || []).map((t, i) => <li key={i} className="text-xs">{t.complaint}  {t.comment}</li>)}
                        {(form.typeOfInsurance || []).length === 0 && <li className="text-xs text-gray-400">None</li>}
                      </ul>
                    </div>
                    <div><strong>Reference / Code:</strong> {form.commonForm.reference || "-"} / {form.commonForm.interCode || "-"}</div>
                    <div><strong>Details:</strong> <div className="text-xs text-gray-700 mt-1">{form.detail || "-"}</div></div>
                  </div>

                  <div className="flex justify-between gap-2 mt-2">
                    <button type="button" onClick={prevStep} className="px-4 py-2 rounded border">Back</button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-[rgb(183,36,42)] text-white">{submitting ? "Submitting…" : "Submit Application"}</button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
