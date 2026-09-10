import { formatCurrency } from "../../utils/format";

const OrderSummary = ({ totals, coupon, children }) => {
  const rows = [
    {
      label: `Items (${totals.totalQuantity || 0})`,
      value: formatCurrency(totals.subtotal),
    },
    {
      label: "Product Discount",
      value: `- ${formatCurrency(totals.productDiscount)}`,
      highlight: totals.productDiscount > 0 ? "text-green-600" : "",
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>
      <dl className="space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <dt className="text-gray-600">{row.label}</dt>
            <dd className={`font-medium ${row.highlight || "text-gray-900"}`}>
              {row.value}
            </dd>
          </div>
        ))}

        {coupon ? (
          <>
            <div className="flex justify-between">
              <dt className="flex items-center gap-1.5 text-green-600">
                Coupon ({coupon.code})
              </dt>
              <dd className="font-medium text-green-600">
                - {formatCurrency(coupon.discountAmount)}
              </dd>
            </div>
            {coupon.description && (
              <p className="text-xs text-gray-500">{coupon.description}</p>
            )}
          </>
        ) : null}

        <div className="flex justify-between">
          <dt className="text-gray-600">Shipping</dt>
          <dd className="font-medium text-gray-900">
            {totals.shipping > 0 ? formatCurrency(totals.shipping) : "Free"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Tax (18%)</dt>
          <dd className="font-medium text-gray-900">
            {formatCurrency(totals.tax)}
          </dd>
        </div>

        <div className="border-t pt-3 flex justify-between">
          <dt className="font-semibold text-gray-900">Total</dt>
          <dd className="font-bold text-indigo-600 text-lg">
            {formatCurrency(totals.total)}
          </dd>
        </div>
      </dl>

      {totals.shipping > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          Free shipping on orders above{" "}
          <span className="font-medium">₹500</span>
        </p>
      )}

      {children}
    </div>
  );
};

export default OrderSummary;