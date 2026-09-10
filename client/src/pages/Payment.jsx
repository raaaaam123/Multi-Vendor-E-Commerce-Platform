import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyPayment } from "../redux/slices/orderSlice";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    paymentOrder,
    paymentCreateLoading,
    paymentError,
    verifyLoading,
  } = useSelector((state) => state.order);
  const razorpayOrderId = useSelector((state) => state.order.paymentOrder?.payment?.orderId);
  const initiatedRef = useRef(false);

  const handleVerify = async (response) => {
    const result = await dispatch(
      verifyPayment({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      })
    );
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/payment/success");
    } else {
      navigate("/payment/failed");
    }
  };

  const loadAndOpen = async (payment) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      navigate("/payment/failed");
      return;
    }

    try {
      const options = {
        key: payment.keyId,
        amount: Math.round(payment.amount * 100),
        currency: payment.currency || "INR",
        name: "ShopVerse",
        description: `Order ${payment.orderNumber}`,
        order_id: payment.orderId,
        prefill: {
          name: payment.customerName,
          email: payment.customerEmail,
          contact: payment.customerPhone,
        },
        theme: {
          color: "#4f46e5",
        },
        handler: handleVerify,
        modal: {
          ondismiss: () => {
            navigate("/checkout");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        navigate("/payment/failed");
      });
      rzp.open();
    } catch (error) {
      console.error("Failed to open Razorpay checkout:", error);
      navigate("/payment/failed");
    }
  };

  useEffect(() => {
    if (!paymentOrder || !paymentOrder.payment) return;
    if (initiatedRef.current) return;
    initiatedRef.current = true;
    loadAndOpen(paymentOrder.payment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentOrder]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      {verifyLoading ? (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-indigo-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Payment...
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment securely.
          </p>
        </>
      ) : paymentCreateLoading ? (
        <>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-indigo-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Preparing Secure Payment
          </h1>
          <p className="text-gray-600">
            Creating your secure payment session...
          </p>
        </>
      ) : paymentError ? (
        <div>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Error
          </h1>
          <p className="text-gray-600 mb-4">{paymentError}</p>
          <button
            onClick={() => navigate("/checkout")}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Back to Checkout
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Completing Payment...
          </h1>
          <p className="text-gray-600 mb-8">
            {razorpayOrderId
              ? "Payment order created. Opening payment window..."
              : "Please wait..."}
          </p>
          <button
            onClick={() => navigate("/checkout")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
