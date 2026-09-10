import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVendorCoupons,
  createVendorCoupon,
  updateVendorCoupon,
  deleteVendorCoupon,
} from "../../redux/slices/couponSlice";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import Modal from "../../components/admin/Modal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { formatDate } from "../../utils/format";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minPurchase: "",
  maxDiscount: "",
  usageLimit: "",
  startDate: "",
  endDate: "",
};

const VendorCoupons = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error, pagination, actionLoading, actionError } =
    useSelector((state) => state.coupon);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchVendorCoupons({ search, page, limit: 10 }));
  }, [dispatch, search, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue?.toString() || "",
      minPurchase: coupon.minPurchase?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      startDate: coupon.startDate
        ? new Date(coupon.startDate).toISOString().slice(0, 10)
        : "",
      endDate: coupon.endDate
        ? new Date(coupon.endDate).toISOString().slice(0, 10)
        : "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.code ||
      !form.discountType ||
      !form.discountValue ||
      !form.startDate ||
      !form.endDate
    ) {
      setFormError("Code, discount type, value, start date, and end date are required");
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setFormError("End date must be after start date");
      return;
    }
    const payload = {
      code: form.code.toUpperCase(),
      description: form.description,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minPurchase: form.minPurchase ? Number(form.minPurchase) : 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
    };
    try {
      if (editing) {
        await dispatch(updateVendorCoupon({ id: editing._id, data: payload })).unwrap();
      } else {
        await dispatch(createVendorCoupon(payload)).unwrap();
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err || "Failed to save coupon");
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await dispatch(deleteVendorCoupon(deleteTarget._id)).unwrap();
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (code) => (
        <span className="font-mono font-semibold text-purple-700">{code}</span>
      ),
    },
    {
      key: "discountType",
      header: "Type",
      render: (type) => (
        <span className="capitalize text-gray-700">{type}</span>
      ),
    },
    {
      key: "discountValue",
      header: "Value",
      render: (value, coupon) =>
        coupon.discountType === "percentage" ? `${value}%` : `₹${value}`,
    },
    {
      key: "minPurchase",
      header: "Min Purchase",
      render: (value) => (value ? `₹${value}` : "-"),
    },
    {
      key: "usedCount",
      header: "Used / Limit",
      render: (used, coupon) => (
        <span className="text-gray-700">
          {used} / {coupon.usageLimit || "∞"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: "endDate",
      header: "Expires",
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
          <p className="text-gray-600 mt-1">
            Create discount coupons for your store.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Add Coupon
        </button>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {actionError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={coupons || []}
        loading={loading}
        error={error}
        emptyMessage="No coupons found. Create your first coupon to boost sales."
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search coupons..."
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={setPage}
        actions={(coupon) => (
          <>
            <button
              onClick={() => openEdit(coupon)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setDeleteTarget(coupon)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Coupon" : "Add New Coupon"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code *
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                placeholder="SUMMER20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm({ ...form, discountType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) =>
                  setForm({ ...form, discountValue: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Purchase
              </label>
              <input
                type="number"
                value={form.minPurchase}
                onChange={(e) =>
                  setForm({ ...form, minPurchase: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount
              </label>
              <input
                type="number"
                value={form.maxDiscount}
                onChange={(e) =>
                  setForm({ ...form, maxDiscount: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) =>
                  setForm({ ...form, usageLimit: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                placeholder="0 = unlimited"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={actionLoading}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon "${deleteTarget?.code}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default VendorCoupons;