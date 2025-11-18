// src/pages/dashboard/ManageInstallmentsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { backendBaseUrl } from "../../../constants/apiUrl";
import NavbarDashboard from "../Dashboard/Navbar-Dashboard";

let getAuthToken;
try {
  getAuthToken = require("../../../utils/auth").getAuthToken;
} catch (err) {
  console.warn("getAuthToken import failed:", err);
  getAuthToken = () => null;
}

const API_BASE_URL = (backendBaseUrl || "").replace(/\/$/, "");

const statusOptions = [
 { label: "All Status", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Processing", value: "processing" },
];

const verifiedOptions = [
  { label: "All", value: "" },
  { label: "Verified", value: "true" },
  { label: "Not Verified", value: "false" },
];

export default function ManageInstallmentsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editApp, setEditApp] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isVerified, setIsVerified] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchApplications = useCallback(async (opts = {}) => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken?.();
      const params = {
        page: opts.page ?? page,
        limit,
      };
      if ((opts.search ?? search).trim()) params.search = (opts.search ?? search).trim();
      if (opts.status !== undefined ? opts.status : status) params.status = opts.status ?? status;
      if (opts.isVerified !== undefined ? opts.isVerified : isVerified) params.isVerified = opts.isVerified ?? isVerified;

      const res = await axios.get(`${API_BASE_URL}/installment-application`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params,
      });

      if (res.data && res.data.success) {
        setApplications(res.data.data || []);
        setPagination(res.data.pagination || {
          currentPage: params.page || 1,
          totalPages: 1,
          totalItems: Array.isArray(res.data.data) ? res.data.data.length : 0,
          itemsPerPage: limit,
        });
      } else {
        setError(res.data?.message || "Failed to fetch applications");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [page, status, isVerified, search, limit]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Status update
  const handleStatusChange = async (id, newStatus) => {
    try {
      setEditLoading(true);
      const token = getAuthToken?.();
      await axios.patch(
        `${API_BASE_URL}/installment-application/${id}/status`,
        { status: newStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setEditLoading(false);
    }
  };

  // Full application update
  const handleFullUpdate = async () => {
    if (!editApp) return;
    try {
      setEditLoading(true);
      const token = getAuthToken?.();
      const { _id, ...updateData } = editApp;
      await axios.put(`${API_BASE_URL}/installment-application/${_id}`, updateData, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setApplications((prev) =>
        prev.map((app) => (app._id === _id ? editApp : app))
      );
      setEditApp(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update application");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplications({ page: 1, search });
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setIsVerified("");
    setPage(1);
    fetchApplications({ page: 1, search: "", status: "", isVerified: "" });
  };

  const handlePrevPage = () => setPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setPage((p) => Math.min(p + 1, pagination.totalPages));

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 md:px-8 py-6">
      <div className="max-w-6xl mx-auto">
        <NavbarDashboard />
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Installments</h1>

        {/* Filters */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 mb-6 shadow-sm">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
          >
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/3 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]/20 focus:border-[rgb(183,36,42)]"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full md:w-1/5 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={isVerified}
              onChange={(e) => setIsVerified(e.target.value)}
              className="w-full md:w-1/5 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700"
            >
              {verifiedOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[rgb(183,36,42)] text-white px-4 py-2 rounded-xl shadow-sm hover:bg-[#b7242a]"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
          {loading && <div className="p-8 text-center text-gray-500">Loading...</div>}
          {error && <div className="p-6 text-center text-red-500">{error}</div>}
          {!loading && !error && applications.length === 0 && (
            <div className="p-8 text-center text-gray-500">No applications found</div>
          )}

          {!loading && applications.length > 0 && (
            <>
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 text-left">Application</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Verified</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">{app.applicationId || app._id}</td>
                      <td className="px-4 py-3">{app.fullName}</td>
                      <td className="px-4 py-3">{app.emailAddress}</td>
                      <td className="px-4 py-3">{app.isVerified ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={app.status || "pending"}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          disabled={editLoading}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {statusOptions
                            .filter((o) => o.value) // remove "All Status"
                            .map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setEditApp(app)}
                          className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
                        >
                          Edit All
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center p-4 text-xs text-gray-600">
                <div>
                  Page <span className="font-semibold">{pagination.currentPage}</span> of <span className="font-semibold">{pagination.totalPages}</span> • Total <span className="font-semibold">{pagination.totalItems}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={page <= 1}
                    className={`px-3 py-1 rounded-lg border ${page <= 1 ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                  >
                    Prev
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={page >= pagination.totalPages}
                    className={`px-3 py-1 rounded-lg border ${page >= pagination.totalPages ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Edit Modal */}
        {editApp && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Edit Application</h2>
              <label className="block mb-2 text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={editApp.fullName || ""}
                onChange={(e) => setEditApp({ ...editApp, fullName: e.target.value })}
                className="w-full border rounded px-2 py-1 mb-3"
              />
              <label className="block mb-2 text-sm font-medium">Email</label>
              <input
                type="email"
                value={editApp.emailAddress || ""}
                onChange={(e) => setEditApp({ ...editApp, emailAddress: e.target.value })}
                className="w-full border rounded px-2 py-1 mb-3"
              />
              <label className="block mb-2 text-sm font-medium">Status</label>
              <select
                value={editApp.status || "pending"}
                onChange={(e) => setEditApp({ ...editApp, status: e.target.value })}
                className="w-full border rounded px-2 py-1 mb-4"
              >
                {statusOptions.filter((o) => o.value).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditApp(null)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFullUpdate}
                  disabled={editLoading}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
