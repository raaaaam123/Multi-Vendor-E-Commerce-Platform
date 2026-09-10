import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVendors,
  approveVendor,
  rejectVendor,
  blockVendor,
  unblockVendor,
} from "../../redux/slices/adminSlice";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { formatDate } from "../../utils/format";

const Vendors = () => {
  const dispatch = useDispatch();
  const { vendors, loading, error, pagination, actionLoading, actionError } =
    useSelector((state) => state.admin);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [actionTarget, setActionTarget] = useState(null);

  useEffect(() => {
    dispatch(
      fetchVendors({
        search,
        status: statusFilter || undefined,
        page,
        limit: 10,
      })
    );
  }, [dispatch, search, statusFilter, page]);

  const handleActionClick = (vendor) => {
    if (
      vendor.approvalStatus === "pending" ||
      vendor.approvalStatus === "rejected"
    ) {
      setActionTarget({ vendor, type: "approve" });
    } else if (vendor.status === "suspended") {
      setActionTarget({ vendor, type: "unblock" });
    } else {
      setActionTarget({ vendor, type: "block" });
    }
  };

  const confirmAction = () => {
    if (!actionTarget) return;
    const { vendor, type } = actionTarget;
    switch (type) {
      case "approve":
        dispatch(approveVendor(vendor._id));
        break;
      case "block":
        dispatch(blockVendor(vendor._id));
        break;
      case "unblock":
        dispatch(unblockVendor(vendor._id));
        break;
      case "reject":
        dispatch(rejectVendor(vendor._id));
        break;
      default:
        break;
    }
    setActionTarget(null);
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
      <option value="active">Active / Approved</option>
      <option value="inactive">Pending Approval</option>
      <option value="suspended">Blocked</option>
    </select>
  );

  const columns = [
    {
      key: "name",
      header: "Vendor",
      render: (_, vendor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
            {vendor.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{vendor.name}</p>
            <p className="text-xs text-gray-500">{vendor.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (phone) => phone || "-",
    },
    {
      key: "status",
      header: "Approval Status",
      render: (status, vendor) => {
        const approvalStatus = vendor.approvalStatus;
        const displayStatus =
          approvalStatus ||
          (status === "active"
            ? "approved"
            : status === "suspended"
            ? "blocked"
            : "pending");
        const statusForBadge =
          approvalStatus === "approved" || status === "active"
            ? "active"
            : approvalStatus === "rejected"
            ? "inactive"
            : status === "suspended"
            ? "suspended"
            : "inactive";
        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={statusForBadge} />
            <span className="text-xs text-gray-500 capitalize">
              {displayStatus}
            </span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Registered",
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
        data={vendors}
        loading={loading}
        error={error}
        emptyMessage="No vendors found"
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search vendors..."
        filters={statusFilterSelect}
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={setPage}
        actions={(vendor) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleActionClick(vendor)}
              disabled={actionLoading}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                vendor.approvalStatus === "approved" &&
                vendor.status !== "suspended"
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-green-50 text-green-600 hover:bg-green-100"
              }`}
            >
              {vendor.approvalStatus === "pending" ||
              vendor.approvalStatus === "rejected"
                ? "Approve"
                : vendor.status === "suspended"
                ? "Unblock"
                : "Block"}
            </button>
            {vendor.approvalStatus === "pending" && (
              <button
                onClick={() =>
                  setActionTarget({ vendor, type: "reject" })
                }
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
            )}
          </div>
        )}
      />

      <ConfirmDialog
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={confirmAction}
        loading={actionLoading}
        title={actionTarget?.type === "approve" ? "Approve Vendor" : actionTarget?.type === "reject" ? "Reject Vendor" : actionTarget?.type === "block" ? "Block Vendor" : "Unblock Vendor"}
        message={
          actionTarget?.type === "approve"
            ? `Approve ${actionTarget?.vendor.name} to become an active vendor on the platform?`
            : actionTarget?.type === "reject"
            ? `Reject ${actionTarget?.vendor.name}'s vendor application?`
            : actionTarget?.type === "block"
            ? `Block ${actionTarget?.vendor.name} from accessing the platform?`
            : `Unblock ${actionTarget?.vendor.name} and restore their access?`
        }
        confirmText={actionTarget?.type === "reject" ? "Reject" : actionTarget?.type === "approve" ? "Approve" : actionTarget?.type === "block" ? "Block" : "Unblock"}
      />
    </div>
  );
};

export default Vendors;
