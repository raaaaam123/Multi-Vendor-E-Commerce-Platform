import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWishlist,
  removeFromWishlist,
} from "../redux/slices/wishlistSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { formatCurrency } from "../utils/format";
import Rating from "../components/product/Rating";
import LoginPrompt from "../components/common/LoginPrompt";

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { products, loading, updating, error } = useSelector(
    (state) => state.wishlist
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <LoginPrompt
        title="Please log in to view your wishlist"
        description="Your saved items are stored securely in your account."
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
              className="bg-white h-24 rounded-xl shadow-sm border border-gray-100"
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
          onClick={() => dispatch(fetchWishlist())}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        <div className="bg-white rounded-xl p-16 shadow-sm border border-gray-100 text-center">
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
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Save items you love to your wishlist and come back anytime.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Discover Products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
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
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
            >
              <Link
                to={`/products/${product._id}`}
                className="flex items-center justify-center bg-gray-50 h-40 overflow-hidden"
              >
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <svg
                    className="w-12 h-12 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                )}
              </Link>

              <div className="p-4 flex flex-col flex-1">
                <Link
                  to={`/products/${product._id}`}
                  className="font-semibold text-gray-900 hover:text-indigo-600"
                >
                  {product.name}
                </Link>
                <div className="mt-1">
                  <Rating value={product.rating} count={product.numReviews} />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-bold text-indigo-600">
                    {formatCurrency(finalPrice)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t mt-auto">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={outOfStock || updating}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {outOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>
                  <button
                    onClick={() => dispatch(removeFromWishlist(product._id))}
                    disabled={updating}
                    aria-label="Remove from wishlist"
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors border border-gray-200 rounded-lg"
                  >
                    <svg
                      className="w-5 h-5"
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
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;