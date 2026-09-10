import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchAddresses = createAsyncThunk(
  "addresses/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/addresses");
      return data.addresses;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load addresses"));
    }
  }
);

export const createAddress = createAsyncThunk(
  "addresses/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/addresses", payload);
      return data.address;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create address"));
    }
  }
);

export const updateAddress = createAsyncThunk(
  "addresses/update",
  async ({ id, data: payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/addresses/${id}`, payload);
      return data.address;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update address"));
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "addresses/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/addresses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete address"));
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "addresses/setDefault",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/addresses/${id}/default`);
      return data.address;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to set default address")
      );
    }
  }
);

const initialState = {
  addresses: [],
  loading: false,
  saving: false,
  error: null,
  actionError: null,
};

const addressSlice = createSlice({
  name: "addresses",
  initialState,
  reducers: {
    clearAddressError: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createAddress.pending, (state) => {
        state.saving = true;
        state.actionError = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.saving = false;
        const exists = state.addresses.some(
          (a) => a._id === action.payload._id
        );
        if (!exists) {
          state.addresses = [action.payload, ...state.addresses];
        }
        if (action.payload.isDefault) {
          state.addresses = state.addresses.map((a) => ({
            ...a,
            isDefault: a._id === action.payload._id,
          }));
        }
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.saving = false;
        state.actionError = action.payload;
      })

      .addCase(updateAddress.pending, (state) => {
        state.saving = true;
        state.actionError = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.saving = false;
        state.addresses = state.addresses
          .map((a) =>
            a._id === action.payload._id ? action.payload : a
          )
          .map((a) =>
            action.payload.isDefault ? { ...a, isDefault: a._id === action.payload._id } : a
          );
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.saving = false;
        state.actionError = action.payload;
      })

      .addCase(deleteAddress.pending, (state) => {
        state.saving = true;
        state.actionError = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.saving = false;
        state.addresses = state.addresses.filter(
          (a) => a._id !== action.payload
        );
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.saving = false;
        state.actionError = action.payload;
      })

      .addCase(setDefaultAddress.pending, (state) => {
        state.saving = true;
        state.actionError = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.saving = false;
        state.addresses = state.addresses.map((a) => ({
          ...a,
          isDefault: a._id === action.payload._id,
        }));
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.saving = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;