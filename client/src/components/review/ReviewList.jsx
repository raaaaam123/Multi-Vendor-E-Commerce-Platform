import { useDispatch, useSelector } from "react-redux";
import {
  deleteReview,
  fetchProductReviews,
} from "../../redux/slices/reviewSlice";
import RatingStars from "./RatingStars";
import { formatDate } from "../../utils/format";

const breakdown = (reviews) => {
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const idx = Math.min(5, Math.max(1, Number(r.rating))) - 1;
    counts[idx] += 1;
  });
  const total = reviews.length || 1;
  return counts
    .slice()
    .reverse()
    .map((count, starIndex) => ({
      stars: 5 - starIndex,
      count,
      pct: Math.round((count / total) * 100),
    }));
};

const ReviewList = ({ productId }) => {
  const dispatch = useDispatch();
  const { reviews, pagination, loading, actionLoading } =
    useSelector((state) => state.review);
  const currentUser = useSelector((state) => state.auth.user);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const handleDelete = async (reviewId) => {
    const result = await dispatch(deleteReview(reviewId));
    if (result.meta.requestStatus === "fulfilled") {
      dispatch(fetchProductReviews(productId));
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl font-bold text-gray-900">
            {averageRating}
          </div>
          <div>
            <RatingStars value={Number(averageRating)} />
            <p className="text-xs text-gray-500 mt-1">
              Based on {pagination.total || reviews.length}{" "}
              {pagination.total === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          {breakdown(reviews).map(({ stars, count, pct }) => (
            <div key={stars} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-8 shrink-0">{stars} star{stars > 1 ? "s" : ""}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-gray-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        )}

        {reviews.map((review) => {
          const isOwner =
            currentUser?._id && review.user?._id === currentUser._id;
          return (
            <div key={review._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {review.user?.avatar ? (
                    <img
                      src={review.user.avatar}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                      {(review.user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {review.user?.name || "Anonymous"}
                      </p>
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(review.createdAt, true)}
                    </p>
                  </div>
                </div>
                <RatingStars value={review.rating} />
              </div>
              {review.comment && (
                <p className="text-sm text-gray-700 mt-4 leading-relaxed">
                  {review.comment}
                </p>
              )}
              {review.images?.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {review.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Review photo ${i + 1}`}
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                    />
                  ))}
                </div>
              )}
              {isOwner && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleDelete(review._id)}
                    disabled={actionLoading}
                    className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewList;