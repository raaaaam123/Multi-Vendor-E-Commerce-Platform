import {
  getOrderStatusMeta,
  getPaymentStatusMeta,
} from "../../utils/orderUtils";

const OrderStatusBadge = ({ status }) => {
  const meta = getOrderStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${meta.color}`}
    >
      {meta.label}
    </span>
  );
};

const PaymentStatusBadge = ({ status }) => {
  const meta = getPaymentStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${meta.color}`}
    >
      {meta.label}
    </span>
  );
};

export { OrderStatusBadge, PaymentStatusBadge };
