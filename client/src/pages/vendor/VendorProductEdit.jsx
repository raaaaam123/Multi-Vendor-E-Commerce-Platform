import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProductForm from "../../components/vendor/ProductForm";
import {
  fetchVendorProduct,
  updateVendorProduct,
  clearProductError,
} from "../../redux/slices/productSlice";
import { fetchVendorCategories } from "../../redux/slices/categorySlice";
import { fetchVendorSubcategories } from "../../redux/slices/subcategorySlice";
import { fetchVendorBrands } from "../../redux/slices/brandSlice";

const VendorProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentProduct, loading, actionLoading: submitting, actionError } =
    useSelector((state) => state.product);
  const { allCategories: categories, loading: loadingCategories } = useSelector(
    (state) => state.category
  );
  const { subcategories } = useSelector((state) => state.subcategory);

  useEffect(() => {
    dispatch(fetchVendorProduct(id));
    dispatch(fetchVendorCategories());
    dispatch(fetchVendorBrands());
  }, [dispatch, id]);

  useEffect(() => {
    if (currentProduct?.category?._id) {
      dispatch(
        fetchVendorSubcategories({ category: currentProduct.category._id })
      );
    }
  }, [dispatch, currentProduct?.category?._id]);

  useEffect(() => {
    return () => dispatch(clearProductError());
  }, [dispatch]);

  if (loading && !currentProduct) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

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

    (formData.images || []).forEach((img) => {
      fd.append("images", img);
    });
    formData.imageFiles.forEach((file) => {
      fd.append("images", file);
    });

    const result = await dispatch(
      updateVendorProduct({ id, data: fd })
    );
    if (!result.error) {
      navigate("/vendor/products");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
        <p className="text-gray-600 mt-1">Update your product details below.</p>
      </div>

      <ProductForm
        initialValues={currentProduct}
        categories={categories || []}
        subcategories={subcategories || []}
        loadingCategories={loadingCategories}
        submitLabel="Save Changes"
        submitting={submitting}
        error={actionError}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default VendorProductEdit;