import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../redux/slices/orderSlice";
import { formatCurrency, formatDate } from "../utils/format";
import { PAYMENT_METHOD_LABELS } from "../utils/orderUtils";
import { OrderStatusBadge, PaymentStatusBadge } from "../components/order/OrderStatusBadge";
import LoginPrompt from "../components/common/LoginPrompt";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const {
    myOrders,
    myOrdersPagination,
    myOrdersLoading,
    error,
  } = useSelector((state) => state.order);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyOrders({ page, status: statusFilter }));
    }
  }, [dispatch, isAuthenticated, page, statusFilter]);

  if (!isAuthenticated) {
    return (
      <LoginPrompt
        title="Please log in to view your orders"
        description="Sign in to see your order history and track deliveries."
      />
    );
  }

  const statuses = [
    "",
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "returned",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and track all your orders
          </p>
        </div>
        <Link
          to="/products"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"
            }`}
          >
            {s === "" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {myOrdersLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white h-32 rounded-xl shadow-sm border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchMyOrders({ page, status: statusFilter }))}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {!myOrdersLoading && !error && myOrders.length === 0 && (
        <div className="text-center py-20">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14v11H5V9z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No orders found
          </h2>
          <p className="text-gray-600 mb-6">
            {statusFilter
              ? "No orders match this status filter."
              : "You haven't placed any orders yet."}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}

      {!myOrdersLoading && !error && myOrders.length > 0 && (
        <>
          <div className="space-y-4">
            {myOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/account/orders/${order._id}`}
                        className="font-semibold text-gray-900 hover:text-indigo-600"
                      >
                        Order #{order.orderNumber}
                      </Link>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Placed on {formatDate(order.createdAt, true)} ·{" "}
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {order.items.map((i) => i.name).join(", ")}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex flex-wrap gap-2">
                      <OrderStatusBadge status={order.status} />
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600 text-lg">
                        {formatCurrency(order.totalPrice)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                      </p>
                    </div>
                    <Link
                      to={`/account/orders/${order._id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {myOrdersPagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {page} of {myOrdersPagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(myOrdersPagination.pages, p + 1))}
                disabled={page >= myOrdersPagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersPage;
