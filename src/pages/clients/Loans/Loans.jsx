// src/pages/dashboard/LoansPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl";
import { getAuthToken, getUser, logout } from "../../../utils/auth"; // adjust path to your auth.js
import NavbarDashboard from "../Dashboard/Navbar-Dashboard";

const PAGE_SIZES = [10, 25, 50];

function formatDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) return;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map((r) =>
      keys
        .map((k) => {
          let v = r[k];
          if (v === null || v === undefined) return '""';
          v = String(v).replace(/"/g, '""');
          return `"${v}"`;
        })
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LoansPage() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // auth / role state
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // search
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState("name"); // id|name|loantype|email|phone
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // pagination & page size
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  // modal
  const [openLoan, setOpenLoan] = useState(null);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchValue.trim()), 500);
    return () => clearTimeout(t);
  }, [searchValue]);

  // get user from localStorage (auth.js) and check role
  useEffect(() => {
    const u = getUser();
    setUser(u);
    setIsAdmin(u?.userType === "Admin" || u?.userType === "admin");
  }, []);

  // fetch data from server — uses backend `query` param if debouncedQuery present
  useEffect(() => {
    let mounted = true;
    async function fetchLoans() {
      setLoading(true);
      setError("");

      // if user isn't admin, don't fetch — show unauthorized
      if (!isAdmin) {
        setLoans([]);
        setLoading(false);
        return;
      }

      try {
        let url = `${apiUrl}/loanForm/get`;
        if (debouncedQuery && debouncedQuery.length > 0) {
          const q = `${searchType}/${encodeURIComponent(debouncedQuery)}`;
          url += `?query=${q}`;
        }

        const token = getAuthToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(url, {
          method: "GET",
          headers,
          credentials: "include",
        });

        // handle auth errors
        if (res.status === 401 || res.status === 403) {
          // server indicates not authenticated/authorized
          setError("You are not authorized to view this page.");
          // optional: force logout if 401
          if (res.status === 401) {
            // token probably expired — clear and redirect to login
            setTimeout(() => logout("/account"), 1200);
          }
          setLoans([]);
          setLoading(false);
          return;
        }

        const payload = await res.json().catch(() => null);
        if (!res.ok || (payload && payload.success === false)) {
          setError(payload?.message || `Failed to fetch (${res.status})`);
          if (mounted) setLoans([]);
        } else {
          const data = payload?.data ?? payload ?? [];
          if (mounted) {
            setLoans(Array.isArray(data) ? data : []);
            setPage(1); // reset to first page when data changes
          }
        }
      } catch (err) {
        console.error("fetch loans error:", err);
        setError("Network error — could not fetch loan forms");
        if (mounted) setLoans([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchLoans();
    return () => {
      mounted = false;
    };
  }, [apiUrl, debouncedQuery, searchType, isAdmin]);

  // derived pagination
  const total = loans.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return loans.slice(start, start + pageSize);
  }, [loans, page, pageSize]);

  const handleExportVisible = () => {
    const rows = pageData.map((r) => ({
      id: r._id ?? "",
      name: r.name ?? r.fullName ?? "",
      email: r.email ?? "",
      phone: r.phone ?? r.number ?? "",
      loanType: r.typeOfLoan ?? r.loantype ?? "",
      amountRequested: r.amountRequested ?? r.amount ?? "",
      status: r.status ?? "",
      createdAt: r.createdAt ?? r.createdAt,
    }));
    downloadCSV(`loans-page-${page}.csv`, rows);
  };

  // render unauthorized message if not admin
  if (!user) {
    // still loading user state; don't show unauthorized immediately
    // but we already set user synchronous from getUser; keep normal flow
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <NavbarDashboard />
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and review loan form submissions</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white text-sm"
            >
              <option value="id">ID</option>
              <option value="name">Name</option>
              <option value="loantype">Loan Type</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>

            <div className="relative">
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={`Search by ${searchType}...`}
                className="px-4 py-2 border rounded-md w-64"
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setSearchValue("");
                setDebouncedQuery("");
                setSearchType("name");
              }}
              className="px-3 py-2 text-sm rounded-md border bg-white"
            >
              Reset
            </button>

            <button
              onClick={handleExportVisible}
              className="px-3 py-2 rounded-md bg-[rgb(183,36,42)] text-white text-sm"
            >
              Export Page CSV
            </button>
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow p-4">
          {(!isAdmin && user) ? (
            // logged-in but not admin
            <div className="py-12 text-center">
              <p className="text-red-600 font-semibold mb-3">Unauthorized</p>
              <p className="text-sm text-gray-600 mb-4">You must be an admin to view loan submissions.</p>
              <button onClick={() => window.location.href = "/"} className="px-4 py-2 rounded bg-white border">Go home</button>
            </div>
          ) : loading ? (
            <div className="py-12 text-center text-gray-500">Loading loan forms…</div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">{error}</div>
          ) : loans.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No loan submissions found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-600">#</th>
                      <th className="px-4 py-3 font-medium text-gray-600">ID</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Phone</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Loan Type</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Amount</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Created</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((row, idx) => (
                      <tr
                        key={row._id ?? idx}
                        className="border-b last:border-b-0 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 text-gray-700">{(page - 1) * pageSize + idx + 1}</td>
                        <td className="px-4 py-3 text-gray-700">{String(row._id || row._idStr || "").slice(0, 12)}</td>
                        <td className="px-4 py-3 text-gray-700">{row.name ?? row.fullName ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-700">{row.email ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-700">{row.phone ?? row.number ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-700">{row.typeOfLoan ?? row.loantype ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-700">{row.amountRequested ?? row.amount ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDate(row.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setOpenLoan(row)}
                              className="px-3 py-1.5 text-xs rounded-md bg-white border"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* pagination & pageSize */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  Showing <strong>{(page - 1) * pageSize + 1}</strong> — <strong>{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="px-3 py-1 border rounded"
                  >
                    {PAGE_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s} / page
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <div className="px-3 py-1 text-sm border rounded bg-gray-50">Page {page} / {totalPages}</div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Modal */}
      {openLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenLoan(null)} />

          <div className="relative z-10 max-w-3xl w-full bg-white rounded-2xl shadow-lg overflow-auto max-h-[90vh]">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold">{openLoan.name ?? openLoan.fullName ?? "Loan Application"}</h2>
                  <div className="text-sm text-gray-500">ID: {openLoan._id ?? openLoan._idStr}</div>
                </div>
                <button onClick={() => setOpenLoan(null)} className="text-gray-500">Close ✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-medium">{openLoan.email ?? "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="font-medium">{openLoan.phone ?? openLoan.number ?? "-"}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Loan Type</div>
                  <div className="font-medium">{openLoan.typeOfLoan ?? openLoan.loantype ?? "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Amount Requested</div>
                  <div className="font-medium">{openLoan.amountRequested ?? openLoan.amount ?? "-"}</div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-xs text-gray-500">Message / Details</div>
                  <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">{openLoan.message ?? openLoan.description ?? "-"}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Created</div>
                  <div className="font-medium">{formatDate(openLoan.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-medium">{openLoan.status ?? "—"}</div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <a href={`mailto:${openLoan.email || ""}`} className="px-3 py-2 rounded bg-[rgb(183,36,42)] text-white text-sm">Email</a>
                <a href={`tel:${openLoan.phone || openLoan.number || ""}`} className="px-3 py-2 rounded border text-sm">Call</a>
                <button onClick={() => {
                  navigator.clipboard?.writeText(openLoan._id ?? openLoan._idStr ?? "");
                  alert("ID copied");
                }} className="px-3 py-2 rounded border text-sm">Copy ID</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
