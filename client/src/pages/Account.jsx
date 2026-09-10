import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../redux/slices/orderSlice";
import { fetchRecommendedProducts } from "../redux/slices/productSlice";
import StatusBadge from "../components/admin/StatusBadge";
import ProductCard from "../components/product/ProductCard";
import { formatCurrency, formatDate } from "../utils/format";

const Account = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { myOrders, myOrdersLoading } = useSelector((state) => state.order);
  const totalQuantity = useSelector(
    (state) => state.cart.totals.totalQuantity
  );
  const wishlistCount = useSelector(
    (state) => state.wishlist.products.length
  );
  const addressesCount = useSelector(
    (state) => state.addresses.addresses.length
  );
  const { recommended, recommendedLoading } = useSelector(
    (state) => state.product
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyOrders({ page: 1, limit: 5 }));
      dispatch(fetchRecommendedProducts());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg
          className="w-24 h-24 mx-auto text-gray-300 mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to access your account.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  const stats = [
    {
      label: "Orders",
      value: myOrders?.length ?? 0,
      icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14v11H5V9z",
      to: "/account/orders",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Cart Items",
      value: totalQuantity,
      icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
      to: "/cart",
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Wishlist Items",
      value: wishlistCount,
      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      to: "/wishlist",
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Addresses",
      value: addressesCount,
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
      to: "/addresses",
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {getInitial(user?.name)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="inline-flex items-center mt-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d={stat.icon} />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Profile</h3>
            <Link
              to="/account/profile"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Edit Profile
            </Link>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">{user?.name || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{user?.email || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-900">
                {user?.phone || "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Role</dt>
              <dd className="font-medium text-gray-900 capitalize">
                {user?.role || "-"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 md:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link
              to="/account/orders"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all →
            </Link>
          </div>
          {myOrdersLoading && myOrders.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-400">
              Loading orders...
            </div>
          ) : myOrders.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-200 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14v11H5V9z"
                />
              </svg>
              <p className="text-sm text-gray-500 mb-4">
                You haven't placed any orders yet.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myOrders.slice(0, 5).map((order) => (
                <Link
                  key={order._id}
                  to={`/account/orders/${order._id}`}
                  className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.createdAt)} ·{" "}
                      {order.items?.length || 0} item
                      {(order.items?.length || 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.totalPrice)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {recommended.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-gray-900">
              Recommended for You
            </h3>
            <Link
              to="/products"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Browse all →
            </Link>
          </div>
          {recommendedLoading && recommended.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                >
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommended.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Account;