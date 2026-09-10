import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import productReducer from "./slices/productSlice";
import adminReducer from "./slices/adminSlice";
import categoryReducer from "./slices/categorySlice";
import subcategoryReducer from "./slices/subcategorySlice";
import brandReducer from "./slices/brandSlice";
import orderReducer from "./slices/orderSlice";
import couponReducer from "./slices/couponSlice";
import vendorReducer from "./slices/vendorSlice";
import catalogReducer from "./slices/catalogSlice";
import wishlistReducer from "./slices/wishlistSlice";
import addressReducer from "./slices/addressSlice";
import reviewReducer from "./slices/reviewSlice";
import notificationReducer from "./slices/notificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    product: productReducer,
    admin: adminReducer,
    category: categoryReducer,
    subcategory: subcategoryReducer,
    brand: brandReducer,
    order: orderReducer,
    coupon: couponReducer,
    vendor: vendorReducer,
    catalog: catalogReducer,
    wishlist: wishlistReducer,
    addresses: addressReducer,
    review: reviewReducer,
    notification: notificationReducer,
  },
});

export default store;
