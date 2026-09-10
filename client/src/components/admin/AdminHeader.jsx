import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";
import NotificationBell from "../common/NotificationBell";

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const getPageTitle = (pathname) => {
    const paths = {
      "/admin/dashboard": "Dashboard",
      "/admin/users": "Users",
      "/admin/vendors": "Vendors",
      "/admin/categories": "Categories",
      "/admin/subcategories": "Subcategories",
      "/admin/brands": "Brands",
      "/admin/products": "Products",
      "/admin/orders": "Orders",
      "/admin/coupons": "Coupons",
      "/admin/payments": "Payments",
      "/admin/reports": "Reports",
    };
    return paths[pathname] || "Admin";
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 capitalize">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-indigo-600"
        >
          View Store
        </Link>

        <NotificationBell />

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
