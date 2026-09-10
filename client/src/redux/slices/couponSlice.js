import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchCoupons = createAsyncThunk(
  "admin/coupons",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/coupons", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load coupons"));
    }
  }
);

export const createCoupon = createAsyncThunk(
  "admin/createCoupon",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/coupons", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create coupon"));
    }
  }
);

export const updateCoupon = createAsyncThunk(
  "admin/updateCoupon",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/coupons/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update coupon"));
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  "admin/deleteCoupon",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/coupons/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete coupon"));
    }
  }
);

const initialState = {
  coupons: [],
  pagination: { total: 0, page: 1, pages: 1 },
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
};

export const fetchVendorCoupons = createAsyncThunk(
  "coupon/vendorList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendor/coupons", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load coupons"));
    }
  }
);

export const createVendorCoupon = createAsyncThunk(
  "coupon/vendorCreate",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/vendor/coupons", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create coupon"));
    }
  }
);

export const updateVendorCoupon = createAsyncThunk(
  "coupon/vendorUpdate",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/vendor/coupons/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update coupon"));
    }
  }
);

export const deleteVendorCoupon = createAsyncThunk(
  "coupon/vendorDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/vendor/coupons/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete coupon"));
    }
  }
);

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    clearCouponError: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.coupons;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVendorCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createVendorCoupon.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createVendorCoupon.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.coupons.unshift(action.payload.coupon);
      })
      .addCase(createVendorCoupon.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(updateVendorCoupon.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateVendorCoupon.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.coupons.findIndex(
          (c) => c._id === action.payload.coupon._id
        );
        if (index !== -1) {
          state.coupons[index] = action.payload.coupon;
        }
      })
      .addCase(updateVendorCoupon.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(deleteVendorCoupon.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteVendorCoupon.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.coupons = state.coupons.filter(
          (c) => c._id !== action.payload.id
        );
      })
      .addCase(deleteVendorCoupon.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.coupons;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCoupon.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.coupons.unshift(action.payload.coupon);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(updateCoupon.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.coupons.findIndex(
          (c) => c._id === action.payload.coupon._id
        );
        if (index !== -1) {
          state.coupons[index] = action.payload.coupon;
        }
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(deleteCoupon.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.coupons = state.coupons.filter(
          (c) => c._id !== action.payload.id
        );
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearCouponError } = couponSlice.actions;
export default couponSlice.reducer;
