import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments } from "../../redux/slices/adminSlice";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/format";

const Payments = () => {
  const dispatch = useDispatch();
  const { payments, loading, error, pagination } = useSelector(
    (state) => state.admin
  );
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchPayments({
        paymentStatus: paymentStatusFilter || undefined,
        page,
        limit: 10,
      })
    );
  }, [dispatch, paymentStatusFilter, page]);

  const statusFilterSelect = (
    <select
      value={paymentStatusFilter}
      onChange={(e) => {
        setPaymentStatusFilter(e.target.value);
        setPage(1);
      }}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">All Payments</option>
      <option value="pending">Pending</option>
      <option value="paid">Paid</option>
      <option value="failed">Failed</option>
      <option value="refunded">Refunded</option>
    </select>
  );

  const columns = [
    {
      key: "_id",
      header: "Payment ID",
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
      key: "totalPrice",
      header: "Amount",
      render: (price) => formatCurrency(price),
    },
    {
      key: "paymentMethod",
      header: "Method",
      render: (method) => (
        <span className="uppercase text-xs font-medium text-gray-700">
          {method}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        error={error}
        emptyMessage="No payments found"
        filters={statusFilterSelect}
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default Payments;
