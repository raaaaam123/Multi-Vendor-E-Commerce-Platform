import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const getApprovalStatus = (error) =>
  error.response?.data?.approvalStatus || null;

export const fetchVendorProfile = createAsyncThunk(
  "vendor/profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendor/profile");
      return response.data.user;
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error, "Failed to load profile"),
        approvalStatus: getApprovalStatus(error),
      });
    }
  }
);

export const updateVendorProfile = createAsyncThunk(
  "vendor/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put("/vendor/profile", data);
      return response.data.user;
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error, "Failed to update profile"),
        approvalStatus: getApprovalStatus(error),
      });
    }
  }
);

export const fetchVendorDashboard = createAsyncThunk(
  "vendor/dashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendor/dashboard");
      return response.data.stats;
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error, "Failed to load dashboard"),
        approvalStatus: getApprovalStatus(error),
      });
    }
  }
);

export const fetchVendorAnalytics = createAsyncThunk(
  "vendor/analytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendor/analytics");
      return response.data.analytics;
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error, "Failed to load analytics"),
        approvalStatus: getApprovalStatus(error),
      });
    }
  }
);

const initialState = {
  profile: null,
  dashboard: null,
  analytics: null,
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
  approvalStatus: null,
};

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    clearVendorError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    resetVendor: (state) => {
      state.profile = null;
      state.dashboard = null;
      state.analytics = null;
      state.approvalStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchVendorDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        if (action.payload.approvalStatus) {
          state.approvalStatus = action.payload.approvalStatus;
        }
      })
      .addCase(fetchVendorAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchVendorAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        if (action.payload.approvalStatus) {
          state.approvalStatus = action.payload.approvalStatus;
        }
      })
      .addCase(fetchVendorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.approvalStatus = action.payload.approvalStatus;
      })
      .addCase(fetchVendorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        if (action.payload.approvalStatus) {
          state.approvalStatus = action.payload.approvalStatus;
        }
      })
      .addCase(updateVendorProfile.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateVendorProfile.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.profile = action.payload;
        state.approvalStatus = action.payload.approvalStatus;
      })
      .addCase(updateVendorProfile.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload.message;
        if (action.payload.approvalStatus) {
          state.approvalStatus = action.payload.approvalStatus;
        }
      });
  },
});

export const { clearVendorError, resetVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
