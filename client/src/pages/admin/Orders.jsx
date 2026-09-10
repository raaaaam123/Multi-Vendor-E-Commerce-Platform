import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../../redux/slices/orderSlice";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import Modal from "../../components/admin/Modal";
import { formatCurrency, formatDate } from "../../utils/format";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, pagination, actionError } =
    useSelector((state) => state.order);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    dispatch(
      fetchOrders({
        search,
        status: statusFilter || undefined,
        page,
        limit: 10,
      })
    );
  }, [dispatch, search, statusFilter, page]);

  const handleStatusChange = async (id, status) => {
    await dispatch(updateOrderStatus({ id, status })).unwrap();
  };

  const handlePaymentChange = async (id, paymentStatus) => {
    await dispatch(updatePaymentStatus({ id, paymentStatus })).unwrap();
  };

  const statusFilterSelect = (
    <select
      value={statusFilter}
      onChange={(e) => {
        setStatusFilter(e.target.value);
        setPage(1);
      }}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">All Status</option>
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );

  const columns = [
    {
      key: "_id",
      header: "Order",
      render: (id) => (
        <span className="font-mono text-xs text-gray-600">
          {id?.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "user",
      header: "Customer",
      render: (user) => (
        <div>
          <p className="font-medium text-gray-900">{user?.name || "-"}</p>
          <p className="text-xs text-gray-500">{user?.email || ""}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (items) => (
        <span className="text-gray-700">
          {items?.reduce((sum, i) => sum + i.quantity, 0) || 0}
        </span>
      ),
    },
    {
      key: "totalPrice",
      header: "Total",
      render: (price) => formatCurrency(price),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (ps, order) => (
        <select
          value={ps}
          onChange={(e) => handlePaymentChange(order._id, e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (status, order) => (
        <select
          value={status}
          onChange={(e) => handleStatusChange(order._id, e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div>
      {actionError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {actionError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        error={error}
        emptyMessage="No orders found"
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by customer name..."
        filters={statusFilterSelect}
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={setPage}
        onRowClick={(order) => setViewOrder(order)}
        actions={(order) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewOrder(order);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            View
          </button>
        )}
      />

      <Modal
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title="Order Details"
        size="lg"
      >
        {viewOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Order Status</p>
                <StatusBadge status={viewOrder.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment</p>
                <StatusBadge status={viewOrder.paymentStatus} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Method</p>
                <p className="text-sm font-medium text-gray-900 uppercase">
                  {viewOrder.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(viewOrder.totalPrice)}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
              <div className="space-y-2">
                {viewOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Shipping Address
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{viewOrder.shippingAddress?.name}</p>
                  <p>{viewOrder.shippingAddress?.address}</p>
                  <p>
                    {viewOrder.shippingAddress?.city},{" "}
                    {viewOrder.shippingAddress?.state}{" "}
                    {viewOrder.shippingAddress?.zipCode}
                  </p>
                  <p>{viewOrder.shippingAddress?.country}</p>
                  <p>{viewOrder.shippingAddress?.phone}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex justify-between">
                    <span>Items</span>
                    <span>{formatCurrency(viewOrder.itemsPrice)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(viewOrder.taxPrice)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(viewOrder.shippingPrice)}</span>
                  </p>
                  {viewOrder.discountAmount > 0 && (
                    <p className="flex justify-between text-red-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(viewOrder.discountAmount)}</span>
                    </p>
                  )}
                  <p className="flex justify-between font-bold text-gray-900 pt-1">
                    <span>Total</span>
                    <span>{formatCurrency(viewOrder.totalPrice)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
