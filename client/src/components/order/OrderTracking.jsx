import { ORDER_TIMELINE, getOrderStatusMeta } from "../../utils/orderUtils";
import { formatDate } from "../../utils/format";

const OrderTracking = ({ order }) => {
  const currentMeta = getOrderStatusMeta(order?.status);
  const step = currentMeta.step;

  if (!order) return null;

  const isTerminal = step < 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Order Status
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Tracking number:{" "}
        <span className="font-medium text-gray-900">
          {order.trackingNumber || "-"}
        </span>
      </p>

      {isTerminal ? (
        <div className="py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-500"
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
          <h3 className="font-semibold text-gray-900">
            {getOrderStatusMeta(order.status).label}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {order.status === "cancelled" && order.cancelledAt
              ? `Cancelled on ${formatDate(order.cancelledAt, true)}`
              : order.status === "returned"
              ? "This order has been returned"
              : ""}
          </p>
        </div>
      ) : (
        <ol className="relative">
          {ORDER_TIMELINE.map((item, index) => {
            const isActive = item.key === order.status;
            const isReached = index <= step;
            return (
              <li key={item.key} className="relative flex gap-4 pb-6 last:pb-0">
                {index < ORDER_TIMELINE.length - 1 && (
                  <span
                    className={`absolute left-3.5 top-8 h-full w-0.5 ${
                      isReached ? "bg-indigo-500" : "bg-gray-200"
                    }`}
                  />
                )}
                <div className="relative">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                      isReached
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {isReached && index < step ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </span>
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      isReached ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </p>
                  {isActive && (
                    <p className="text-xs text-indigo-600 font-medium mt-0.5">
                      Current Status
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default OrderTracking;
