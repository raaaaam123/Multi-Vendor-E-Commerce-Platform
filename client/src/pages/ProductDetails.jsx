import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicProduct, clearCatalogProduct } from "../redux/slices/catalogSlice";
import { addToCart } from "../redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "../redux/slices/wishlistSlice";
import { formatCurrency } from "../utils/format";
import Rating from "../components/product/Rating";
import RatingStars from "../components/review/RatingStars";
import ReviewForm from "../components/review/ReviewForm";
import ReviewList from "../components/review/ReviewList";
import { fetchProductReviews, fetchMyReview, fetchReviewEligibility } from "../redux/slices/reviewSlice";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, productLoading, productError } = useSelector(
    (state) => state.catalog
  );
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const isStaff = isAuthenticated && user && (user.role === "admin" || user.role === "vendor");
  const cartActionError = useSelector((state) => state.cart.actionError);
  const { myReview, eligibility, eligibilityLoading } = useSelector((state) => state.review);
  const inWishlist = useSelector((state) =>
    state.wishlist.products.some((p) => p._id === product?._id)
  );
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [editingReview, setEditingReview] = useState(false);

  useEffect(() => {
    dispatch(clearCatalogProduct());
    setActiveImage(0);
    setQuantity(1);
    setAddedToCart(false);
    setEditingReview(false);
    dispatch(fetchPublicProduct(id));
    dispatch(fetchProductReviews(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      dispatch(fetchMyReview(id));
      dispatch(fetchReviewEligibility(id));
    }
  }, [dispatch, id, isAuthenticated]);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setAddedToCart(false);
  }, [product?._id]);

  if (productLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-100 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded w-1/2" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Product not found
        </h1>
        <p className="text-gray-600 mb-6">
          {productError || "This product may have been removed or is unavailable."}
        </p>
        <Link
          to="/products"
          className="inline-flex bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const finalPrice =
    product.finalPrice ??
    (product.discount > 0
      ? Number((product.price - (product.price * product.discount) / 100).toFixed(2))
      : product.price);
  const images = product.images?.length ? product.images : [null];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const result = await dispatch(
      addToCart({ productId: product._id, quantity })
    );
    if (result.meta.requestStatus === "fulfilled") {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const result = await dispatch(
      addToCart({ productId: product._id, quantity, set: true })
    );
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/checkout");
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (inWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link
              to={`/products?category=${product.category.slug || product.category._id}`}
              className="hover:text-indigo-600"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-white rounded-xl border border-gray-100 overflow-hidden">
            {images[activeImage] ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-lg border-2 overflow-hidden ${
                    activeImage === i
                      ? "border-indigo-600"
                      : "border-gray-200"
                  }`}
                >
                  {img && (
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brand?.name && (
            <span className="text-sm text-gray-500 uppercase tracking-wide">
              {product.brand.name}
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            {product.name}
          </h1>

          <div className="mt-3">
            <Rating value={product.rating} count={product.numReviews} />
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold text-indigo-600">
              {formatCurrency(finalPrice)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm text-red-500 font-medium bg-red-50 px-2 py-1 rounded">
                  Save {product.discount}%
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <span>SKU:</span>
            <span>{product.sku || "N/A"}</span>
          </div>

          <div className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>

          <div className="mt-6">
            <p className="text-gray-700 leading-relaxed">
              {product.description || "No description available."}
            </p>
          </div>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-gray-600 hover:text-indigo-600"
              >
                -
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                disabled={product.stock > 0 && quantity >= product.stock}
                className="px-3 py-2 text-gray-600 hover:text-indigo-600 disabled:opacity-40"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {addedToCart ? "Added to Cart!" : "Add to Cart"}
            </button>

            <button
              onClick={handleWishlist}
              aria-label="Toggle wishlist"
              className={`p-3 rounded-lg border transition-colors ${
                inWishlist
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill={inWishlist ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          {!isStaff && (
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full mt-3 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          )}

          {cartActionError && (
            <p className="mt-3 text-sm text-red-600">{cartActionError}</p>
          )}

          {product.vendor?.businessName && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Sold by</p>
              <p className="font-medium text-gray-900">
                {product.vendor.businessName || product.vendor.name}
              </p>
              {product.vendor.businessAddress && (
                <p className="text-sm text-gray-500 mt-1">
                  {product.vendor.businessAddress}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Customer Reviews
          </h2>
          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <RatingStars value={Number(product.rating) || 0} />
              <span className="text-sm text-gray-500 font-medium">
                {Number(product.rating || 0).toFixed(1)} · {product.numReviews || 0}{" "}
                {product.numReviews === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}
        </div>

        {isAuthenticated && !eligibilityLoading && eligibility?.canReview && (
          <div className="mb-8">
            <ReviewForm productId={id} />
            <p className="text-xs text-gray-400 mt-2">
              You can review this product because you've purchased it.
            </p>
          </div>
        )}

        {isAuthenticated &&
          !eligibilityLoading &&
          eligibility?.purchased === false &&
          !myReview && (
            <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-sm text-gray-600">
                Only customers who have purchased this product can leave a
                review.
              </p>
            </div>
          )}

        {isAuthenticated && myReview && !editingReview && (
          <div className="mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Review
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <RatingStars value={myReview.rating} />
                <p className="text-sm text-gray-500">
                  {myReview.rating}/5
                </p>
              </div>
              {myReview.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 mb-3">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified Purchase
                </span>
              )}
              {myReview.comment && (
                <p className="text-sm text-gray-700 mb-4">{myReview.comment}</p>
              )}
              {myReview.images?.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {myReview.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Your review photo ${i + 1}`}
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => setEditingReview(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Edit Review
              </button>
            </div>
          </div>
        )}

        {isAuthenticated && myReview && editingReview && (
          <div className="mb-8">
            <ReviewForm
              productId={id}
              review={myReview}
              onCancelEdit={() => setEditingReview(false)}
            />
          </div>
        )}

        {!isAuthenticated && (
          <div className="mb-8 bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
            <p className="text-sm text-gray-600 mb-3">
              Share your experience! Log in to write a review.
            </p>
            <Link
              to="/login"
              className="inline-flex bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Log In to Review
            </Link>
          </div>
        )}

        <ReviewList productId={id} />
      </div>
    </div>
  );
};

export default ProductDetails;
