import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  updateUserStatus,
  deleteUser,
} from "../../redux/slices/adminSlice";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { formatDate } from "../../utils/format";

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, error, pagination, actionLoading } = useSelector(
    (state) => state.admin
  );
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  useEffect(() => {
    dispatch(
      fetchUsers({
        search,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      })
    );
  }, [dispatch, search, roleFilter, statusFilter, page]);

  const handleStatusChange = (user) => {
    const newStatus =
      user.status === "active" ? "suspended" : "active";
    setStatusTarget({ user, newStatus });
  };

  const confirmStatusChange = () => {
    if (statusTarget) {
      dispatch(
        updateUserStatus({
          id: statusTarget.user._id,
          status: statusTarget.newStatus,
        })
      );
      setStatusTarget(null);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      dispatch(deleteUser(deleteTarget._id));
      setDeleteTarget(null);
    }
  };

  const roleFilterSelect = (
    <select
      value={roleFilter}
      onChange={(e) => {
        setRoleFilter(e.target.value);
        setPage(1);
      }}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">All Roles</option>
      <option value="customer">Customer</option>
      <option value="vendor">Vendor</option>
      <option value="admin">Admin</option>
    </select>
  );

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
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="suspended">Suspended</option>
    </select>
  );

  const columns = [
    {
      key: "name",
      header: "User",
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (role) => (
        <span className="capitalize text-gray-700">{role}</span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (phone) => phone || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: "createdAt",
      header: "Registered",
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        error={error}
        emptyMessage="No users found"
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by name or email..."
        filters={
          <>
            {roleFilterSelect}
            {statusFilterSelect}
          </>
        }
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={setPage}
        actions={(user) => (
          <>
            <button
              onClick={() => handleStatusChange(user)}
              disabled={actionLoading || user.role === "admin"}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                user.status === "active"
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-green-50 text-green-600 hover:bg-green-100"
              }`}
            >
              {user.status === "active" ? "Block" : "Unblock"}
            </button>
            <button
              onClick={() => setDeleteTarget(user)}
              disabled={actionLoading || user.role === "admin"}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      />

      <ConfirmDialog
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={confirmStatusChange}
        loading={actionLoading}
        title={
          statusTarget?.newStatus === "suspended"
            ? "Block User"
            : "Unblock User"
        }
        message={
          statusTarget?.newStatus === "suspended"
            ? `Are you sure you want to block ${statusTarget?.user.name}? They will not be able to access the platform.`
            : `Are you sure you want to unblock ${statusTarget?.user.name}? They will regain access to the platform.`
        }
        confirmText={
          statusTarget?.newStatus === "suspended" ? "Block" : "Unblock"
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={actionLoading}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Users;
