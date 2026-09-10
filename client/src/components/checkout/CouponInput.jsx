import { useState } from "react";
import CouponMessage from "./CouponMessage";

const CouponInput = ({
  applied,
  onApply,
  onRemove,
  loading,
  _error,
}) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");
    onApply(code.trim());
  };

  if (applied) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">
              Coupon applied: {applied.code}
            </p>
            {applied.description && (
              <p className="text-xs text-green-600 mt-0.5">
                {applied.description}
              </p>
            )}
          </div>
          <button
            onClick={onRemove}
            className="text-xs text-green-700 hover:text-green-900 font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter coupon code"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </form>
      {(error || _error) && (
        <CouponMessage type="error" message={_error || error} />
      )}
    </div>
  );
};

export default CouponInput;