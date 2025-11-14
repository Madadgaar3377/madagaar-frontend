import React, { useEffect, useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import CountUp from "react-countup";

/**
 * DashboardAnalytics.jsx
 * - Fetches GET `${backendBaseUrl}/dashboard/analytics`
 * - Renders summary cards + charts + lists
 *
 * Make sure route is protected and backendBaseUrl is correct.
 */

const COLORS = ["#E11D48", "#FB923C", "#06B6D4", "#10B981", "#7C3AED", "#F59E0B"];

export default function DashboardAnalytics() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchAnalytics() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiUrl}/dashboard/analytics`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const payload = await res.json().catch(() => null);

        if (!res.ok || (payload && payload.success === false)) {
          const err =
            payload?.error?.serverError || payload?.message || `Failed to fetch (${res.status})`;
          if (mounted) setError(err);
        } else {
          // payload may be { success: true, data: {...} } or direct data
          const body = payload?.data ?? (payload?.success ? payload.data : payload);
          if (mounted) setData(body || {});
        }
      } catch (err) {
        console.error("Analytics fetch error:", err);
        if (mounted) setError("Network error — could not fetch analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  // safe accessors
  const posts = Array.isArray(data?.posts) ? data.posts : [];
  const userCounts = Array.isArray(data?.userCounts) ? data.userCounts : [];
  const blogsCount = Array.isArray(data?.blogsCount) ? data.blogsCount : [];
  const payments = Array.isArray(data?.payments) ? data.payments : [];

  const getPostsChartData = () => posts.map((p) => ({ name: p._id ?? "unknown", count: Number(p.count ?? 0) }));
  const getUserCountsData = () => userCounts.map((u) => ({ name: u._id ?? "unknown", value: Number(u.count ?? 0) }));
  const getPaymentsPie = () =>
    payments.map((p) => ({ name: p._id ?? "unknown", value: Number(p.totalAmount ?? 0) }));
  const getBlogsStatusLine = () => blogsCount.map((b) => ({ name: b._id ?? "unknown", count: Number(b.count ?? 0) }));

  const totalPostsCount = posts.reduce((s, p) => s + Number(p.count ?? 0), 0);
  const totalUsers = userCounts.reduce((s, u) => s + Number(u.count ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of platform performance</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border rounded-md text-sm shadow-sm hover:shadow-md">Export</button>
            <button className="px-4 py-2 bg-[rgb(183,36,42)] text-white rounded-md text-sm">Create Report</button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="text-gray-500">Loading analytics...</div>
          </div>
        ) : error ? (
          <div className="py-6 text-red-600">{error}</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card
                title="Properties"
                value={posts.find((p) => p._id === "property")?.count ?? 0}
                icon="🏠"
              />
              <Card
                title="Loan Plans"
                value={posts.find((p) => p._id === "loan")?.count ?? 0}
                icon="💸"
              />
              <Card
                title="Installments"
                value={posts.find((p) => p._id === "installment")?.count ?? 0}
                icon="🧾"
              />
              <Card title="Total Users" value={totalUsers} icon="👥" />
            </div>

            {/* Charts + side column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* big chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow p-5">
                <h3 className="text-lg font-semibold mb-4">Posts by Type</h3>

                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getPostsChartData()} margin={{ top: 10, right: 20, left: -12, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700">Total Posts</h4>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        <CountUp end={totalPostsCount} duration={1.6} separator="," />
                      </span>
                      <span className="text-sm text-gray-500">across categories</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Updated just now</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700">Blog Status</h4>
                    <div className="mt-2" style={{ width: "100%", height: 100 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getBlogsStatusLine()}>
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                          <Tooltip />
                          <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Status distribution for posts</p>
                  </div>
                </div>
              </div>

              {/* side column */}
              <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">Payments by Status</h4>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPaymentsPie()}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={80}
                          innerRadius={38}
                          paddingAngle={4}
                        >
                          {getPaymentsPie().map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">User Types</h4>
                  <div className="space-y-3">
                    {getUserCountsData().length === 0 ? (
                      <p className="text-sm text-gray-500">No user data</p>
                    ) : (
                      getUserCountsData().map((u) => (
                        <div key={u.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 text-sm">
                              {u.name?.charAt(0)?.toUpperCase()}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-gray-700">{u.name}</div>
                              <div className="text-xs text-gray-500">Users</div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">{u.value}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* payments breakdown */}
            <div className="mt-6 bg-white rounded-2xl shadow p-5">
              <h3 className="text-lg font-semibold mb-4">Payments Breakdown</h3>
              {getPaymentsPie().length === 0 ? (
                <p className="text-sm text-gray-500">No payments data</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {getPaymentsPie().map((p, idx) => {
                    const total = getPaymentsPie().reduce((s, r) => s + Number(r.value || 0), 0) || 1;
                    const pct = Math.round((Number(p.value || 0) / total) * 100);
                    return (
                      <div key={p.name} className="p-4 bg-gray-50 rounded-lg flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">{p.name}</div>
                          <div className="text-sm font-semibold text-gray-900">{Number(p.value).toLocaleString()}</div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[rgb(183,36,42)]" style={{ width: `${Math.max(2, pct)}%` }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{pct}% of total</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* Helper Card component */
function Card({ title, value = 0, icon = "•" }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="text-2xl font-bold text-gray-900">
            <CountUp end={Number(value || 0)} duration={1.5} separator="," />
          </div>
          <div className="text-sm text-gray-500">items</div>
        </div>
      </div>
      <div className="h-12 w-12 rounded-lg bg-[rgb(255,235,238)] flex items-center justify-center text-2xl">{icon}</div>
    </div>
  );
}
