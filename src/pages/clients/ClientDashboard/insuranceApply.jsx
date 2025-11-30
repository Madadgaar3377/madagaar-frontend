// src/pages/client/MyInsuranceRequests.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken, getUser } from "../../../utils/auth"; // adjust path if needed
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path if needed
import ClientNavbar from "./ClientNavbar";
import LoadingPage from "../../../compontents/Loader";

const API = (backendBaseUrl || "").replace(/\/$/, "");
const ENDPOINT = `${API}/insuranceForm/get/my`;

const MyInsuranceRequests = () => {
  const navigate = useNavigate();
  const storedUser = getUser?.() || JSON.parse(localStorage.getItem("user") || "null");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filters
  const [searchCompany, setSearchCompany] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAgentNumber, setFilterAgentNumber] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // selection for CSV
  const [selectedRows, setSelectedRows] = useState(() => new Set());

  // detail drawer
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // if no user or no token, redirect to account/login
    const token = getAuthToken?.();
    if (!storedUser || !token) {
      navigate("/account");
      return;
    }
    fetchInsurance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchInsurance() {
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken?.();
      if (!token) {
        // If token missing, force navigation to login/account
        navigate("/account");
        return;
      }

      const params = new URLSearchParams();
      if (searchCompany.trim()) params.append("nameOfCompany", searchCompany.trim());
      if (filterStatus) params.append("status", filterStatus);
      if (filterAgentNumber.trim()) params.append("numberOfAgent", filterAgentNumber.trim());

      const qs = params.toString();
      const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;

      console.log("[MyInsuranceRequests] GET", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const safeJson = async (r) => {
        const t = await r.text();
        try {
          return JSON.parse(t);
        } catch (e) {
          return { rawText: t };
        }
      };

      const body = await safeJson(res);
      console.log("[MyInsuranceRequests] response:", res.status, body);

      if (!res.ok) {
        // if server returned error status, surface message if present
        const msg = body?.message || body?.rawText || `Request failed with status ${res.status}`;
        throw new Error(msg);
      }

      // backend returns { success: true, data: [...] }
      const list = Array.isArray(body?.data) ? body.data : [];
      setItems(list);
      setSelectedRows(new Set());
      setPage(1);
    } catch (err) {
      console.error("fetchInsurance error:", err);
      setError(err.message || "Failed to load insurance forms.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // client-side pagination
  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    const total = items.length;
    return {
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
      rows: items.slice(start, end),
    };
  }, [items, page, limit]);

  function safeStr(v) {
    if (v === undefined || v === null) return "";
    return String(v);
  }

  function toggleSelectRow(id) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exportCSV(rowsToExport = null) {
    const rows = rowsToExport || paginated.rows;
    if (!rows || rows.length === 0) {
      alert("No rows to export.");
      return;
    }

    const header = [
      "insuranceFormId",
      "nameOfCompany",
      "nameOfAgent",
      "numberOfAgent",
      "yearOfInsured",
      "yearOfCompletion",
      "noOfPremium",
      "amountMonthly",
      "amountQuaterly",
      "amountHalfYearly",
      "amountYearly",
      "status",
      "createdAt",
    ];

    const csv = [
      header.join(","),
      ...rows.map((r) => {
        const vals = [
          safeStr(r.insuranceFormId),
          safeStr(r.nameOfCompany),
          safeStr(r.nameOfAgent),
          safeStr(r.numberOfAgent),
          safeStr(r.yearOfInsured),
          safeStr(r.yearOfCompletion),
          safeStr(r.noOfPremium),
          safeStr(r.amountMonthly),
          safeStr(r.amountQuaterly),
          safeStr(r.amountHalfYearly),
          safeStr(r.amountYearly),
          safeStr(r.status),
          safeStr(r.createdAt),
        ];
        return vals.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
      }),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const userId = storedUser?._id || "user";
    a.download = `insurance_requests_${userId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportSelected() {
    if (!selectedRows.size) {
      exportCSV(); // visible rows
      return;
    }
    const rows = items.filter((r) => selectedRows.has(r._id));
    exportCSV(rows);
  }

  function openDetail(row) {
    setSelected(row);
  }
  function closeDetail() {
    setSelected(null);
  }

  const allCurrentPageSelected =
    paginated.rows.length > 0 &&
    paginated.rows.every((r) => selectedRows.has(r._id));

  return (
    <>
      <ClientNavbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                My Insurance Requests
              </h1>
              <p className="text-sm text-gray-500">
                View the insurance forms you have submitted and track their status.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                placeholder="Search company..."
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Agent number..."
                value={filterAgentNumber}
                onChange={(e) => setFilterAgentNumber(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <select
                className="px-3 py-2 border rounded-lg text-sm bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={() => fetchInsurance()}
                className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm"
              >
                Filter
              </button>
              <button
                onClick={handleExportSelected}
                className="px-3 py-2 bg-[rgb(183,36,42)] text-white rounded-lg text-sm"
              >
                Export CSV
              </button>
            </div>
          </header>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            {loading ? (
              <LoadingPage />
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                You have not submitted any insurance forms yet.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={allCurrentPageSelected}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedRows((prev) => {
                                const next = new Set(prev);
                                if (checked) {
                                  paginated.rows.forEach((r) => next.add(r._id));
                                } else {
                                  paginated.rows.forEach((r) => next.delete(r._id));
                                }
                                return next;
                              });
                            }}
                          />
                        </th>
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">Company</th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">
                          Agent Name
                        </th>
                        <th className="px-4 py-3 text-left">
                          Agent Number
                        </th>
                        <th className="px-4 py-3 text-left hidden lg:table-cell">
                          No. of Premium
                        </th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left hidden lg:table-cell">
                          Created
                        </th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.rows.map((r) => (
                        <tr key={r._id} className="border-t">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(r._id)}
                              onChange={() => toggleSelectRow(r._id)}
                            />
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700">
                            {r.insuranceFormId || String(r._id).slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {r.nameOfCompany || "-"}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {r.nameOfAgent || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {r.numberOfAgent || "-"}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {r.noOfPremium ?? "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                r.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : r.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {r.status || "pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                            {r.createdAt
                              ? new Date(r.createdAt).toLocaleDateString("en-PK")
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => openDetail(r)}
                              className="px-3 py-1 rounded-md border text-xs"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Page{" "}
                    <strong className="text-gray-800">{page}</strong> of{" "}
                    <strong>{paginated.pages}</strong> —{" "}
                    <span>{paginated.total} results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className={`px-3 py-1 rounded ${
                        page <= 1
                          ? "opacity-60 cursor-not-allowed"
                          : "border"
                      }`}
                    >
                      Prev
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(paginated.pages, p + 1))
                      }
                      disabled={page >= paginated.pages}
                      className={`px-3 py-1 rounded ${
                        page >= paginated.pages
                          ? "opacity-60 cursor-not-allowed"
                          : "border"
                      }`}
                    >
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
            <div
              className="flex-1 bg-black/40"
              onClick={closeDetail}
            />
            <div className="w-full max-w-2xl bg-white h-full overflow-y-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {selected.nameOfCompany || "Insurance Request"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    ID: {selected.insuranceFormId || selected._id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status:{" "}
                    <span className="font-medium">
                      {selected.status || "pending"}
                    </span>
                  </p>
                </div>
                <button
                  onClick={closeDetail}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                {/* Company & Agent Info */}
                <Section title="Company & Agent">
                  <Row label="Company" value={selected.nameOfCompany} />
                  <Row label="Service Office Address" value={selected.serviceOfficeAddress} />
                  <Row label="Agent Name" value={selected.nameOfAgent} />
                  <Row label="Agent Number" value={selected.numberOfAgent} />
                  <Row label="Agent ID" value={selected.idOfAgent} />
                  <Row label="Agent Address" value={selected.addressOfAgent} />
                </Section>

                {/* Insurance Details */}
                <Section title="Insurance Details">
                  <Row label="Year of Insured" value={selected.yearOfInsured} />
                  <Row label="Year of Completion" value={selected.yearOfCompletion} />
                  <Row label="No. of Premium" value={selected.noOfPremium} />
                  <Row label="Amount Monthly" value={selected.amountMonthly} />
                  <Row label="Amount Quarterly" value={selected.amountQuaterly} />
                  <Row label="Amount Half Yearly" value={selected.amountHalfYearly} />
                  <Row label="Amount Yearly" value={selected.amountYearly} />
                  <Row label="Detail" value={selected.detail} />
                </Section>

                {/* Type of Insurance (array of subSchema) */}
                <Section title="Type Of Insurance">
                  {Array.isArray(selected.typeOfInsurance) &&
                  selected.typeOfInsurance.length ? (
                    <ul className="mt-2 space-y-2 text-xs">
                      {selected.typeOfInsurance.map((t, index) => (
                        <li
                          key={index}
                          className="border rounded-lg p-2 bg-gray-50"
                        >
                          <div className="font-medium">
                            {t.complaint || "Type"}
                          </div>
                          {t.comment && (
                            <div className="text-gray-600 mt-1">
                              {t.comment}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-gray-500">
                      No insurance type details.
                    </div>
                  )}
                </Section>

                {/* Common Form */}
                <Section title="Client Info (Common Form)">
                  <Row
                    label="Name"
                    value={selected.commonForm?.name}
                  />
                  <Row
                    label="Email"
                    value={selected.commonForm?.email}
                  />
                  <Row
                    label="Number"
                    value={selected.commonForm?.number}
                  />
                  <Row
                    label="WhatsApp"
                    value={selected.commonForm?.whatsApp}
                  />
                  <Row
                    label="CNIC"
                    value={selected.commonForm?.cnic}
                  />
                  <Row
                    label="City"
                    value={selected.commonForm?.city}
                  />
                  <Row
                    label="Area"
                    value={selected.commonForm?.area}
                  />
                  <Row
                    label="Reference"
                    value={selected.commonForm?.reference}
                  />
                  <Row
                    label="Inter Code"
                    value={selected.commonForm?.interCode}
                  />
                  {/* typeOfInquiry is array of subSchema2 */}
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-gray-500">
                      Type Of Inquiry
                    </div>
                    {Array.isArray(selected.commonForm?.typeOfInquiry) &&
                    selected.commonForm.typeOfInquiry.length ? (
                      <ul className="mt-2 space-y-1 text-xs">
                        {selected.commonForm.typeOfInquiry.map(
                          (t, idx) => (
                            <li key={idx} className="bg-gray-50 p-2 rounded">
                              <div className="font-medium">
                                {t.inquiry}
                              </div>
                              {t.comment && (
                                <div className="text-gray-600">
                                  {t.comment}
                                </div>
                              )}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-500">
                        No inquiries recorded.
                      </div>
                    )}
                  </div>
                </Section>

                {/* Raw JSON (optional debug) */}
                <details className="mt-4">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    Show raw JSON
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(selected, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

function Section({ title, children }) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {children}
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <div className="text-[11px] text-gray-400">{label}</div>
      <div className="text-sm text-gray-800 mt-0.5">
        {value ?? "—"}
      </div>
    </div>
  );
}

export default MyInsuranceRequests;
