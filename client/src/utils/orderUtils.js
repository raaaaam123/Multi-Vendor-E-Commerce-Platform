const ORDER_STATUS_META = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-700", step: 0 },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", step: 1 },
  processing: { label: "Processing", color: "bg-indigo-100 text-indigo-700", step: 2 },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700", step: 3 },
  out_for_delivery: { label: "Out for Delivery", color: "bg-cyan-100 text-cyan-700", step: 4 },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", step: 5 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", step: -1 },
  returned: { label: "Returned", color: "bg-amber-100 text-amber-700", step: -2 },
};

const PAYMENT_STATUS_META = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Paid", color: "bg-green-100 text-green-700" },
  failed: { label: "Failed", color: "bg-red-100 text-red-700" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-700" },
};

export const getOrderStatusMeta = (status) =>
  ORDER_STATUS_META[status] || { label: status, color: "bg-gray-100 text-gray-700", step: 0 };

export const getPaymentStatusMeta = (status) =>
  PAYMENT_STATUS_META[status] || { label: status, color: "bg-gray-100 text-gray-700" };

export const ORDER_TIMELINE = [
  { key: "pending", label: "Ordered" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  card: "Credit / Debit Card",
  upi: "UPI",
  netbanking: "Net Banking",
  wallet: "Digital Wallet",
};
