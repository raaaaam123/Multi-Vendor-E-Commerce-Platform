import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchSubcategories = createAsyncThunk(
  "admin/subcategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/subcategories", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load subcategories")
      );
    }
  }
);

export const fetchVendorSubcategories = createAsyncThunk(
  "subcategory/vendorList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendor/subcategories", { params });
      return response.data.subcategories;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load subcategories")
      );
    }
  }
);

export const createSubcategory = createAsyncThunk(
  "admin/createSubcategory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/subcategories", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create subcategory")
      );
    }
  }
);

export const updateSubcategory = createAsyncThunk(
  "admin/updateSubcategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/subcategories/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update subcategory")
      );
    }
  }
);

export const deleteSubcategory = createAsyncThunk(
  "admin/deleteSubcategory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/subcategories/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete subcategory")
      );
    }
  }
);

const initialState = {
  subcategories: [],
  pagination: { total: 0, page: 1, pages: 1 },
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
};

const subcategorySlice = createSlice({
  name: "subcategory",
  initialState,
  reducers: {
    clearSubcategoryError: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload.subcategories;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVendorSubcategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendorSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload;
      })
      .addCase(fetchVendorSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSubcategory.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createSubcategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.subcategories.unshift(action.payload.subcategory);
      })
      .addCase(createSubcategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(updateSubcategory.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateSubcategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.subcategories.findIndex(
          (s) => s._id === action.payload.subcategory._id
        );
        if (index !== -1) {
          state.subcategories[index] = action.payload.subcategory;
        }
      })
      .addCase(updateSubcategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(deleteSubcategory.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.subcategories = state.subcategories.filter(
          (s) => s._id !== action.payload.id
        );
      })
      .addCase(deleteSubcategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearSubcategoryError } = subcategorySlice.actions;
export default subcategorySlice.reducer;
