import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "../redux/slices/cartSlice";
import { formatCurrency } from "../utils/format";
import LoginPrompt from "../components/common/LoginPrompt";

const CartPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, totals, loading, updating, error, actionError } = useSelector(
    (state) => state.cart
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <LoginPrompt
        title="Please log in to view your cart"
        description="Your cart is saved securely to your account."
      />
    );
  }

  if (loading) {
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => dispatch(fetchCart())}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleQuantityChange = (productId, currentQty, delta) => {
    const next = currentQty + delta;
    if (next < 1) return;
    dispatch(updateCartQuantity({ productId, quantity: next }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {actionError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {actionError}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
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
            const maxQty = Math.min(item.quantity, product.stock);

            return (
              <div
                key={product._id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4"
              >
                <Link
                  to={`/products/${product._id}`}
                  className="w-24 h-24 bg-gray-100 rounded-lg shrink-0 overflow-hidden flex items-center justify-center text-gray-300"
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${product._id}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {product.brand?.name || "ShopVerse"}
                    {product.vendor?.businessName
                      ? ` · ${product.vendor.businessName}`
                      : ""}
                  </p>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-indigo-600 font-bold">
                      {formatCurrency(finalPrice)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                    {product.discount > 0 && (
                      <span className="text-xs text-red-500">
                        {product.discount}% off
                      </span>
                    )}
                  </div>

                  {outOfStock ? (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      Out of stock — please remove this item.
                    </p>
                  ) : product.stock < item.quantity ? (
                    <p className="mt-2 text-sm text-amber-600 font-medium">
                      Only {product.stock} available — updated to {maxQty}.
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() =>
                          handleQuantityChange(product._id, item.quantity, -1)
                        }
                        disabled={updating || item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-indigo-600 disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {outOfStock ? 0 : Math.min(item.quantity, product.stock)}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(product._id, item.quantity, 1)
                        }
                        disabled={
                          updating || outOfStock || item.quantity >= product.stock
                        }
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-indigo-600 disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(finalPrice * item.quantity)}
                    </span>

                    <button
                      onClick={() => dispatch(removeFromCart(product._id))}
                      disabled={updating}
                      className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between">
            <button
              onClick={() => dispatch(clearCart())}
              disabled={updating}
              className="text-sm text-gray-500 hover:text-red-600 font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24 space-y-3 text-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="flex justify-between">
              <span className="text-gray-600">Items</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>
            {totals.mrpTotal > totals.subtotal && (
              <div className="flex justify-between">
                <span className="text-gray-600">MRP</span>
                <span className="text-gray-400 line-through">
                  {formatCurrency(totals.mrpTotal)}
                </span>
              </div>
            )}
            {totals.productDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Product Discount</span>
                <span className="font-medium text-green-600">
                  - {formatCurrency(totals.productDiscount)}
                </span>
              </div>
            )}
            {totals.couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Coupon</span>
                <span className="font-medium text-green-600">
                  - {formatCurrency(totals.couponDiscount)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-900">
                {totals.shipping > 0 ? formatCurrency(totals.shipping) : "Free"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (18%)</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(totals.tax)}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-indigo-600 text-lg">
                {formatCurrency(totals.total)}
              </span>
            </div>

            <Link
              to="/checkout"
              className="block w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors mt-4"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/products"
              className="block w-full text-center text-indigo-600 py-3 rounded-lg font-medium hover:text-indigo-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;