import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchOrders = createAsyncThunk(
  "admin/orders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/orders", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load orders"));
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "admin/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/orders/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update order status")
      );
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  "admin/updatePaymentStatus",
  async ({ id, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/orders/${id}/payment-status`, {
        paymentStatus,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update payment status")
      );
    }
  }
);

export const placeOrder = createAsyncThunk(
  "order/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/checkout", payload);
      return data.order;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to place order"));
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  pagination: { total: 0, page: 1, pages: 1 },
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
  placeOrderLoading: false,
  placeOrderError: null,
  myOrders: [],
  myOrdersPagination: { total: 0, page: 1, pages: 1 },
  myOrdersLoading: false,
  myOrder: null,
  myOrderLoading: false,
  cancelLoading: false,
  cancelError: null,
  tracking: null,
  trackingLoading: false,
  paymentOrder: null,
  paymentCreateLoading: false,
  paymentError: null,
  verifyLoading: false,
  verifyError: null,
};

export const fetchVendorOrders = createAsyncThunk(
  "order/vendorList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendor/orders", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load orders"));
    }
  }
);

export const fetchVendorOrder = createAsyncThunk(
  "order/vendorSingle",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/vendor/orders/${id}`);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load order"));
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  "order/myOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/orders", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load orders"));
    }
  }
);

export const fetchMyOrder = createAsyncThunk(
  "order/myOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load order"));
    }
  }
);

export const cancelMyOrder = createAsyncThunk(
  "order/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${id}/cancel`);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to cancel order"));
    }
  }
);

export const trackMyOrder = createAsyncThunk(
  "order/track",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${id}/track`);
      return response.data.tracking;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to track order"));
    }
  }
);

export const createPaymentOrder = createAsyncThunk(
  "payment/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/payment/create-order", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create payment"));
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "payment/verify",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/payment/verify", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to verify payment")
      );
    }
  }
);

export const updateVendorOrderStatus = createAsyncThunk(
  "order/vendorUpdateStatus",
  async ({ orderId, itemId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/vendor/orders/${orderId}/items/${itemId}/status`,
        { status }
      );
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update order status")
      );
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
      state.placeOrderError = null;
      state.placeOrderLoading = false;
    },
    resetMyOrders: (state) => {
      state.myOrders = [];
      state.myOrder = null;
      state.myOrdersPagination = { total: 0, page: 1, pages: 1 };
      state.tracking = null;
      state.cancelError = null;
    },
    resetPaymentState: (state) => {
      state.paymentOrder = null;
      state.paymentError = null;
      state.paymentCreateLoading = false;
      state.verifyLoading = false;
      state.verifyError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVendorOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVendorOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchVendorOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateVendorOrderStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateVendorOrderStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentOrder = action.payload;
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateVendorOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.orders.findIndex(
          (o) => o._id === action.payload.order._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      .addCase(updatePaymentStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.orders.findIndex(
          (o) => o._id === action.payload.order._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      .addCase(placeOrder.pending, (state) => {
        state.placeOrderLoading = true;
        state.placeOrderError = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placeOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placeOrderLoading = false;
        state.placeOrderError = action.payload;
      })

      .addCase(fetchMyOrders.pending, (state) => {
        state.myOrdersLoading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrdersLoading = false;
        state.myOrders = action.payload.orders;
        state.myOrdersPagination = action.payload.pagination;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.myOrdersLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchMyOrder.pending, (state) => {
        state.myOrderLoading = true;
        state.error = null;
      })
      .addCase(fetchMyOrder.fulfilled, (state, action) => {
        state.myOrderLoading = false;
        state.myOrder = action.payload;
      })
      .addCase(fetchMyOrder.rejected, (state, action) => {
        state.myOrderLoading = false;
        state.error = action.payload;
      })

      .addCase(cancelMyOrder.pending, (state) => {
        state.cancelLoading = true;
        state.cancelError = null;
      })
      .addCase(cancelMyOrder.fulfilled, (state, action) => {
        state.cancelLoading = false;
        state.myOrder = action.payload;
        const index = state.myOrders.findIndex(
          (o) => o._id === action.payload._id
        );
        if (index !== -1) {
          state.myOrders[index] = action.payload;
        }
      })
      .addCase(cancelMyOrder.rejected, (state, action) => {
        state.cancelLoading = false;
        state.cancelError = action.payload;
      })

      .addCase(trackMyOrder.pending, (state) => {
        state.trackingLoading = true;
        state.error = null;
      })
      .addCase(trackMyOrder.fulfilled, (state, action) => {
        state.trackingLoading = false;
        state.tracking = action.payload;
      })
      .addCase(trackMyOrder.rejected, (state, action) => {
        state.trackingLoading = false;
        state.error = action.payload;
      })

      .addCase(createPaymentOrder.pending, (state) => {
        state.paymentCreateLoading = true;
        state.paymentError = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.paymentCreateLoading = false;
        state.paymentOrder = action.payload;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.paymentCreateLoading = false;
        state.paymentError = action.payload;
      })

      .addCase(verifyPayment.pending, (state) => {
        state.verifyLoading = true;
        state.verifyError = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.verifyLoading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verifyLoading = false;
        state.verifyError = action.payload;
      });
  },
});

export const {
  clearOrderError,
  resetCurrentOrder,
  resetMyOrders,
  resetPaymentState,
} = orderSlice.actions;
export default orderSlice.reducer;
