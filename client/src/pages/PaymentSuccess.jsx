import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatCurrency, formatDate } from "../utils/format";

const PaymentSuccessPage = () => {
  const { currentOrder } = useSelector((state) => state.order);

  useEffect(() => {
    document.title = "Payment Successful | ShopVerse";
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Payment Successful!
      </h1>
      <p className="text-gray-600 mb-8">
        Your payment was processed successfully. Your order has been confirmed.
      </p>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-left mb-8">
        {currentOrder ? (
          <>
            <div className="flex justify-between border-b pb-3 mb-3">
              <span className="text-gray-600">Order Number</span>
              <span className="font-medium text-gray-900">
                {currentOrder.orderNumber || currentOrder._id}
              </span>
            </div>
            <div className="flex justify-between border-b pb-3 mb-3">
              <span className="text-gray-600">Placed on</span>
              <span className="font-medium text-gray-900">
                {formatDate(currentOrder.createdAt, true)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-3 mb-3">
              <span className="text-gray-600">Payment Status</span>
              <span className="font-medium text-green-600 capitalize">
                {currentOrder.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between border-b pb-3 mb-3">
              <span className="text-gray-600">Order Status</span>
              <span className="font-medium text-gray-900 capitalize">
                {currentOrder.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Paid</span>
              <span className="font-bold text-indigo-600 text-lg">
                {formatCurrency(currentOrder.totalPrice)}
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            Your payment has been processed.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {currentOrder && (
          <Link
            to={`/account/orders/${currentOrder._id}`}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            View Order
          </Link>
        )}
        <Link
          to="/account/orders"
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
        >
          My Orders
        </Link>
        <Link
          to="/products"
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
