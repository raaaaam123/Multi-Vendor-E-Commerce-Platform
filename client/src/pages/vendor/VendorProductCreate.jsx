import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProductForm from "../../components/vendor/ProductForm";
import {
  createVendorProduct,
  clearProductError,
} from "../../redux/slices/productSlice";
import { fetchVendorCategories } from "../../redux/slices/categorySlice";
import { fetchVendorBrands } from "../../redux/slices/brandSlice";

const VendorProductCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { actionLoading: submitting, actionError } = useSelector(
    (state) => state.product
  );
  const { allCategories: categories, loading: loadingCategories } = useSelector(
    (state) => state.category
  );
  const { subcategories } = useSelector((state) => state.subcategory);

  useEffect(() => {
    dispatch(fetchVendorCategories());
    dispatch(fetchVendorBrands());
  }, [dispatch]);

  useEffect(() => {
    return () => dispatch(clearProductError());
  }, [dispatch]);

  const handleSubmit = async (formData) => {
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description || "");
    fd.append("price", formData.price);
    fd.append("stock", formData.stock);
    fd.append("discount", formData.discount || "0");
    fd.append("sku", formData.sku || "");
    fd.append("category", formData.category);
    if (formData.subcategory) fd.append("subcategory", formData.subcategory);
    if (formData.brand) fd.append("brand", formData.brand);

    formData.imageFiles.forEach((file) => {
      fd.append("images", file);
    });

    const result = await dispatch(createVendorProduct(fd));
    if (!result.error) {
      navigate("/vendor/products");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
        <p className="text-gray-600 mt-1">
          Fill in the details below to add a product to your store.
        </p>
      </div>

      <ProductForm
        categories={categories || []}
        subcategories={subcategories || []}
        loadingCategories={loadingCategories}
        submitLabel="Create Product"
        submitting={submitting}
        error={actionError}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default VendorProductCreate;