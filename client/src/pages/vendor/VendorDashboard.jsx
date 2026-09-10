import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendorDashboard } from "../../redux/slices/vendorSlice";
import { fetchVendorProducts } from "../../redux/slices/productSlice";
import { formatCurrency } from "../../utils/format";
import PendingApproval from "../../components/vendor/PendingApproval";

const DashboardStat = ({ label, value, sub, color }) => {
  const colorClasses = {
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div
        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold mb-3 ${colorClasses[color]}`}
      >
        {label}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
};

const VendorDashboard = () => {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);
  const { dashboard, loading, error, approvalStatus } = useSelector(
    (state) => state.vendor
  );
  const { products, loading: productsLoading } = useSelector(
    (state) => state.product
  );

  const isPending =
    approvalStatus === "pending" ||
    (approvalStatus === null && status === "succeeded" && user?.role === "vendor");

  const isRejected = approvalStatus === "rejected";

  useEffect(() => {
    dispatch(fetchVendorDashboard());
    dispatch(fetchVendorProducts({ page: 1, limit: 5 }));
  }, [dispatch]);

  if (isPending || isRejected)
    return <PendingApproval status={isRejected ? "rejected" : "pending"} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-gray-600 mt-1">Here's what's happening with your store.</p>
        </div>
        <Link
          to="/vendor/products/create"
          className="inline-flex items-center justify-center bg-purple-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
        >
          + Add Product
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !dashboard ? (
          <DashboardStat label="Loading..." value="-" color="purple" />
        ) : (
          <>
            <DashboardStat
              label="Products"
              value={dashboard?.productCount ?? "-"}
              color="purple"
            />
            <DashboardStat
              label="Active Products"
              value={dashboard?.activeProductCount ?? "-"}
              color="blue"
            />
            <DashboardStat
              label="Orders"
              value={dashboard?.orderCount ?? "-"}
              color="orange"
            />
            <DashboardStat
              label="Revenue"
              value={formatCurrency(dashboard?.totalRevenue ?? 0)}
              color="green"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Orders
          </h3>
          {loading && !dashboard ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : !dashboard || dashboard.recentOrders?.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No orders yet.
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between border-b border-gray-100 pb-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.user?.name || "-"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items?.[0]?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Products</h3>
            <Link
              to="/vendor/products"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View all
            </Link>
          </div>
          {productsLoading && !products ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No products yet. Add your first product to start selling.
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <Link
                  to={`/vendor/products/edit/${product._id}`}
                  key={product._id}
                  className="flex items-center gap-3 border-b border-gray-100 pb-3 hover:bg-gray-50 rounded-lg px-2"
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-semibold">
                      {product.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {product.stock} in stock
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
