import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../../redux/slices/subcategorySlice";
import { fetchAllCategories } from "../../redux/slices/categorySlice";
import { fetchAllBrands } from "../../redux/slices/brandSlice";
import DataTable from "../../components/admin/DataTable";
import StatusBadge from "../../components/admin/StatusBadge";
import Modal from "../../components/admin/Modal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { formatDate } from "../../utils/format";

const emptyForm = {
  name: "",
  category: "",
  description: "",
  image: "",
  status: "active",
};

const Subcategories = () => {
  const dispatch = useDispatch();
  const { subcategories, loading, error, pagination, actionLoading, actionError } =
    useSelector((state) => state.subcategory);
  const { allCategories } = useSelector((state) => state.category);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(
      fetchSubcategories({
        search,
        category: categoryFilter || undefined,
        page,
        limit: 10,
      })
    );
  }, [dispatch, search, categoryFilter, page]);

  useEffect(() => {
    if (!allCategories.length) {
      dispatch(fetchAllCategories());
    }
  }, [dispatch, allCategories.length]);

  useEffect(() => {
    dispatch(fetchAllBrands());
  }, [dispatch]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      category: categoryFilter || allCategories[0]?._id || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (subcategory) => {
    setEditing(subcategory);
    setForm({
      name: subcategory.name,
      category: subcategory.category?._id || "",
      description: subcategory.description || "",
      image: subcategory.image || "",
      status: subcategory.status,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Subcategory name is required");
      return;
    }
    if (!form.category) {
      setFormError("Please select a parent category");
      return;
    }
    try {
      if (editing) {
        await dispatch(
          updateSubcategory({ id: editing._id, data: form })
        ).unwrap();
      } else {
        await dispatch(createSubcategory(form)).unwrap();
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err || "Failed to save subcategory");
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await dispatch(deleteSubcategory(deleteTarget._id)).unwrap();
      setDeleteTarget(null);
    }
  };

  const categoryFilterSelect = (
    <select
      value={categoryFilter}
      onChange={(e) => {
        setCategoryFilter(e.target.value);
        setPage(1);
      }}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">All Categories</option>
      {allCategories.map((cat) => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
    </select>
  );

  const columns = [
    {
      key: "name",
      header: "Subcategory",
      render: (name, sub) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-semibold text-sm">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">{sub.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Parent Category",
      render: (category) => (
        <span className="text-gray-700">
          {category?.name || "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (status) => <StatusBadge status={status} />,
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
          Add Subcategory
        </button>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {actionError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={subcategories}
        loading={loading}
        error={error}
        emptyMessage="No subcategories found"
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search subcategories..."
        filters={categoryFilterSelect}
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={setPage}
        actions={(sub) => (
          <>
            <button
              onClick={() => openEdit(sub)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setDeleteTarget(sub)}
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
        title={editing ? "Edit Subcategory" : "Add New Subcategory"}
        size="md"
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
              placeholder="e.g. Smartphones"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
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
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
        title="Delete Subcategory"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Subcategories;
