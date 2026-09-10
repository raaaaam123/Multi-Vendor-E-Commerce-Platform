import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/cart");
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load cart"));
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ productId, quantity = 1, set = false }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/cart", { productId, quantity, set });
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to add item to cart"));
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/update",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update cart"));
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to remove item from cart"));
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.delete("/cart");
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to clear cart"));
    }
  }
);

export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (code, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/cart/coupon", { code });
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to apply coupon"));
    }
  }
);

export const removeCoupon = createAsyncThunk(
  "cart/removeCoupon",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.delete("/cart/coupon");
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to remove coupon"));
    }
  }
);

const emptyTotals = {
  mrpTotal: 0,
  productDiscount: 0,
  couponDiscount: 0,
  discount: 0,
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  totalQuantity: 0,
};

const initialState = {
  items: [],
  coupon: null,
  totals: emptyTotals,
  loading: false,
  updating: false,
  error: null,
  actionError: null,
  stateError: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.totals = emptyTotals;
      state.error = null;
      state.actionError = null;
      state.stateError = null;
    },
    clearCartError: (state) => {
      state.error = null;
      state.actionError = null;
      state.stateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.coupon = action.payload.coupon;
        state.totals = action.payload.totals;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addToCart.pending, (state) => {
        state.updating = true;
        state.actionError = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.updating = false;
        state.items = action.payload.items;
        state.coupon = action.payload.coupon;
        state.totals = action.payload.totals;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.updating = false;
        state.actionError = action.payload;
      })

      .addCase(updateCartQuantity.pending, (state) => {
        state.updating = true;
        state.actionError = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.updating = false;
        state.items = action.payload.items;
        state.coupon = action.payload.coupon;
        state.totals = action.payload.totals;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.updating = false;
        state.actionError = action.payload;
      })

      .addCase(removeFromCart.pending, (state) => {
        state.updating = true;
        state.actionError = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.updating = false;
        state.items = action.payload.items;
        state.coupon = action.payload.coupon;
        state.totals = action.payload.totals;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.updating = false;
        state.actionError = action.payload;
      })

      .addCase(clearCart.pending, (state) => {
        state.updating = true;
        state.actionError = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.updating = false;
        state.items = action.payload.items;
        state.coupon = action.payload.coupon;
        state.totals = action.payload.totals;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.updating = false;
        state.actionError = action.payload;
      })

      .addCase(applyCoupon.pending, (state) => {
        state.updating = true;
        state.actionError = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.updating = false;
        state.items = action.payload.items;
        state.coupon = action.payload.coupon;
        state.totals = action.payload.totals;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.updating = false;
        state.actionError = action.payload;
      })

      .addCase(removeCoupon.pending, (state) => {
        state.updating = true;
        state.actionError = null;
      })
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.updating = false;
        state.items = action.payload.items;
        state.coupon = action.payload.coupon;
        state.totals = action.payload.totals;
      })
      .addCase(removeCoupon.rejected, (state, action) => {
        state.updating = false;
        state.actionError = action.payload;
      });
  },
});

export const { resetCart, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;