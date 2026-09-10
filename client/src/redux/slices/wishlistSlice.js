import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/wishlist");
      return data.products;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load wishlist"));
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/wishlist", { productId });
      return data.products;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to add item to wishlist")
      );
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      return data.products;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to remove item from wishlist")
      );
    }
  }
);

const initialState = {
  products: [],
  loading: false,
  updating: false,
  error: null,
  actionError: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlist: (state) => {
      state.products = [];
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addToWishlist.pending, (state) => {
        state.updating = true;
        state.actionError = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.updating = false;
        state.products = action.payload;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.updating = false;
        state.actionError = action.payload;
      })

      .addCase(removeFromWishlist.pending, (state) => {
        state.updating = true;
        state.actionError = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.updating = false;
        state.products = action.payload;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.updating = false;
        state.actionError = action.payload;
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;