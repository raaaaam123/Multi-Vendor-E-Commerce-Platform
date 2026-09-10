import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVendorProducts,
  deleteVendorProduct,
} from "../../redux/slices/productSlice";
import ProductTable from "../../components/vendor/ProductTable";
import Modal from "../../components/admin/Modal";

const VendorProducts = () => {
  const dispatch = useDispatch();
  const { products, loading, error, actionLoading, actionError } = useSelector(
    (state) => state.product
  );

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    dispatch(fetchVendorProducts({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (actionError) {
      setToast(actionError);
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [actionError]);

  const handleDelete = (product) => {
    setDeleteTarget(product);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteVendorProduct(deleteTarget._id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-600 mt-1">Manage your store's products.</p>
        </div>
        <Link
          to="/vendor/products/create"
          className="inline-flex items-center justify-center bg-purple-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
        >
          + Add Product
        </Link>
      </div>

      {toast && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {toast}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <ProductTable
        products={products || []}
        loading={loading}
        error={error}
        onDelete={handleDelete}
        deletingId={actionLoading ? deleteTarget?._id : null}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">
            {deleteTarget?.name}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={actionLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default VendorProducts;
