const StarIcon = ({ filled, half }) => (
  <svg
    className={`w-4 h-4 ${
      filled ? "text-yellow-400" : half ? "text-yellow-300" : "text-gray-300"
    }`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.958c.3.921-.755 1.688-1.54 1.118l-3.367-2.446a1 1 0 00-1.175 0l-3.367 2.446c-.784.57-1.838-.197-1.539-1.118l1.285-3.958a1 1 0 00-.363-1.118L2.22 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
  </svg>
);

const Rating = ({ value = 0, count, className = "" }) => {
  const numValue = Number(value) || 0;
  const fullStars = Math.floor(numValue);
  const halfStar = numValue - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {Array.from({ length: fullStars }).map((_, i) => (
          <StarIcon key={`f-${i}`} filled />
        ))}
        {halfStar && <StarIcon key="half" half />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <StarIcon key={`e-${i}`} />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500">
          {numValue > 0 ? numValue.toFixed(1) : "No"}{" "}
          {numValue > 0 ? `(${count})` : "reviews"}
        </span>
      )}
    </div>
  );
};

export default Rating;
