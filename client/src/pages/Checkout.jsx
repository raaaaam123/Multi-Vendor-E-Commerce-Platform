import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, clearCart, applyCoupon, removeCoupon } from "../redux/slices/cartSlice";
import { fetchAddresses } from "../redux/slices/addressSlice";
import {
  placeOrder,
  createPaymentOrder,
  resetCurrentOrder,
  resetPaymentState,
} from "../redux/slices/orderSlice";
import { formatCurrency, formatDate } from "../utils/format";
import AddressSelector from "../components/checkout/AddressSelector";
import CouponInput from "../components/checkout/CouponInput";
import OrderSummary from "../components/checkout/OrderSummary";
import LoginPrompt from "../components/common/LoginPrompt";

const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery", description: "Pay when your order arrives" },
  { value: "upi", label: "UPI", description: "Pay via UPI (Google Pay, PhonePe, Paytm)" },
  { value: "card", label: "Credit / Debit Card", description: "Pay using your card" },
  { value: "netbanking", label: "Net Banking", description: "Pay via your bank's net banking" },
  { value: "wallet", label: "Digital Wallet", description: "Pay using a digital wallet" },
];

const ONLINE_PAYMENT_METHODS = ["upi", "card", "netbanking", "wallet"];

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const {
    items,
    coupon,
    totals,
    loading: cartLoading,
    actionError,
  } = useSelector((state) => state.cart);
  const addresses = useSelector((state) => state.addresses.addresses);
  const {
    placeOrderLoading,
    placeOrderError,
    currentOrder,
    paymentCreateLoading,
    paymentError,
  } = useSelector((state) => state.order);

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(resetCurrentOrder());
      dispatch(resetPaymentState());
      dispatch(fetchCart());
      dispatch(fetchAddresses());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const preferred =
        addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(preferred._id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (actionError) setCouponError(actionError);
  }, [actionError]);

  if (!isAuthenticated) {
    return (
      <LoginPrompt
        title="Please log in to checkout"
        description="Sign in to complete your purchase."
      />
    );
  }

  if (currentOrder) {
    const isOnline = ONLINE_PAYMENT_METHODS.includes(currentOrder.paymentMethod);
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
          Order {isOnline ? "Confirmed" : "Placed"} Successfully!
        </h1>
        <p className="text-gray-600 mb-6">
          {isOnline
            ? "Your payment is being processed. The order will be confirmed once payment is verified."
            : "Thank you for your purchase. Your order has been placed."}
        </p>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-left mb-6">
          <div className="flex justify-between border-b pb-3 mb-3">
            <span className="text-gray-600">Order Number</span>
            <span className="font-medium text-gray-900">{currentOrder.orderNumber || currentOrder._id}</span>
          </div>
          <div className="flex justify-between border-b pb-3 mb-3">
            <span className="text-gray-600">Placed on</span>
            <span className="font-medium text-gray-900">
              {formatDate(currentOrder.createdAt, true)}
            </span>
          </div>
          <div className="flex justify-between border-b pb-3 mb-3">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-medium text-gray-900 capitalize">
              {currentOrder.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total Paid</span>
            <span className="font-bold text-indigo-600 text-lg">
              {formatCurrency(currentOrder.totalPrice)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/account/orders/${currentOrder._id}`}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Track Order
          </Link>
          <Link
            to="/products"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Continue Shopping
          </Link>
          <Link
            to="/account/orders"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Go to My Orders
          </Link>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white h-32 rounded-xl shadow-sm border border-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-gray-600 mb-6">
          Add some products before checking out.
        </p>
        <Link
          to="/products"
          className="inline-flex bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (code) => {
    setCouponError("");
    setCouponLoading(true);
    const result = await dispatch(applyCoupon(code));
    setCouponLoading(false);
    if (result.error) {
      setCouponError(result.payload);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponError("");
    await dispatch(removeCoupon());
  };

  const placeOrderPayload = () => ({
    items: items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    })),
    addressId: selectedAddressId,
    paymentMethod,
    couponCode: coupon?.code || "",
  });

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setCouponError("Please select a shipping address");
      return;
    }

    const isOnline = ONLINE_PAYMENT_METHODS.includes(paymentMethod);

    if (isOnline) {
      const result = await dispatch(createPaymentOrder(placeOrderPayload()));
      if (result.meta.requestStatus === "fulfilled") {
        navigate("/payment");
      }
      return;
    }

    const result = await dispatch(placeOrder(placeOrderPayload()));
    if (result.meta.requestStatus === "fulfilled") {
      dispatch(clearCart());
    } else {
      dispatch(fetchCart());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <Link
          to="/cart"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Back to Cart
        </Link>
      </div>

      {(placeOrderError || paymentError) && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {placeOrderError || paymentError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cart Items ({totals.totalQuantity})
            </h2>
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const product = item.product;
                const finalPrice =
                  product.finalPrice ??
                  (product.discount > 0
                    ? Number(
                        (product.price - (product.price * product.discount) / 100).toFixed(2)
                      )
                    : product.price);
                const outOfStock = product.stock === 0;
                return (
                  <div
                    key={product._id}
                    className="flex items-center gap-4 py-4"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center text-gray-300">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${product._id}`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {product.name}
                      </Link>
                      {outOfStock && (
                        <p className="text-xs text-red-600 font-medium mt-0.5">
                          Out of stock
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(finalPrice * item.quantity)}
                      </p>
                      {product.discount > 0 && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatCurrency(product.price * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Shipping Address
              </h2>
              <Link
                to="/addresses"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Manage Addresses
              </Link>
            </div>
            <AddressSelector
              addresses={addresses}
              selectedId={selectedAddressId}
              onChange={setSelectedAddressId}
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Method
            </h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                    paymentMethod === method.value
                      ? "border-indigo-600 bg-indigo-50/50"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    className="mt-1 accent-indigo-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {method.label}
                    </p>
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Online payments are securely processed via Razorpay. Cash on
              Delivery is available as an option.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <OrderSummary totals={totals} coupon={coupon}>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Apply Coupon
                </p>
                <CouponInput
                  applied={coupon}
                  onApply={handleApplyCoupon}
                  onRemove={handleRemoveCoupon}
                  loading={couponLoading}
                  error={couponError}
                />
                {couponError && !coupon && (
                  <p className="mt-2 text-xs text-red-600">{couponError}</p>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={
                  placeOrderLoading ||
                  paymentCreateLoading ||
                  items.length === 0
                }
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {placeOrderLoading || paymentCreateLoading
                  ? "Processing..."
                  : ONLINE_PAYMENT_METHODS.includes(paymentMethod)
                  ? "Proceed to Pay"
                  : "Place Order"}
              </button>
            </div>
          </OrderSummary>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-sm">
            <h3 className="font-semibold text-gray-900 mb-2">
              Delivery Details
            </h3>
            <p className="text-gray-600">
              {totals.shipping > 0
                ? `Shipping charge of ${formatCurrency(totals.shipping)} applies below ₹500.`
                : "Free shipping on this order."}
            </p>
            <p className="text-gray-500 mt-1 text-xs">
              Prices are recalculated from the latest product prices at
              checkout. An 18% GST is included in the total.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
