import { useEffect, useState } from "react";

const ProductForm = ({
  initialValues,
  categories,
  subcategories,
  submitLabel,
  submitting,
  error,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    discount: "0",
    sku: "",
    category: "",
    subcategory: "",
    brand: "",
    images: [],
    imageFiles: [],
  });

  const [previewUris, setPreviewUris] = useState([]);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || "",
        description: initialValues.description || "",
        price: initialValues.price ?? "",
        stock: initialValues.stock ?? "",
        discount: initialValues.discount ?? "0",
        sku: initialValues.sku || "",
        category: initialValues.category?._id || initialValues.category || "",
        subcategory:
          initialValues.subcategory?._id || initialValues.subcategory || "",
        brand: initialValues.brand?._id || initialValues.brand || "",
        images: initialValues.images || [],
        imageFiles: [],
      });
      setPreviewUris(initialValues.images || []);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? value : value,
    }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...formData.imageFiles, ...files].slice(0, 8);
    const uris = newFiles.map((f) => URL.createObjectURL(f));
    setFormData((prev) => ({ ...prev, imageFiles: newFiles }));
    setPreviewUris(uris);
  };

  const removePreview = (index) => {
    const nextFiles = formData.imageFiles.filter((_, i) => i !== index);
    const nextPreview = previewUris.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, imageFiles: nextFiles }));
    setPreviewUris(nextPreview);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className={labelClass}>Product Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. Wireless Headphones"
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className={inputClass}
            placeholder="Describe your product..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price (₹) *</label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className={labelClass}>Stock *</label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Discount (%)</label>
            <input
              type="number"
              name="discount"
              min="0"
              max="100"
              value={formData.discount}
              onChange={handleChange}
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. HP-001"
            />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. Sony"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category *</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select category</option>
              {(categories || []).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Subcategory</label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select subcategory</option>
              {(subcategories || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <label className={labelClass}>Product Images (up to 8)</label>
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-4"
        />
        {previewUris.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {previewUris.map((uri, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={uri}
                  alt={`Product ${index + 1}`}
                  className="w-full h-24 object-cover bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
