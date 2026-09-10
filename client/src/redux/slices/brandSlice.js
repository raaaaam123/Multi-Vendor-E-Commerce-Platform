import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchBrands = createAsyncThunk(
  "admin/brands",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/brands", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load brands"));
    }
  }
);

export const fetchAllBrands = createAsyncThunk(
  "admin/allBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/brands/all");
      return response.data.brands;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load brands"));
    }
  }
);

export const fetchVendorBrands = createAsyncThunk(
  "brand/vendorList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendor/brands");
      return response.data.brands;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load brands"));
    }
  }
);

export const createBrand = createAsyncThunk(
  "admin/createBrand",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/brands", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create brand"));
    }
  }
);

export const updateBrand = createAsyncThunk(
  "admin/updateBrand",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/brands/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update brand"));
    }
  }
);

export const deleteBrand = createAsyncThunk(
  "admin/deleteBrand",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/brands/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete brand"));
    }
  }
);

const initialState = {
  brands: [],
  allBrands: [],
  pagination: { total: 0, page: 1, pages: 1 },
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
};

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    clearBrandError: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload.brands;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllBrands.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.allBrands = action.payload;
      })
      .addCase(fetchAllBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVendorBrands.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendorBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.allBrands = action.payload;
      })
      .addCase(fetchVendorBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBrand.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.brands.unshift(action.payload.brand);
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(updateBrand.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.brands.findIndex(
          (b) => b._id === action.payload.brand._id
        );
        if (index !== -1) {
          state.brands[index] = action.payload.brand;
        }
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(deleteBrand.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.brands = state.brands.filter((b) => b._id !== action.payload.id);
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearBrandError } = brandSlice.actions;
export default brandSlice.reducer;
