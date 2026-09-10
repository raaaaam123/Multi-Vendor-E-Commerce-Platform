import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createReview,
  updateReview,
  clearReviewError,
} from "../../redux/slices/reviewSlice";
import RatingStars from "./RatingStars";

const ReviewForm = ({
  productId,
  review = null,
  onCancelEdit = null,
  compact = false,
}) => {
  const dispatch = useDispatch();
  const { actionLoading, actionError } = useSelector((state) => state.review);
  const [rating, setRating] = useState(review?.rating || 5);
  const [comment, setComment] = useState(review?.comment || "");
  const [images, setImages] = useState(review?.images || []);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
      setImages(review.images || []);
    }
  }, [review]);

  useEffect(() => {
    return () => dispatch(clearReviewError());
  }, [dispatch]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPreviewLoading(true);
    const readers = files.slice(0, 3).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((results) => {
      setImages((prev) => [...prev, ...results].slice(0, 3));
      setPreviewLoading(false);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    const payload = { rating, comment: comment.trim(), images };
    const result = review
      ? await dispatch(updateReview({ reviewId: review._id, payload }))
      : await dispatch(createReview({ productId, payload }));
    if (result.meta.requestStatus === "fulfilled" && !review && !onCancelEdit) {
      setComment("");
      setRating(5);
      setImages([]);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {review ? "Edit Your Review" : "Write a Review"}
      </h3>

      {compact && review && (
        <p className="text-sm text-gray-500 mb-4">
          You already reviewed this product. You can edit or delete it below.
        </p>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating
        </label>
        <RatingStars value={rating} onChange={setRating} size="w-7 h-7" />
        <p className="text-xs text-gray-400 mt-1">
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating] ||
            "Select a rating"}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Share your experience with this product..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {comment.length}/1000
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Photos (optional, up to 3)
        </label>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={img}
                alt={`Review ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-gray-900/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-900"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
          {images.length < 3 && (
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:border-indigo-500 hover:text-indigo-500">
              {previewLoading ? (
                <span className="text-xs animate-pulse">Loading...</span>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-[10px] mt-1">Add Photo</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {actionError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={actionLoading || !rating || !comment.trim()}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading
            ? "Submitting..."
            : review
            ? "Update Review"
            : "Submit Review"}
        </button>
        {onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={actionLoading}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;