import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVendorOrders,
  updateVendorOrderStatus,
} from "../../redux/slices/orderSlice";
import OrderTable from "../../components/vendor/OrderTable";

const VendorOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, actionLoading, actionError } = useSelector(
    (state) => state.order
  );

  const [toast, setToast] = useState("");

  useEffect(() => {
    dispatch(fetchVendorOrders({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (actionError) {
      setToast(actionError);
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [actionError]);

  const handleStatusChange = (orderId, itemId, status) => {
    dispatch(updateVendorOrderStatus({ orderId, itemId, status }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-gray-600 mt-1">
          Manage orders from your customers.
        </p>
      </div>

      {toast && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {toast}
        </div>
      )}

      <OrderTable
        orders={orders || []}
        loading={loading}
        error={error}
        onStatusChange={handleStatusChange}
        actionLoading={actionLoading}
      />
    </div>
  );
};

export default VendorOrders;