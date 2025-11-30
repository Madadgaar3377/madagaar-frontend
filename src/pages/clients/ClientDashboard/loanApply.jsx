// src/pages/client/UserLoanRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getAuthToken, getUser } from "../../../utils/auth"; // adjust path
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path
import { useNavigate } from "react-router-dom";
import ClientNavbar from "./ClientNavbar";
import LoadingPage from "../../../compontents/Loader"; // keep your original path if correct

const API = (backendBaseUrl || "").replace(/\/$/, "");
const ENDPOINT = `${API}/loanForm/user/request-loan`;

export default function UserLoanRequests() {
  const navigate = useNavigate();
  const storedUser = getUser?.() || JSON.parse(localStorage.getItem("user") || "null");
  const userEmail = storedUser?.email || "";
  const userId = storedUser?._id || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selected, setSelected] = useState(null); // detail
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState(() => new Set());

  // helper to safely parse text to json (keeps previous behavior)
  function safeJson(res) {
    return res
      .text()
      .then((t) => {
        try {
          return JSON.parse(t);
        } catch {
          return null;
        }
      })
      .catch(() => null);
  }

  // Fetch loans — simplified to POST { email } (backend expects body.email)
  async function fetchLoans() {
    if (!userEmail) {
      setError("User not found. Please login.");
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = getAuthToken?.();
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const body = await safeJson(res);

      if (!res.ok) {
        // if server returned non-2xx, try to show message from body if available
        const msg = (body && (body.message || (body.error && body.error.message))) || `Server returned ${res.status}`;
        console.error("fetchLoans server error:", msg);
        setError(msg);
        setItems([]);
      } else {
        // success — backend returns { success: true, data: [...] } per your example
        const list = (body && (Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : (body.data || []))) || [];
        setItems(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error("fetchLoans error", err);
      setError("Failed to load your loan requests.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // redirect if not logged in
    if (!userEmail) {
      navigate("/account");
      return;
    }
    fetchLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  // pagination + search
  const paginated = useMemo(() => {
    const filtered = items.filter((it) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        (it.title || it.productName || "").toString().toLowerCase().includes(q) ||
        (it.loanPlanId || it._id || "").toString().toLowerCase().includes(q) ||
        (it.city || "").toString().toLowerCase().includes(q)
      );
    });
    const start = (page - 1) * limit;
    return {
      total: filtered.length,
      pages: Math.max(1, Math.ceil(filtered.length / limit)),
      rows: filtered.slice(start, start + limit),
    };
  }, [items, page, limit, search]);

  function openDetail(row) {
    setSelected(row);
  }
  function closeDetail() {
    setSelected(null);
  }

  function toggleSelect(rowId) {
    setSelectedRows((s) => {
      const next = new Set(s);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }

  function safeStr(v) {
    if (v === undefined || v === null) return "";
    return String(v);
  }

  function exportCSV(rowsToExport = null) {
    const rows = rowsToExport || paginated.rows;
    if (!rows || rows.length === 0) {
      alert("No rows to export.");
      return;
    }
    const header = [
      "id",
      "loanPlanId",
      "title",
      "loanAmount",
      "tenure",
      "status",
      "city",
      "createdAt",
      "email",
    ];
    const csv = [
      header.join(","),
      ...rows.map((r) => {
        const vals = [
          safeStr(r._id),
          safeStr(r.loanPlanId),
          safeStr(r.title || r.productName),
          safeStr(r.loanAmount || r.price),
          safeStr(r.tenure || r.installment),
          safeStr(r.status),
          safeStr(r.city),
          safeStr(r.createdAt),
          safeStr(r.email || r.user?.email || r.commonForm?.email),
        ];
        return vals.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
      }),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loan_requests_${userId || "user"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // navigate to apply page (example)
  function navigateToApply(row) {
    const id = row._id || row.loanPlanId || row.installmentPlanId;
    if (id) {
      window.location.href = `/apply/installment/${encodeURIComponent(id)}`;
    } else {
      alert("No product id available to apply.");
    }
  }

  return (
    <>
      <ClientNavbar />
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">My Loan Requests</h1>
              <p className="text-sm text-gray-500">
                View status of your loan requests. You can export visible rows to CSV.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by title, id or city..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={() =>
                  exportCSV(
                    Array.from(selectedRows).length
                      ? items.filter((it) => selectedRows.has(it._id || it.loanFormId || it.loanPlanId))
                      : null
                  )
                }
                className="px-3 py-2 bg-[rgb(183,36,42)] text-white rounded-lg text-sm"
              >
                Export CSV
              </button>
              <button onClick={() => fetchLoans()} className="px-3 py-2 border rounded-lg text-sm">
                Refresh
              </button>
            </div>
          </header>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            {loading ? (
              <LoadingPage />
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-gray-500">You have no loan requests yet.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={paginated.rows.every((r) => selectedRows.has(r._id || r.loanPlanId || r.loanFormId))}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedRows((s) => {
                                const next = new Set(s);
                                if (checked) {
                                  paginated.rows.forEach((r) => next.add(r._id || r.loanPlanId || r.loanFormId));
                                } else {
                                  paginated.rows.forEach((r) => next.delete(r._id || r.loanPlanId || r.loanFormId));
                                }
                                return next;
                              });
                            }}
                          />
                        </th>
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">Title</th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">Amount</th>
                        <th className="px-4 py-3 text-left">Tenure</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left hidden lg:table-cell">City</th>
                        <th className="px-4 py-3 text-left">Created</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginated.rows.map((r) => (
                        <tr key={r._id || r.loanFormId || r.loanPlanId} className="border-t">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(r._id || r.loanPlanId || r.loanFormId)}
                              onChange={() => toggleSelect(r._id || r.loanPlanId || r.loanFormId)}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {r.loanFormId || r.loanPlanId || (r._id || "").slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.title || r.productName || "-"}</td>
                          <td className="px-4 py-3 hidden md:table-cell">Rs. {Number(r.loanAmount || r.price || 0).toLocaleString("en-PK")}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{r.tenure || r.tenureCustom || r.installment?.toString() || "-"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                r.status === "approved" ? "bg-green-100 text-green-800" : r.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {r.status || "pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">{r.city || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-PK") : "-"}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openDetail(r)} className="px-3 py-1 rounded-md text-sm border">
                                View
                              </button>
                              <button onClick={() => navigateToApply(r)} className="px-3 py-1 rounded-md bg-[rgb(183,36,42)] text-white text-sm">
                                Apply
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* pagination controls */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Page <strong className="text-gray-800">{page}</strong> of <strong>{paginated.pages}</strong> — <span>{paginated.total} results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className={`px-3 py-1 rounded ${page <= 1 ? "opacity-60 cursor-not-allowed" : "border"}`}>
                      Prev
                    </button>
                    <button onClick={() => setPage((p) => Math.min(paginated.pages, p + 1))} disabled={page >= paginated.pages} className={`px-3 py-1 rounded ${page >= paginated.pages ? "opacity-60 cursor-not-allowed" : "border"}`}>
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Detail Drawer */}
        {selected && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={closeDetail} />
            <div className="w-full max-w-2xl bg-white h-full overflow-y-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selected.title || selected.productName || "Loan Request"}</h2>
                  <div className="text-sm text-gray-500">ID: {selected.loanFormId || selected.loanPlanId || selected._id}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border rounded" onClick={closeDetail}>
                    Close
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <Row label="Loan Amount" value={selected.loanAmount || selected.price || "-"} />
                <Row label="Tenure" value={selected.tenure || selected.tenureCustom || "-"} />
                <Row label="Repayment" value={selected.repayment || selected.repaymentCustom || "-"} />
                <Row label="Status" value={selected.status || "-"} />
                <Row label="City" value={selected.city || "-"} />
                <div>
                  <div className="text-xs text-gray-400">Description</div>
                  <div className="mt-1 bg-gray-50 p-3 rounded text-sm">{selected.description || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Full JSON (debug)</div>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">{JSON.stringify(selected, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm text-gray-800 mt-1">{value ?? "—"}</div>
    </div>
  );
}
