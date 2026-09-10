import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchProducts = createAsyncThunk(
  "admin/products",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/products", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load products"));
    }
  }
);

export const createProduct = createAsyncThunk(
  "admin/createProduct",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/products", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create product"));
    }
  }
);

export const updateProduct = createAsyncThunk(
  "admin/updateProduct",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/products/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update product"));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "admin/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete product"));
    }
  }
);

const initialState = {
  products: [],
  currentProduct: null,
  recommended: [],
  recommendedLoading: false,
  pagination: { total: 0, page: 1, pages: 1 },
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
};

export const fetchVendorProducts = createAsyncThunk(
  "product/vendorList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendor/products", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load products"));
    }
  }
);

export const fetchVendorProduct = createAsyncThunk(
  "product/vendorSingle",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/vendor/products/${id}`);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load product"));
    }
  }
);

export const createVendorProduct = createAsyncThunk(
  "product/vendorCreate",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/vendor/products", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create product"));
    }
  }
);

export const updateVendorProduct = createAsyncThunk(
  "product/vendorUpdate",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/vendor/products/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update product"));
    }
  }
);

export const deleteVendorProduct = createAsyncThunk(
  "product/vendorDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/vendor/products/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete product"));
    }
  }
);

export const fetchRecommendedProducts = createAsyncThunk(
  "product/recommended",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/products/recommended");
      return response.data.products;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load recommended products")
      );
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVendorProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchVendorProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createVendorProduct.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createVendorProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.products.unshift(action.payload.product);
      })
      .addCase(createVendorProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(updateVendorProduct.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateVendorProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.products.findIndex(
          (p) => p._id === action.payload.product._id
        );
        if (index !== -1) {
          state.products[index] = action.payload.product;
        }
      })
      .addCase(updateVendorProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(deleteVendorProduct.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteVendorProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.products = state.products.filter(
          (p) => p._id !== action.payload.id
        );
      })
      .addCase(deleteVendorProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.products.unshift(action.payload.product);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.products.findIndex(
          (p) => p._id === action.payload.product._id
        );
        if (index !== -1) {
          state.products[index] = action.payload.product;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.products = state.products.filter(
          (p) => p._id !== action.payload.id
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(fetchRecommendedProducts.pending, (state) => {
        state.recommendedLoading = true;
        state.error = null;
      })
      .addCase(fetchRecommendedProducts.fulfilled, (state, action) => {
        state.recommendedLoading = false;
        state.recommended = action.payload;
      })
      .addCase(fetchRecommendedProducts.rejected, (state, action) => {
        state.recommendedLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;
