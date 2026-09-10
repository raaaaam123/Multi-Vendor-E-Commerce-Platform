import { Link } from "react-router-dom";

const PaymentFailedPage = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Payment Failed
      </h1>
      <p className="text-gray-600 mb-8">
        Unfortunately, your payment could not be completed. Please try again or
        choose a different payment method. No amount has been deducted if the
        payment failed during the attempt.
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-sm text-amber-800 mb-8">
        <p className="font-medium mb-1">What to do next:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Check your bank/card details and try again.</li>
          <li>Ensure sufficient balance or credit limit.</li>
          <li>You can retry from your cart - items are still saved.</li>
          <li>Your cart has not been charged for this failed attempt.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/checkout"
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
        >
          Retry Checkout
        </Link>
        <Link
          to="/cart"
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
        >
          View Cart
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

export default PaymentFailedPage;
