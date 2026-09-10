import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/admin/AdminLayout";
import VendorLayout from "../components/vendor/VendorLayout";
import CustomerRoute from "../components/common/CustomerRoute";
import VendorRoute from "../components/common/VendorRoute";
import AdminRoute from "../components/common/AdminRoute";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import NotFound from "../pages/NotFound";

const Products = lazy(() => import("../pages/Products"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Cart = lazy(() => import("../pages/Cart"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Profile = lazy(() => import("../pages/Profile"));
const Addresses = lazy(() => import("../pages/Addresses"));
const Account = lazy(() => import("../pages/Account"));
const Orders = lazy(() => import("../pages/Orders"));
const OrderDetails = lazy(() => import("../pages/OrderDetails"));
const Payment = lazy(() => import("../pages/Payment"));
const PaymentSuccess = lazy(() => import("../pages/PaymentSuccess"));
const PaymentFailed = lazy(() => import("../pages/PaymentFailed"));
const VendorDashboard = lazy(() => import("../pages/vendor/VendorDashboard"));
const VendorProfile = lazy(() => import("../pages/vendor/VendorProfile"));
const VendorProducts = lazy(() => import("../pages/vendor/VendorProducts"));
const VendorProductCreate = lazy(() => import("../pages/vendor/VendorProductCreate"));
const VendorProductEdit = lazy(() => import("../pages/vendor/VendorProductEdit"));
const VendorOrders = lazy(() => import("../pages/vendor/VendorOrders"));
const VendorCoupons = lazy(() => import("../pages/vendor/VendorCoupons"));
const VendorAnalytics = lazy(() => import("../pages/vendor/VendorAnalytics"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("../pages/admin/Users"));
const AdminVendors = lazy(() => import("../pages/admin/Vendors"));
const AdminCategories = lazy(() => import("../pages/admin/Categories"));
const AdminSubcategories = lazy(() => import("../pages/admin/Subcategories"));
const AdminBrands = lazy(() => import("../pages/admin/Brands"));
const AdminProducts = lazy(() => import("../pages/admin/Products"));
const AdminOrders = lazy(() => import("../pages/admin/Orders"));
const AdminCoupons = lazy(() => import("../pages/admin/Coupons"));
const AdminPayments = lazy(() => import("../pages/admin/Payments"));
const AdminReports = lazy(() => import("../pages/admin/Reports"));

const PageSpinner = (
  <div className="flex justify-center items-center py-24">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={PageSpinner}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route
            path="/checkout"
            element={
              <CustomerRoute>
                <Checkout />
              </CustomerRoute>
            }
          />
          <Route
            path="/addresses"
            element={
              <CustomerRoute>
                <Addresses />
              </CustomerRoute>
            }
          />

          <Route
            path="/account"
            element={
              <CustomerRoute>
                <Account />
              </CustomerRoute>
            }
          />
          <Route
            path="/account/profile"
            element={
              <CustomerRoute>
                <Profile />
              </CustomerRoute>
            }
          />
          <Route
            path="/account/orders"
            element={
              <CustomerRoute>
                <Orders />
              </CustomerRoute>
            }
          />
          <Route
            path="/account/orders/:id"
            element={
              <CustomerRoute>
                <OrderDetails />
              </CustomerRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <CustomerRoute>
                <Payment />
              </CustomerRoute>
            }
          />
          <Route
            path="/payment/success"
            element={
              <CustomerRoute>
                <PaymentSuccess />
              </CustomerRoute>
            }
          />
          <Route
            path="/payment/failed"
            element={
              <CustomerRoute>
                <PaymentFailed />
              </CustomerRoute>
            }
          />
        </Route>

        <Route
          path="/vendor"
          element={
            <VendorRoute>
              <VendorLayout />
            </VendorRoute>
          }
        >
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="products/create" element={<VendorProductCreate />} />
          <Route path="products/edit/:id" element={<VendorProductEdit />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="coupons" element={<VendorCoupons />} />
          <Route path="analytics" element={<VendorAnalytics />} />
        </Route>
        <Route path="/vendor/*" element={<NotFound />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="subcategories" element={<AdminSubcategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;