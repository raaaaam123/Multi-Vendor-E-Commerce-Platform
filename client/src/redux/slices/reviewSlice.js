import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export const fetchProductReviews = createAsyncThunk(
  "review/list",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load reviews")
      );
    }
  }
);

export const fetchMyReview = createAsyncThunk(
  "review/myReview",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/product/${productId}/me`);
      return response.data.review;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load your review")
      );
    }
  }
);

export const fetchReviewEligibility = createAsyncThunk(
  "review/eligibility",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/product/${productId}/eligibility`);
      return response.data.eligibility;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to check review eligibility")
      );
    }
  }
);

export const createReview = createAsyncThunk(
  "review/create",
  async ({ productId, payload }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/product/${productId}`, payload);
      return response.data.review;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to submit review")
      );
    }
  }
);

export const updateReview = createAsyncThunk(
  "review/update",
  async ({ reviewId, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, payload);
      return response.data.review;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update review")
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  "review/delete",
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete review")
      );
    }
  }
);

const initialState = {
  reviews: [],
  pagination: { total: 0, page: 1, pages: 1 },
  myReview: null,
  myReviewLoading: true,
  myReviewError: null,
  eligibility: null,
  eligibilityLoading: false,
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    resetMyReview: (state) => {
      state.myReview = null;
      state.myReviewLoading = true;
      state.myReviewError = null;
      state.eligibility = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMyReview.pending, (state) => {
        state.myReviewLoading = true;
        state.myReviewError = null;
      })
      .addCase(fetchMyReview.fulfilled, (state, action) => {
        state.myReviewLoading = false;
        state.myReview = action.payload || null;
      })
      .addCase(fetchMyReview.rejected, (state, action) => {
        state.myReviewLoading = false;
        state.myReviewError = action.payload;
      })

      .addCase(fetchReviewEligibility.pending, (state) => {
        state.eligibilityLoading = true;
        state.error = null;
      })
      .addCase(fetchReviewEligibility.fulfilled, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibility = action.payload;
      })
      .addCase(fetchReviewEligibility.rejected, (state, action) => {
        state.eligibilityLoading = false;
        state.error = action.payload;
      })

      .addCase(createReview.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myReview = action.payload;
        state.eligibility = {
          ...(state.eligibility || {}),
          alreadyReviewed: true,
          canReview: false,
        };
        state.reviews.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      .addCase(updateReview.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myReview = action.payload;
        const index = state.reviews.findIndex(
          (r) => r._id === action.payload._id
        );
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      .addCase(deleteReview.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myReview = null;
        state.eligibility = {
          ...(state.eligibility || {}),
          alreadyReviewed: false,
          canReview: true,
        };
        state.reviews = state.reviews.filter(
          (r) => r._id !== action.meta.arg
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearReviewError, resetMyReview } = reviewSlice.actions;
export default reviewSlice.reducer;