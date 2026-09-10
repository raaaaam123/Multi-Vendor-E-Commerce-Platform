import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyOrder,
  cancelMyOrder,
  trackMyOrder,
} from "../redux/slices/orderSlice";
import { formatCurrency, formatDate } from "../utils/format";
import { PAYMENT_METHOD_LABELS } from "../utils/orderUtils";
import { OrderStatusBadge, PaymentStatusBadge } from "../components/order/OrderStatusBadge";
import OrderTracking from "../components/order/OrderTracking";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    myOrder,
    myOrderLoading,
    cancelLoading,
    cancelError,
    error,
    tracking,
  } = useSelector((state) => state.order);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchMyOrder(id));
      dispatch(trackMyOrder(id));
    }
  }, [dispatch, id]);

  if (myOrderLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white h-96 rounded-xl shadow-sm border border-gray-100 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link
          to="/account/orders"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  if (!myOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Order not found
        </h2>
        <Link
          to="/account/orders"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  const cancellableStatuses = ["pending", "confirmed", "processing"];

  const handleCancel = async () => {
    const result = await dispatch(cancelMyOrder(id));
    if (result.meta.requestStatus === "fulfilled") {
      setShowCancelConfirm(false);
      dispatch(trackMyOrder(id));
    }
  };

  const orderItemsTotal = myOrder.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/account/orders"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to My Orders
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{myOrder.orderNumber}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Placed on {formatDate(myOrder.createdAt, true)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={myOrder.status} />
          <PaymentStatusBadge status={myOrder.paymentStatus} />
        </div>
      </div>

      {cancelError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {cancelError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="divide-y divide-gray-100">
              {myOrder.items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 py-4">
                  <Link
                    to={`/products/${item.product}`}
                    className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 shrink-0"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {item.name}
                    </Link>
                    {item.vendor?.businessName && (
                      <p className="text-xs text-gray-500">
                        Sold by {item.vendor.businessName}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(item.price)} each
                    </p>
                    {!["cancelled", "returned"].includes(myOrder.status) && (
                      <Link
                        to={`/products/${item.product}`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1 inline-block"
                      >
                        Write a Review
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-900">
                {myOrder.shippingAddress.name}
              </p>
              <p className="text-gray-600">
                {myOrder.shippingAddress.address}
                {myOrder.shippingAddress.city
                  ? `, ${myOrder.shippingAddress.city}`
                  : ""}
                {myOrder.shippingAddress.state
                  ? `, ${myOrder.shippingAddress.state}`
                  : ""}
                {myOrder.shippingAddress.zipCode
                  ? ` - ${myOrder.shippingAddress.zipCode}`
                  : ""}
              </p>
              <p className="text-gray-600">
                {myOrder.shippingAddress.country} · Phone:{" "}
                {myOrder.shippingAddress.phone}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Payment Method</p>
                <p className="font-medium text-gray-900">
                  {PAYMENT_METHOD_LABELS[myOrder.paymentMethod] ||
                    myOrder.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Payment Status</p>
                <PaymentStatusBadge status={myOrder.paymentStatus} />
              </div>
              {myOrder.paymentId && (
                <div>
                  <p className="text-gray-500">Payment ID</p>
                  <p className="font-medium text-gray-900 break-all">
                    {myOrder.paymentId}
                  </p>
                </div>
              )}
              {myOrder.razorpayOrderId && (
                <div>
                  <p className="text-gray-500">Razorpay Order ID</p>
                  <p className="font-medium text-gray-900 break-all">
                    {myOrder.razorpayOrderId}
                  </p>
                </div>
              )}
              {myOrder.trackingNumber && (
                <div>
                  <p className="text-gray-500">Tracking Number</p>
                  <p className="font-medium text-gray-900">
                    {myOrder.trackingNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          {cancellableStatuses.includes(myOrder.status) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-700 mb-2">Cancel Order</h3>
              <p className="text-sm text-red-600 mb-3">
                You can cancel this order while it is still in the "pending",
                "confirmed", or "processing" stage. Items will be restocked and
                any paid amount will be refunded.
              </p>
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={cancelLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel Order
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={cancelLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelLoading ? "Cancelling..." : "Confirm Cancellation"}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelLoading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    Keep Order
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <OrderTracking order={tracking || myOrder} />

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Price Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(orderItemsTotal)}
                </span>
              </div>
              {myOrder.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">
                    - {formatCurrency(myOrder.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">
                  {myOrder.shippingPrice > 0
                    ? formatCurrency(myOrder.shippingPrice)
                    : "Free"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18%)</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(myOrder.taxPrice)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-indigo-600 text-lg">
                  {formatCurrency(myOrder.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
