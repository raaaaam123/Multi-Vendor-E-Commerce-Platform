import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchDashboardStats = createAsyncThunk(
  "admin/dashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/dashboard");
      return response.data.stats;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load dashboard statistics")
      );
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "admin/users",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/users", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load users"));
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "admin/updateUserStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/users/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update user status")
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete user"));
    }
  }
);

export const fetchVendors = createAsyncThunk(
  "admin/vendors",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/vendors", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load vendors"));
    }
  }
);

export const approveVendor = createAsyncThunk(
  "admin/approveVendor",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/vendors/${id}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to approve vendor")
      );
    }
  }
);

export const rejectVendor = createAsyncThunk(
  "admin/rejectVendor",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/vendors/${id}/reject`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to reject vendor"));
    }
  }
);

export const blockVendor = createAsyncThunk(
  "admin/blockVendor",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/vendors/${id}/block`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to block vendor"));
    }
  }
);

export const unblockVendor = createAsyncThunk(
  "admin/unblockVendor",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/vendors/${id}/unblock`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to unblock vendor")
      );
    }
  }
);

export const fetchSalesReport = createAsyncThunk(
  "admin/reports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/reports", { params });
      return response.data.report;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load sales report")
      );
    }
  }
);

export const fetchPayments = createAsyncThunk(
  "admin/payments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/payments", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load payments")
      );
    }
  }
);

const initialState = {
  stats: null,
  users: [],
  vendors: [],
  payments: [],
  report: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload.vendors;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload.user._id
        );
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
        state.actionError = null;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.users = state.users.filter((u) => u._id !== action.payload.id);
        state.actionError = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(approveVendor.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(approveVendor.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.vendors.findIndex(
          (v) => v._id === action.payload.vendor._id
        );
        if (index !== -1) {
          state.vendors[index] = action.payload.vendor;
        }
      })
      .addCase(approveVendor.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(rejectVendor.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(rejectVendor.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.vendors.findIndex(
          (v) => v._id === action.payload.vendor._id
        );
        if (index !== -1) {
          state.vendors[index] = action.payload.vendor;
        }
      })
      .addCase(rejectVendor.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(blockVendor.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(blockVendor.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.vendors.findIndex(
          (v) => v._id === action.payload.vendor._id
        );
        if (index !== -1) {
          state.vendors[index] = action.payload.vendor;
        }
      })
      .addCase(blockVendor.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(unblockVendor.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(unblockVendor.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.vendors.findIndex(
          (v) => v._id === action.payload.vendor._id
        );
        if (index !== -1) {
          state.vendors[index] = action.payload.vendor;
        }
      })
      .addCase(unblockVendor.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearAdminError, clearStats } = adminSlice.actions;
export default adminSlice.reducer;
