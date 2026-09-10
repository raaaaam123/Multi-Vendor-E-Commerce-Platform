import { useState } from "react";

const StarIcon = ({ filled, size = "w-5 h-5" }) => (
  <svg
    className={`${size} ${
      filled ? "text-yellow-400" : "text-gray-300"
    }`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.958c.3.921-.755 1.688-1.54 1.118l-3.367-2.446a1 1 0 00-1.175 0l-3.367 2.446c-.784.57-1.838-.197-1.539-1.118l1.285-3.958a1 1 0 00-.363-1.118L2.22 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
  </svg>
);

const RatingStars = ({
  value = 0,
  onChange = null,
  size = "w-5 h-5",
  disabled = false,
}) => {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === "function";

  const renderStar = (index) => {
    const position = index + 1;
    const active = interactive
      ? (hover || value) >= position
      : value >= position;

    return (
      <button
        key={index}
        type="button"
        disabled={disabled || !interactive}
        onMouseEnter={() => interactive && setHover(position)}
        onMouseLeave={() => interactive && setHover(0)}
        onClick={() => interactive && onChange(position)}
        className={`${
          interactive ? "cursor-pointer" : "cursor-default"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        aria-label={`${position} star${position > 1 ? "s" : ""}`}
      >
        <StarIcon filled={active} size={size} />
      </button>
    );
  };

  return (
    <div className="flex items-center gap-0.5" role="radiogroup">
      {Array.from({ length: 5 }).map((_, i) => renderStar(i))}
    </div>
  );
};

export default RatingStars;