import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";
import { fetchCatalogCategories } from "../../redux/slices/catalogSlice";
import SearchBar from "../product/SearchBar";
import CategoryMenu from "../product/CategoryMenu";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const totalQuantity = useSelector(
    (state) => state.cart.totals.totalQuantity
  );
  const wishlistCount = useSelector(
    (state) => state.wishlist.products.length
  );
  const categories = useSelector((state) => state.catalog.categories);

  useEffect(() => {
    dispatch(fetchCatalogCategories());
  }, [dispatch]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/cart", label: "Cart" },
    { to: "/wishlist", label: "Wishlist" },
  ];

  const getDashboardPath = (role) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "vendor":
        return "/vendor/dashboard";
      case "customer":
        return "/account/profile";
      default:
        return "/account";
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setMobileOpen(false);
    navigate("/", { replace: true });
  };

  const handleSearch = (term) => {
    if (term) {
      navigate(`/products?search=${encodeURIComponent(term)}`);
    } else {
      navigate("/products");
    }
    setMobileOpen(false);
  };

  const dashboardPath = user ? getDashboardPath(user.role) : "/account";

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ShopVerse</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <CategoryMenu categories={categories} />
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? "text-indigo-600"
                      : "text-gray-600 hover:text-indigo-600"
                  }`
                }
              >
                <span className="relative">
                  {link.label}
                  {link.to === "/cart" && totalQuantity > 0 && (
                    <span className="absolute -top-2 -right-4 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalQuantity}
                    </span>
                  )}
                  {link.to === "/wishlist" && wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link
                  to={dashboardPath}
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors capitalize"
                >
                  {user?.role === "customer" ? user?.name : user?.role}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        <div className="hidden md:block pb-4 max-w-xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t mt-2">
            <div className="pt-4 px-4">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="flex flex-col gap-2 pt-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  <span className="flex items-center justify-between">
                    {link.label}
                    {link.to === "/cart" && totalQuantity > 0 && (
                      <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {totalQuantity}
                      </span>
                    )}
                    {link.to === "/wishlist" && wishlistCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </span>
                </NavLink>
              ))}
              {categories.length > 0 && (
                <div className="border-t mt-2 pt-2">
                  <p className="px-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Categories
                  </p>
                  {categories.map((cat) => (
                    <NavLink
                      key={cat._id}
                      to={`/products?category=${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                      {cat.name}
                    </NavLink>
                  ))}
                </div>
              )}
              <div className="border-t mt-2 pt-2 px-4">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to={dashboardPath}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2 text-sm font-medium text-gray-700 capitalize"
                    >
                      {user?.role === "customer" ? user?.name : user?.role}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block py-2 text-sm font-medium text-gray-500 hover:text-red-600 text-left"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 text-sm font-medium text-gray-700"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-4 text-sm font-medium bg-indigo-600 text-white rounded-lg"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;