import { useEffect, useState } from "react";
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
import { fetchSalesReport } from "../../redux/slices/adminSlice";
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

const PIE_COLORS = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

const Reports = () => {
  const dispatch = useDispatch();
  const { report, loading, error } = useSelector((state) => state.admin);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    dispatch(
      fetchSalesReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
    );
  }, [dispatch, startDate, endDate]);

  const totalRevenue = report?.dailySales?.reduce(
    (sum, d) => sum + d.revenue,
    0
  );
  const totalOrders = report?.dailySales?.reduce(
    (sum, d) => sum + d.orders,
    0
  );

  const dailySalesData = (report?.dailySales || []).map((d) => ({
    name: new Date(d._id).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    revenue: d.revenue,
    orders: d.orders,
  }));

  const categoryData = (report?.salesByCategory || []).map((c) => ({
    name: c.name || "Uncategorized",
    revenue: c.revenue,
  }));

  const vendorData = (report?.salesByVendor || []).map((v) => ({
    name: v.name || "Unknown",
    revenue: v.revenue,
  }));

  const statusData = (report?.ordersByStatus || []).map((s) => ({
    name: s._id,
    value: s.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Analytics</h2>
          <p className="text-gray-600 mt-1">
            Track sales performance and revenue across the platform.
          </p>
        </div>
        <div className="flex gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {totalOrders ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Top Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {report?.topProducts?.length ?? 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue trend */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                Revenue Trend
              </h3>
              {dailySalesData.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">
                  No revenue data for this period
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
                        stroke="#4f46e5"
                        fill="#c7d2fe"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Orders by status pie */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                Orders by Status
              </h3>
              {statusData.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">
                  No order data available
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {statusData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_COLORS[entry.name] || PIE_COLORS[0]}
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
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                    {statusData.map((s) => (
                      <span
                        key={s.name}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-600 capitalize"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[s.name] || PIE_COLORS[0],
                          }}
                        ></span>
                        {s.name} ({s.value})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by category */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                Sales by Category
              </h3>
              {categoryData.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">
                  No category sales data
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        tickLine={false}
                        interval={0}
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
                      <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Sales by vendor */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                Sales by Vendor
              </h3>
              {vendorData.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">
                  No vendor sales data
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={vendorData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        interval={0}
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
                      <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales summary table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  Daily Sales Summary
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Date
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Orders
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report?.dailySales?.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-10 text-center text-sm text-gray-400"
                        >
                          No sales data for this period
                        </td>
                      </tr>
                    )}
                    {report?.dailySales?.map((day) => (
                      <tr key={day._id}>
                        <td className="px-5 py-3 text-sm text-gray-700">
                          {new Date(day._id).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3 text-sm text-right text-gray-700">
                          {day.orders}
                        </td>
                        <td className="px-5 py-3 text-sm text-right font-medium text-gray-900">
                          {formatCurrency(day.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  Top Selling Products
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {report?.topProducts?.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">
                    No product sales data
                  </div>
                )}
                {report?.topProducts?.map((product, idx) => (
                  <div key={product._id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-5">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.totalSold} units sold
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
