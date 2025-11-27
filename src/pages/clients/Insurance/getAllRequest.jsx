// src/pages/admin/InsuranceRequests.jsx
import React, { useEffect, useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path if needed
import { getAuthToken } from "../../../utils/auth"; // adjust path if needed
import NavbarDashboard from "../Dashboard/Navbar-Dashboard.jsx";

const API = (backendBaseUrl || "").replace(/\/$/, "");
const ENDPOINT = `${API}/insuranceForm`; // assumes /insuranceForm/get, /insuranceForm/delete/:id, /insuranceForm/update/:id

export default function InsuranceRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filters / pagination / search
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // pending|approved|rejected
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [selected, setSelected] = useState(null); // for view modal
  const [actionLoadingId, setActionLoadingId] = useState(null); // id for which action is running
  const [refreshFlag, setRefreshFlag] = useState(0);

  // build headers with auth
  function getHeaders(json = true) {
    const h = {};
    if (json) h["Content-Type"] = "application/json";
    const token = getAuthToken ? getAuthToken() : null;
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }

  async function fetchRequests() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", limit);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (search && search.trim().length) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`${ENDPOINT}/get?${params.toString()}`, {
        method: "GET",
        headers: getHeaders(false),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || "Failed to fetch insurance requests");
      }
      const data = body?.data || body?.items || [];
      setItems(Array.isArray(data) ? data : []);
      // Reset selections when items refresh
      setSelectedRows(new Set());
      setSelectAll(false);

      if (body?.pagination) {
        setTotalPages(body.pagination.totalPages || 1);
      } else if (body?.total) {
        setTotalPages(Math.max(1, Math.ceil(body.total / limit)));
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Network error.");
      setItems([]);
      setSelectedRows(new Set());
      setSelectAll(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter, sortBy, sortOrder, refreshFlag]);

  // selection handlers
  function toggleRowSelection(id) {
    setSelectedRows((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      setSelectAll(false);
      return s;
    });
  }

  function toggleSelectAll() {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(items.map((it) => it._id));
      setSelectedRows(allIds);
      setSelectAll(true);
    }
  }

  // CSV export
  function exportSelectedToCSV() {
    if (!selectedRows || selectedRows.size === 0) {
      alert("Please select at least one row to export.");
      return;
    }

    const rows = items.filter((it) => selectedRows.has(it._id));
    if (!rows.length) {
      alert("No data found for selected rows.");
      return;
    }

    // pick fields for CSV
    const headers = [
      "ApplicationId",
      "Name",
      "Email",
      "Phone",
      "City",
      "Status",
      "CreatedAt",
      "Detail",
    ];

    const csvRows = [];
    csvRows.push(headers.join(","));

    rows.forEach((r) => {
      const appId = r.insuranceFormId || r._id || "";
      const name = r.commonForm?.name || r.name || "";
      const email = r.commonForm?.email || "";
      const phone = r.commonForm?.number || r.number || "";
      const city = r.commonForm?.city || "";
      const status = r.status || "";
      const created = r.createdAt ? new Date(r.createdAt).toISOString() : "";
      // sanitize detail by removing newlines and commas or wrap in quotes
      const detail = (r.detail || "").replace(/\r?\n|\r/g, " ").replace(/"/g, '""');

      const row = [
        appId,
        name,
        email,
        phone,
        city,
        status,
        created,
        `"${detail}"`,
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `insurance_requests_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.csv`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // simple confirm wrapper
  async function handleDelete(id) {
    if (!window.confirm("Delete this insurance request? This action cannot be undone.")) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`${ENDPOINT}/delete/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getHeaders(false),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message || "Delete failed");
      setRefreshFlag((f) => f + 1);
      alert(body?.message || "Deleted");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleUpdateStatus(id, status) {
    if (!window.confirm(`Set status to "${status}"?`)) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`${ENDPOINT}/update/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify({ status }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message || "Update failed");
      setRefreshFlag((f) => f + 1);
      alert(body?.message || "Updated");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update");
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleView(item) {
    setSelected(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function closeView() {
    setSelected(null);
  }

  // Pagination helpers
  function prevPage() {
    if (page > 1) setPage((p) => p - 1);
  }
  function nextPage() {
    if (page < totalPages) setPage((p) => p + 1);
  }

  // formatter
  function prettyDate(d) {
    try {
      if (!d) return "-";
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleString();
    } catch {
      return d;
    }
  }

  return (
    <>
    <NavbarDashboard />
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Insurance Requests</h1>
            <p className="text-sm text-gray-500">Manage incoming insurance requests — view, approve, reject, delete, or export selected.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setPage(1);
              }}
              className="px-3 py-2 rounded-md border bg-white text-sm"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setRefreshFlag((f) => f + 1)}
              className="px-3 py-2 rounded-md bg-[rgb(183,36,42)] text-white text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 flex gap-3 items-center">
            <input
              placeholder="Search name / CNIC / email / phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 px-3 py-2 border rounded-lg"
            />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-lg">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="createdAt">Newest</option>
              <option value="fullName">Name</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setPage(1)} className="px-3 py-2 rounded-md border">Go</button>
            <div className="text-sm text-gray-500 self-end">Page {page} / {totalPages}</div>
          </div>
        </div>

        {/* Content box */}
        <div className="bg-white rounded-2xl p-4 shadow border overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="form-checkbox" />
                <span className="text-sm text-gray-600">Select All</span>
              </label>
              <button onClick={exportSelectedToCSV} className="px-3 py-2 rounded bg-emerald-600 text-white text-sm">Export Selected CSV</button>
            </div>
            <div className="text-sm text-gray-500">Selected: {selectedRows.size}</div>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading requests...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No requests found.</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 text-left"> </th>
                  <th className="px-4 py-3 text-left">Application</th>
                  <th className="px-4 py-3 text-left">Applicant</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Type / Items</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Created</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((it) => (
                  <tr key={it._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(it._id)}
                        onChange={() => toggleRowSelection(it._id)}
                      />
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="text-sm font-semibold">{it.insuranceFormId || it._id}</div>
                      <div className="text-xs text-gray-500">{it.commonForm?.city || "-"}</div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="text-sm">{it.commonForm?.name || it.name || "-"}</div>
                      <div className="text-xs text-gray-500">{it.commonForm?.number || it.number || it.commonForm?.email}</div>
                    </td>

                    <td className="px-4 py-3 align-top hidden md:table-cell">
                      <div className="text-xs text-gray-700">
                        {Array.isArray(it.typeOfInsurance) ? `${it.typeOfInsurance.length} item(s)` : "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-semibold ${
                          it.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                          it.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {it.status || "pending"}
                        </span>
                        <div className="text-[11px] text-gray-400 mt-1">Verified: {it.isVerified ? "Yes" : "No"}</div>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top hidden lg:table-cell text-sm text-gray-500">
                      {prettyDate(it.createdAt)}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => handleView(it)} className="px-2 py-1 text-xs rounded border">View</button>

                        <button
                          onClick={() => handleUpdateStatus(it._id, "approved")}
                          disabled={actionLoadingId === it._id}
                          className="px-2 py-1 text-xs rounded bg-emerald-600 text-white"
                        >
                          {actionLoadingId === it._id ? "..." : "Approve"}
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(it._id, "rejected")}
                          disabled={actionLoadingId === it._id}
                          className="px-2 py-1 text-xs rounded bg-red-600 text-white"
                        >
                          {actionLoadingId === it._id ? "..." : "Reject"}
                        </button>

                        <button
                          onClick={() => handleDelete(it._id)}
                          disabled={actionLoadingId === it._id}
                          className="px-2 py-1 text-xs rounded border text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* pagination controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={prevPage} disabled={page <= 1} className={`px-3 py-1 rounded ${page<=1 ? "opacity-50 cursor-not-allowed" : "border"}`}>Prev</button>
            <button onClick={nextPage} disabled={page >= totalPages} className={`px-3 py-1 rounded ${page>=totalPages ? "opacity-50 cursor-not-allowed" : "border"}`}>Next</button>
          </div>
        </div>
      </div>

      {/* View modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/40" onClick={closeView}>
          <div className="bg-white rounded-xl max-w-3xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{selected.insuranceFormId || selected.commonForm?.name}</h3>
                <div className="text-sm text-gray-500">{selected.commonForm?.city} • {prettyDate(selected.createdAt)}</div>
              </div>
              <div>
                <button onClick={closeView} className="px-3 py-1 rounded border">Close</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Applicant</div>
                <div className="text-sm">{selected.commonForm?.name}</div>
                <div className="text-xs text-gray-500">{selected.commonForm?.number} • {selected.commonForm?.email}</div>

                <div className="mt-3 text-xs text-gray-400">Address</div>
                <div className="text-sm">{selected.serviceOfficeAddress || selected.commonForm?.area || "-"}</div>

                <div className="mt-3 text-xs text-gray-400">Agent</div>
                <div className="text-sm">{selected.nameOfAgent || "-"}</div>
                <div className="text-xs text-gray-500">{selected.numberOfAgent || "-"}</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-gray-400">Policy / Premium</div>
                <div className="text-sm">Monthly: {selected.amountMonthly ?? "-"}</div>
                <div className="text-sm">Quarterly: {selected.amountQuaterly ?? "-"}</div>
                <div className="text-sm">Yearly: {selected.amountYearly ?? "-"}</div>

                <div className="mt-3 text-xs text-gray-400">Items</div>
                <ul className="list-disc pl-4 text-sm">
                  {(selected.typeOfInsurance || []).length
                    ? selected.typeOfInsurance.map((t, i) => <li key={i}>{t.complaint} — {t.comment}</li>)
                    : <li className="text-xs text-gray-400">No items</li>
                  }
                </ul>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-400">Details</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{selected.detail || "-"}</div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => handleUpdateStatus(selected._id, "approved")} className="px-4 py-2 rounded bg-emerald-600 text-white">Approve</button>
              <button onClick={() => handleUpdateStatus(selected._id, "rejected")} className="px-4 py-2 rounded bg-red-600 text-white">Reject</button>
              <button onClick={() => handleDelete(selected._id)} className="px-4 py-2 rounded border text-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
