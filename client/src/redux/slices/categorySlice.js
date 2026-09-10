import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchCategories = createAsyncThunk(
  "admin/categories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/categories", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load categories")
      );
    }
  }
);

export const fetchAllCategories = createAsyncThunk(
  "admin/allCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/categories/all");
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load categories")
      );
    }
  }
);

export const fetchVendorCategories = createAsyncThunk(
  "category/vendorList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendor/categories");
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load categories")
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "admin/createCategory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/categories", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create category")
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "admin/updateCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/categories/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update category")
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "admin/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/categories/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete category")
      );
    }
  }
);

const initialState = {
  categories: [],
  allCategories: [],
  pagination: { total: 0, page: 1, pages: 1 },
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.allCategories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVendorCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendorCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.allCategories = action.payload;
      })
      .addCase(fetchVendorCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.categories.unshift(action.payload.category);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.categories.findIndex(
          (c) => c._id === action.payload.category._id
        );
        if (index !== -1) {
          state.categories[index] = action.payload.category;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.categories = state.categories.filter(
          (c) => c._id !== action.payload.id
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
