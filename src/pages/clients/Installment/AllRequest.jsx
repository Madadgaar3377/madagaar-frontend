// src/pages/dashboard/InstallmentApplicationsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getAuthToken } from "../../../utils/auth"; // adjust path to your auth.js
import { backendBaseUrl } from "../../../constants/apiUrl";
import NavbarDashboard from "../Dashboard/Navbar-Dashboard";

const API_BASE_URL = (backendBaseUrl || "").replace(/\/$/, "");

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

// const verifiedOptions = [
//   { label: "All", value: "" },
//   { label: "Verified", value: "true" },
//   { label: "Not Verified", value: "false" },
// ];

const sortByOptions = [
  { label: "Newest", value: "createdAt" },
  { label: "Name", value: "fullName" },
  { label: "Application ID", value: "applicationId" },
];

const sortOrderOptions = [
  { label: "Desc", value: "desc" },
  { label: "Asc", value: "asc" },
];

export default function InstallmentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filters & pagination
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isVerified, setIsVerified] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // fetchApplications wrapped in useCallback so we can reuse (and cancel requests)
  const fetchApplications = useCallback(async (opts = {}) => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      const params = {
        page: opts.page ?? page,
        limit,
        sortBy: opts.sortBy ?? sortBy,
        sortOrder: opts.sortOrder ?? sortOrder,
      };

      if ((opts.search ?? search).trim()) params.search = (opts.search ?? search).trim();
      if (opts.status !== undefined ? opts.status : status) params.status = opts.status ?? status;
      if (opts.isVerified !== undefined ? opts.isVerified : isVerified) params.isVerified = opts.isVerified ?? isVerified;

      const source = axios.CancelToken.source();

      const res = await axios.get(`${API_BASE_URL}/installment-application`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params,
        cancelToken: source.token,
      });

      if (res.data && res.data.success) {
        setApplications(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        } else {
          // fallback pagination
          setPagination({
            currentPage: Number(params.page || 1),
            totalPages: 1,
            totalItems: Array.isArray(res.data.data) ? res.data.data.length : 0,
            itemsPerPage: limit,
          });
        }
      } else {
        setError(res.data?.message || "Failed to fetch applications");
      }

      return () => source.cancel("Request cancelled");
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Error fetching applications", err);
      setError(err.response?.data?.message || "Something went wrong while fetching.");
    } finally {
      setLoading(false);
    }
  }, [page, status, isVerified, sortBy, sortOrder, search, limit]);

  // initial + whenever filters change
  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, isVerified, sortBy, sortOrder]);

  // search submit handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplications({ page: 1, search });
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setIsVerified("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
    fetchApplications({ page: 1, search: "", status: "", isVerified: "" });
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) setPage((p) => p + 1);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 md:px-8 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
            <NavbarDashboard />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">
              Installment Applications
            </h1>
            <p className="text-sm text-gray-500">
              View and manage all installment requests from customers.
            </p>
          </div>

          <button
            onClick={handleClearFilters}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
          >
            Reset Filters
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 mb-6 shadow-sm">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            {/* Search */}
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Search (Name / CNIC / Email / Phone / Application ID)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. 35201-xxxxx, John, loan-123"
                  className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]/20 focus:border-[rgb(183,36,42)]"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-xs">⌕</span>
              </div>
            </div>

            {/* Status & Verified */}
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-1/3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]/20 focus:border-[rgb(183,36,42)]"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value || "all-status"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              
            </div>

            {/* Sort & Submit */}
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-1/3">
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]/20 focus:border-[rgb(183,36,42)]"
                  >
                    {sortByOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]/20 focus:border-[rgb(183,36,42)]"
                  >
                    {sortOrderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="h-10 md:h-9 mt-1 md:mt-5 p-2 inline-flex items-center justify-center rounded-xl bg-[rgb(183,36,42)] hover:bg-[#b7242a] text-xs md:text-sm font-semibold text-white shadow transition"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Loading / Error / Empty */}
          {loading && (
            <div className="p-8 text-center text-gray-500 text-sm">Loading installment applications...</div>
          )}

          {!loading && error && <div className="p-6 text-center text-red-500 text-sm">{error}</div>}

          {!loading && !error && applications.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">No installment applications found.</div>
          )}

          {/* Table */}
          {!loading && !error && applications.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 text-left">Application</th>
                    <th className="px-4 py-3 text-left">Applicant</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Product</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Amounts</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-gray-800 text-xs md:text-sm">
                            {app.applicationId || app._id}
                          </span>
                          <span className="text-xs text-gray-500">{app.city} • {app.category}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-800 text-xs md:text-sm">{app.fullName}</span>
                          <span className="text-xs text-gray-500">{app.cnicNumber}</span>
                          <span className="text-[11px] text-gray-400">{app.emailAddress}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-800">{app.productName || app.installmentPlan?.productName}</span>
                          <span className="text-[11px] text-gray-500">Plan: {app.installmentPlan?.installmentPlanId || "N/A"} • Posted By: {app.postedBy}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top hidden md:table-cell">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="text-emerald-600 font-semibold">Total: Rs. {app.totalPrice?.toLocaleString("en-PK") || "N/A"}</span>
                          <span className="text-gray-600">Down: Rs. {app.downPayment?.toLocaleString("en-PK") || "N/A"}</span>
                          <span className="text-gray-500 text-[11px]">Monthly: Rs. {app.installmentAmount?.toLocaleString("en-PK") || "N/A"} • {app.numberOfInstallments} months</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold ${
                            app.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            app.status === "rejected" ? "bg-red-50 text-red-700 border border-red-100" :
                            "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {app.status || "pending"}
                          </span>
                          <span className="text-[11px] text-gray-500">Verified: <span className={app.isVerified ? "text-emerald-600" : "text-gray-400"}>{app.isVerified ? "Yes" : "No"}</span></span>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top hidden lg:table-cell">
                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                          <span>{app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-PK",{ year: "numeric", month: "short", day: "numeric" }) : "-"}</span>
                          <span className="text-[11px]">{app.createdAt ? new Date(app.createdAt).toLocaleTimeString("en-PK",{ hour: "2-digit", minute: "2-digit" }) : ""}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && applications.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-white text-xs text-gray-600">
              <div>
                Page <span className="font-semibold text-gray-800">{pagination.currentPage}</span> of <span className="font-semibold text-gray-800">{pagination.totalPages}</span> • Total <span className="font-semibold text-gray-800">{pagination.totalItems}</span> applications
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handlePrevPage} disabled={page <= 1} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${page <= 1 ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                  Prev
                </button>
                <button onClick={handleNextPage} disabled={page >= pagination.totalPages} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${page >= pagination.totalPages ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
