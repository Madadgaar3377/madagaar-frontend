// src/pages/admin/AdminLoanForms.jsx
import React, { useEffect, useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl";
import { getAuthToken } from "../../../utils/auth";
import NavbarDashboard from "../Dashboard/Navbar-Dashboard";

const API = (backendBaseUrl || "").replace(/\/$/, "");
// NOTE: adjust these endpoints to match your backend routes if they differ
const LOANPLAN_LIST_API = `${API}/loanpost/get/public`; // GET list (expects { data: [...] } or array)
const LOANPLAN_DELETE_API = (id) => `${API}/loanpost/loan/${encodeURIComponent(id)}`; // DELETE
const LOANPLAN_UPDATE_API = (id) => `${API}/loanpost/update/${encodeURIComponent(id)}`; // PUT

const SAMPLE_BROCHURE = "/mnt/data/Installment Updates.pdf";

export default function AdminLoanForms() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeEdit, setActiveEdit] = useState(null); // whole plan object being edited
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [query, setQuery] = useState("");

  // pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query]);

  async function fetchList() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(LOANPLAN_LIST_API, {
        headers: {
          Authorization: `Bearer ${getAuthToken() || ""}`,
        },
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.message || "Failed to fetch loan plans");
        setPlans([]);
        return;
      }
      // Accept array or { data: [...] }
      const data = Array.isArray(body) ? body : body?.data || [];
      setPlans(data || []);
    } catch (err) {
      console.error("Fetch loan plans error:", err);
      setError(err.message || "Failed to fetch");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm("Are you sure you want to delete this plan? This action cannot be undone.");
    if (!ok) return;
    try {
      setDeletingId(id);
      const res = await fetch(LOANPLAN_DELETE_API(id), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken() || ""}`,
        },
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || "Delete failed");
      }
      setPlans((prev) => prev.filter((p) => (p._id || p.loanPlanId) !== id));
      // adjust page if needed
      setTimeout(() => {
        setPage((curPage) => {
          const filteredAfter = applySearch(plans.filter((p) => (p._id || p.loanPlanId) !== id), query);
          const totalPagesAfter = Math.max(1, Math.ceil(filteredAfter.length / PAGE_SIZE));
          return Math.min(curPage, totalPagesAfter);
        });
      }, 0);
    } catch (err) {
      console.error("Delete failed:", err);
      window.alert(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  function openEdit(plan) {
    // deep clone so editing doesn't mutate list
    setActiveEdit(JSON.parse(JSON.stringify(plan)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editChange(key, value) {
    setActiveEdit((cur) => ({ ...cur, [key]: value }));
  }

  async function saveUpdate(e) {
    e.preventDefault();
    if (!activeEdit || !(activeEdit._id || activeEdit.loanPlanId)) return;
    const id = activeEdit._id || activeEdit.loanPlanId;
    try {
      setSaving(true);
      const payload = { ...activeEdit };
      // Remove _id to avoid conflicts (backend usually ignores but safe)
      delete payload._id;
      // If nested user exists, remove it from payload unless you intend to change owner
      if (payload.user && typeof payload.user === "object") delete payload.user;

      const res = await fetch(LOANPLAN_UPDATE_API(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken() || ""}`,
        },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || "Update failed");
      }
      const updated = body?.data || activeEdit;
      setPlans((prev) => prev.map((p) => ((p._id || p.loanPlanId) === id ? updated : p)));
      setActiveEdit(null);
      window.alert("Loan plan updated successfully");
    } catch (err) {
      console.error("Update failed:", err);
      window.alert(err.message || "Failed to update loan plan");
    } finally {
      setSaving(false);
    }
  }

  function applySearch(list, q) {
    if (!q) return list;
    const lowered = q.toLowerCase();
    return list.filter((p) => {
      const title = (p.title || "").toString().toLowerCase();
      const planId = (p.loanPlanId || p._id || "").toString().toLowerCase();
      const planBy = (p.planBy || "").toString().toLowerCase();
      const userName = (p.user?.fullName || p.user?.fullName || "").toString().toLowerCase();
      return (
        title.includes(lowered) ||
        planId.includes(lowered) ||
        planBy.includes(lowered) ||
        userName.includes(lowered)
      );
    });
  }

  const filtered = applySearch(plans, query);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);
  const paginated = filtered.slice(startIndex, endIndex);

  function gotoPage(n) {
    const p = Math.max(1, Math.min(totalPages, n));
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <NavbarDashboard />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Admin — Loan Plans</h1>
            <p className="text-sm text-gray-500">List, update or delete loan plans (shows results after creating a plan).</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title / plan id / provider / user"
              className="px-3 py-2 rounded-lg border w-72 bg-white"
            />
            <button onClick={fetchList} className="px-4 py-2 rounded-lg bg-[rgb(183,36,42)] text-white">Refresh</button>
          </div>
        </div>

        {/* Edit panel */}
        {activeEdit && (
          <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Update Loan Plan — {activeEdit.loanPlanId || activeEdit._id}</h2>
                <p className="text-xs text-gray-500">Modify fields and save.</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setActiveEdit(null)} className="px-3 py-1 rounded border">Cancel</button>
                <button onClick={saveUpdate} disabled={saving} className={`px-3 py-1 rounded ${saving ? "bg-gray-300" : "bg-emerald-500 text-white"}`}>{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>

            <form onSubmit={saveUpdate} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600">Title</label>
                <input value={activeEdit.title || ""} onChange={(e) => editChange("title", e.target.value)} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Loan Amount (display)</label>
                <input value={activeEdit.loanAmount || ""} onChange={(e) => editChange("loanAmount", e.target.value)} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Tenure</label>
                <select value={activeEdit.tenure || ""} onChange={(e) => editChange("tenure", e.target.value)} className="mt-1 px-3 py-2 border rounded w-full">
                  <option value="">-- select --</option>
                   <option value="other">Other / Custom</option>
                <option value="6_months">6 months</option>
                <option value="12_months">12 months</option>
                <option value="24_months">24 months</option>
                <option value="36_months">36 months</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Tenure (custom)</label>
                <input value={activeEdit.tenureCustom || ""} onChange={(e) => editChange("tenureCustom", e.target.value)} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Plan By (provider)</label>
                <input value={activeEdit.planBy || ""} onChange={(e) => editChange("planBy", e.target.value)} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Interest Rate (display)</label>
                <input value={activeEdit.interestRate || ""} onChange={(e) => editChange("interestRate", e.target.value)} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Interest Type</label>
                <input value={activeEdit.interestType || ""} onChange={(e) => editChange("interestType", e.target.value)} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Repayment Frequency</label>
                <input value={activeEdit.repayment || ""} onChange={(e) => editChange("repayment", e.target.value)} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Video URL</label>
                <input value={activeEdit.videoUrl || ""} onChange={(e) => editChange("videoUrl", e.target.value)} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-gray-600">Eligibility Requirement</label>
                <textarea value={activeEdit.eligibilityRequirement || ""} onChange={(e) => editChange("eligibilityRequirement", e.target.value)} className="mt-1 px-3 py-2 border rounded w-full" rows={4} />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs text-gray-600">Description</label>
                <textarea value={activeEdit.description || ""} onChange={(e) => editChange("description", e.target.value)} className="mt-1 px-3 py-2 border rounded w-full" rows={4} />
              </div>

              <div className="md:col-span-3 flex items-center gap-3">
                <div>
                  <label className="text-xs text-gray-600">Attach Brochure (sample)</label>
                  <div className="mt-1 text-sm text-gray-500">{SAMPLE_BROCHURE}</div>
                </div>

                <div className="ml-auto flex gap-2">
                  <button type="button" onClick={() => { setActiveEdit(null); }} className="px-3 py-2 rounded border">Close</button>
                  <button type="submit" disabled={saving} className={`px-4 py-2 rounded ${saving ? "bg-gray-300" : "bg-[rgb(183,36,42)] text-white"}`}>{saving ? "Saving..." : "Save Changes"}</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading loan plans...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : total === 0 ? (
            <div className="p-6 text-center text-gray-500">No loan plans found.</div>
          ) : (
            <>
              <div className="p-4 text-sm text-gray-600">Showing {startIndex + 1} - {endIndex} of {total}</div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr className="text-xs text-gray-600 uppercase">
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Title / Plan ID</th>
                      <th className="px-4 py-3 text-left">Amount / Tenure</th>
                      <th className="px-4 py-3 text-left">Provider</th>
                      <th className="px-4 py-3 text-left">Interest</th>
                      <th className="px-4 py-3 text-left">Owner</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Created</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((p, idx) => (
                      <tr key={(p._id || p.loanPlanId || startIndex + idx)} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{startIndex + idx + 1}</td>

                        <td className="px-4 py-3">
                          <div className="font-medium">{p.title || "—"}</div>
                          <div className="text-xs text-gray-500">{p.loanPlanId || (p._id || "").toString().slice(0, 8)}</div>
                          {Array.isArray(p.loanImages) && p.loanImages.length > 0 && (
                            <div className="mt-1 flex items-center gap-2">
                              <img src={p.loanImages[0]} alt="img" className="w-12 h-8 object-cover rounded" />
                              {p.loanImages.length > 1 && <div className="text-xs text-gray-500">{p.loanImages.length} images</div>}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-sm">{p.loanAmount || "—"}</div>
                          <div className="text-xs text-gray-500">{p.tenure === "other" ? (p.tenureCustom || "—") : (p.tenure || "—")}</div>
                        </td>

                        <td className="px-4 py-3">{p.planBy || "—"}</td>
                        <td className="px-4 py-3">{p.interestRate || "—"}</td>

                        <td className="px-4 py-3">
                          <div className="text-sm">{p.user?.fullName || p.user?.businessName || "—"}</div>
                          <div className="text-xs text-gray-500">{p.user?.number || p.user?.email || ""}</div>
                        </td>

                        <td className="px-4 py-3">{p.status || "—"}</td>

                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(p.createdAt || p.updatedAt || Date.now()).toLocaleString()}</td>

                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(p)} className="px-3 py-1 rounded border text-xs">Update</button>
                            <button
                              onClick={() => handleDelete(p._id || p.loanPlanId)}
                              disabled={deletingId === (p._id || p.loanPlanId)}
                              className="px-3 py-1 rounded bg-red-50 text-red-600 text-xs border"
                            >
                              {deletingId === (p._id || p.loanPlanId) ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">Page {safePage} of {totalPages}</div>

                <div className="flex items-center gap-2">
                  <button onClick={() => gotoPage(safePage - 1)} disabled={safePage === 1} className="px-3 py-1 rounded border text-sm">Prev</button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, pIdx) => {
                      const pNum = pIdx + 1;
                      if (pNum === 1 || pNum === totalPages || Math.abs(pNum - safePage) <= 2) {
                        return (
                          <button
                            key={pNum}
                            onClick={() => gotoPage(pNum)}
                            className={`px-3 py-1 rounded text-sm ${pNum === safePage ? "bg-gray-800 text-white" : "border"}`}
                          >
                            {pNum}
                          </button>
                        );
                      }
                      if ((pNum === safePage - 3 && pNum > 1) || (pNum === safePage + 3 && pNum < totalPages)) {
                        return <div key={`gap-${pNum}`} className="px-2 text-sm">…</div>;
                      }
                      return null;
                    })}
                  </div>

                  <button onClick={() => gotoPage(safePage + 1)} disabled={safePage === totalPages} className="px-3 py-1 rounded border text-sm">Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
