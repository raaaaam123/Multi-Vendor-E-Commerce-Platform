import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../redux/slices/productSlice";
import { fetchVendors } from "../../redux/slices/adminSlice";
import { fetchAllCategories } from "../../redux/slices/categorySlice";
import { fetchAllBrands } from "../../redux/slices/brandSlice";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import Modal from "../../components/admin/Modal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { formatCurrency, formatDate } from "../../utils/format";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  category: "",
  subcategory: "",
  brand: "",
  vendor: "",
  stock: "",
  status: "draft",
  isApproved: false,
  images: [],
};

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, error, pagination, actionLoading, actionError } =
    useSelector((state) => state.product);
  const { allCategories } = useSelector((state) => state.category);
  const { allBrands } = useSelector((state) => state.brand);
  const { vendors } = useSelector((state) => state.admin);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(
      fetchProducts({
        search,
        status: statusFilter || undefined,
        page,
        limit: 10,
      })
    );
  }, [dispatch, search, statusFilter, page]);

  useEffect(() => {
    if (!allCategories.length) {
      dispatch(fetchAllCategories());
    }
    if (!allBrands.length) {
      dispatch(fetchAllBrands());
    }
    if (!vendors.length) {
      dispatch(fetchVendors({ status: "active", page: 1, limit: 100 }));
    }
  }, [dispatch, allCategories.length, allBrands.length, vendors.length]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price?.toString() || "",
      comparePrice: product.comparePrice?.toString() || "",
      category: product.category?._id || product.category || "",
      subcategory: product.subcategory?._id || product.subcategory || "",
      brand: product.brand?._id || product.brand || "",
      vendor: product.vendor?._id || product.vendor || "",
      stock: product.stock?.toString() || "",
      status: product.status,
      isApproved: product.isApproved,
      images: product.images?.join(", ") || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category) {
      setFormError("Name, price, and category are required");
      return;
    }
    if (!form.vendor) {
      setFormError("Vendor is required");
      return;
    }
    if (Number(form.price) < 0) {
      setFormError("Price cannot be negative");
      return;
    }
    const payload = {
      ...form,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : 0,
      stock: form.stock ? Number(form.stock) : 0,
      subcategory: form.subcategory || undefined,
      brand: form.brand || undefined,
      images: form.images
        ? form.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    try {
      if (editing) {
        await dispatch(
          updateProduct({ id: editing._id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createProduct(payload)).unwrap();
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err || "Failed to save product");
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await dispatch(deleteProduct(deleteTarget._id)).unwrap();
      setDeleteTarget(null);
    }
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
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="draft">Draft</option>
    </select>
  );

  const columns = [
    {
      key: "name",
      header: "Product",
      render: (name, product) => (
        <div className="flex items-center gap-3">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={name}
              className="w-10 h-10 rounded-lg object-cover bg-gray-100"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-semibold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 max-w-[200px] truncate">
              {name}
            </p>
            <p className="text-xs text-gray-500">{product.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (price) => formatCurrency(price),
    },
    {
      key: "category",
      header: "Category",
      render: (category) => category?.name || "-",
    },
    {
      key: "stock",
      header: "Stock",
      render: (stock) => (
        <span className={Number(stock) <= 5 ? "text-red-600 font-medium" : "text-gray-700"}>
          {stock ?? 0}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: "isApproved",
      header: "Approved",
      render: (approved) => (
        <span className={approved ? "text-green-600 text-sm" : "text-gray-400 text-sm"}>
          {approved ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {actionError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        error={error}
        emptyMessage="No products found"
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search products..."
        filters={statusFilterSelect}
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={setPage}
        actions={(product) => (
          <>
            <button
              onClick={() => openEdit(product)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setDeleteTarget(product)}
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
        title={editing ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Product name"
            />
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare Price
              </label>
              <input
                type="number"
                value={form.comparePrice}
                onChange={(e) =>
                  setForm({ ...form, comparePrice: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor *
              </label>
              <select
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select category</option>
                {allCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <select
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select brand</option>
                {allBrands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images (comma-separated URLs)
            </label>
            <input
              type="text"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://img1.jpg, https://img2.jpg"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isApproved}
              onChange={(e) =>
                setForm({ ...form, isApproved: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Approved</span>
          </label>

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
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
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
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Products;
