import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchPublicProducts = createAsyncThunk(
  "catalog/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, value);
        }
      });
      const { data } = await api.get(`/products?${query.toString()}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchPublicProduct = createAsyncThunk(
  "catalog/fetchProduct",
  async (idOrSlug, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${idOrSlug}`);
      return data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

export const fetchCatalogCategories = createAsyncThunk(
  "catalog/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/categories");
      return data.categories;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const fetchCatalogSubcategories = createAsyncThunk(
  "catalog/fetchSubcategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.category) query.append("category", params.category);
      const { data } = await api.get(`/subcategories?${query.toString()}`);
      return data.subcategories;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subcategories"
      );
    }
  }
);

export const fetchCatalogBrands = createAsyncThunk(
  "catalog/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/brands");
      return data.brands;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brands"
      );
    }
  }
);

const catalogSlice = createSlice({
  name: "catalog",
  initialState: {
    products: [],
    product: null,
    categories: [],
    subcategories: [],
    brands: [],
    pagination: { page: 1, limit: 12, totalProducts: 0, totalPages: 0 },
    loading: false,
    productLoading: false,
    error: null,
    productError: null,
  },
  reducers: {
    clearCatalogProduct: (state) => {
      state.product = null;
      state.productError = null;
    },
    clearCatalogError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          totalProducts: action.payload.totalProducts,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchPublicProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchPublicProduct.pending, (state) => {
        state.productLoading = true;
        state.productError = null;
      })
      .addCase(fetchPublicProduct.fulfilled, (state, action) => {
        state.productLoading = false;
        state.product = action.payload;
      })
      .addCase(fetchPublicProduct.rejected, (state, action) => {
        state.productLoading = false;
        state.productError = action.payload;
      })

      .addCase(fetchCatalogCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchCatalogSubcategories.fulfilled, (state, action) => {
        state.subcategories = action.payload;
      })
      .addCase(fetchCatalogBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      });
  },
});

export const { clearCatalogProduct, clearCatalogError } =
  catalogSlice.actions;
export default catalogSlice.reducer;
