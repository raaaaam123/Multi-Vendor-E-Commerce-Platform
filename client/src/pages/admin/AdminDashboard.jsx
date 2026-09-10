import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchDashboardStats } from "../../redux/slices/adminSlice";
import StatusBadge from "../../components/admin/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/format";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const revenueData = (stats?.monthlyRevenue || [])
    .slice()
    .reverse()
    .map((m) => ({
      name: new Date(m._id.year, m._id.month - 1).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      revenue: m.revenue,
      orders: m.orders,
    }));

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: "👥",
      color: "bg-blue-50 text-blue-600",
      to: "/admin/users",
    },
    {
      label: "Total Vendors",
      value: stats?.totalVendors ?? 0,
      icon: "🏪",
      color: "bg-purple-50 text-purple-600",
      to: "/admin/vendors",
    },
    {
      label: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: "📦",
      color: "bg-green-50 text-green-600",
      to: "/admin/products",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: "🧾",
      color: "bg-orange-50 text-orange-600",
      to: "/admin/orders",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue),
      icon: "💰",
      color: "bg-emerald-50 text-emerald-600",
      to: "/admin/payments",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: "⏳",
      color: "bg-yellow-50 text-yellow-600",
      to: "/admin/orders",
    },
    {
      label: "Completed Orders",
      value: stats?.completedOrders ?? 0,
      icon: "✅",
      color: "bg-teal-50 text-teal-600",
      to: "/admin/orders",
    },
    {
      label: "Vendor Approvals",
      value: stats?.pendingVendors ?? 0,
      icon: "🔍",
      color: "bg-red-50 text-red-600",
      to: "/admin/vendors",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-600 mt-1">
          Welcome to the ShopVerse admin dashboard. Here's what's happening on
          the platform today.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${stat.color}`}
              >
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {revenueData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Revenue Overview
                </h3>
                <Link
                  to="/admin/reports"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View reports →
                </Link>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueData}
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
            </div>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
              <Link
                to="/admin/orders"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {stats?.recentOrders?.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-gray-400">
                  No orders yet
                </div>
              )}
              {stats?.recentOrders?.map((order) => (
                <div
                  key={order._id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.user?.name || "Customer"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.totalPrice)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Users</h3>
              <Link
                to="/admin/users"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {stats?.recentUsers?.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-gray-400">
                  No users yet
                </div>
              )}
              {stats?.recentUsers?.map((user) => (
                <div key={user._id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 capitalize">
                      {user.role}
                    </span>
                    <StatusBadge status={user.status} />
                  </div>
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

export default AdminDashboard;
