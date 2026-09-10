import StatusBadge from "../admin/StatusBadge";
import { formatCurrency } from "../../utils/format";

const ORDER_STATUSES = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"];

const OrderRow = ({
  order,
  onStatusChange,
  actionLoading,
}) => {
  return (
    <>
      {order.items.map((item, idx) => (
        <tr
          key={`${order._id}-${item._id || idx}`}
          className="hover:bg-gray-50"
        >
          {idx === 0 && (
            <td
              rowSpan={order.items.length}
              className="px-4 py-3 align-top"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {order.user?.name || "-"}
                </p>
                <p className="text-xs text-gray-500">{order.user?.email}</p>
              </div>
            </td>
          )}
          <td className="px-4 py-3 text-sm text-gray-800">
            {item.name}
          </td>
          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
            {item.quantity} × {formatCurrency(item.price)}
          </td>
          <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
            {formatCurrency(item.price * item.quantity)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <StatusBadge status={order.status} />
          </td>
          {idx === 0 && (
            <td
              rowSpan={order.items.length}
              className="px-4 py-3 align-top"
            >
              <select
                value={order.status}
                onChange={(e) =>
                  onStatusChange(order._id, item._id, e.target.value)
                }
                disabled={actionLoading}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </td>
          )}
        </tr>
      ))}
    </>
  );
};

const OrderTable = ({ orders, loading, error, onStatusChange, actionLoading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex justify-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Qty × Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Update
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {orders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                onStatusChange={onStatusChange}
                actionLoading={actionLoading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
