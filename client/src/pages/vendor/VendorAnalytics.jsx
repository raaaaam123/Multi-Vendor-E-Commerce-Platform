import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchVendorAnalytics } from "../../redux/slices/vendorSlice";
import AnalyticsCards from "../../components/vendor/AnalyticsCards";
import { formatCurrency } from "../../utils/format";

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#6366f1",
  out_for_delivery: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
  returned: "#f97316",
};

const Analytics = () => {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector((state) => state.vendor);

  useEffect(() => {
    dispatch(fetchVendorAnalytics());
  }, [dispatch]);

  const monthlyRevenue = analytics?.monthlyRevenue || [];
  const ordersByStatus = analytics?.ordersByStatus || [];
  const topProducts = analytics?.topProducts || [];
  const dailySales = analytics?.dailySales || [];

  const monthlyData = monthlyRevenue
    .slice()
    .reverse()
    .map((m) => ({
      name: new Date(m._id.year, m._id.month - 1).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      revenue: m.revenue,
    }));

  const dailySalesData = dailySales.map((d) => ({
    name: new Date(d._id).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    revenue: d.revenue,
    units: d.units,
  }));

  const statusData = ordersByStatus.map((s) => ({
    name: s._id,
    value: s.count,
  }));

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600 mt-1">
          Track your store's performance over the last 30 days.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <AnalyticsCards analytics={analytics} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Sales
        </h3>
        {!loading && dailySalesData.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No sales data yet.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailySalesData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "0.5rem",
                    borderColor: "#e5e7eb",
                    fontSize: "0.875rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7c3aed"
                  fill="#ddd6fe"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Products
          </h3>
          {loading && !analytics ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No sales data yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div
                  key={p._id || i}
                  className="flex items-center justify-between border-b border-gray-100 pb-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-purple-50 text-purple-600">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        {p.totalSold} sold
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(p.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Orders by Status
          </h3>
          {loading && !analytics ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : statusData.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No orders yet.
            </div>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={2}
                    >
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[entry.name] || "#9ca3af"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "0.5rem",
                        borderColor: "#e5e7eb",
                        fontSize: "0.875rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                {ordersByStatus.map((s) => (
                  <span
                    key={s._id}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      statusColors[s._id] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {s._id} · {s.count}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Revenue
        </h3>
        {loading && !analytics ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : monthlyData.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No revenue data yet.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "0.5rem",
                    borderColor: "#e5e7eb",
                    fontSize: "0.875rem",
                  }}
                />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;