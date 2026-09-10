import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCatalogCategories, fetchPublicProducts } from "../redux/slices/catalogSlice";
import ProductCard from "../components/product/ProductCard";

const getCategoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("electro") || n.includes("phone") || n.includes("computer")) return "📱";
  if (n.includes("fashion") || n.includes("cloth") || n.includes("apparel")) return "👕";
  if (n.includes("home") || n.includes("garden") || n.includes("furniture")) return "🏠";
  if (n.includes("sport") || n.includes("outdoor")) return "⚽";
  if (n.includes("beauty") || n.includes("skin") || n.includes("cosmetic")) return "💄";
  if (n.includes("book") || n.includes("stationery")) return "📚";
  if (n.includes("toy") || n.includes("game")) return "🎮";
  if (n.includes("food") || n.includes("grocery")) return "🍎";
  if (n.includes("auto") || n.includes("car")) return "🚗";
  if (n.includes("jewel")) return "💎";
  return "📦";
};

const Home = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.catalog.categories);
  const { products: featured, loading: featuredLoading } = useSelector(
    (state) => state.catalog
  );

  useEffect(() => {
    dispatch(fetchCatalogCategories());
  }, [dispatch]);

  useEffect(() => {
    if (featured.length === 0) {
      dispatch(fetchPublicProducts({ sort: "popular", limit: 8 }));
    }
  }, [dispatch, featured.length]);

  const features = [
    {
      title: "Multi-Vendor",
      description: "Shop from thousands of verified sellers worldwide",
      icon: "🏪",
    },
    {
      title: "Secure Payments",
      description: "100% secure payment processing with Razorpay",
      icon: "🔒",
    },
    {
      title: "Fast Delivery",
      description: "Quick and reliable shipping to your doorstep",
      icon: "🚚",
    },
    {
      title: "Easy Returns",
      description: "Hassle-free return and refund policy",
      icon: "↩️",
    },
  ];

  return (
    <div>
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover. Shop. <br />
              <span className="text-indigo-200">From Any Vendor.</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-xl">
              Your one-stop multi-vendor marketplace. Find everything from
              electronics to fashion, all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Browse Products
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of categories and find exactly what you're
              looking for.
            </p>
          </div>
          {categories.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category.slug}`}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-center group"
                >
                  <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(category.name)}
                  </span>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Shop the latest arrivals
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600">
              Check out what's trending right now.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredLoading && featured.length === 0
              ? [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                  >
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                    <div className="h-5 bg-indigo-200 rounded w-1/4 animate-pulse"></div>
                  </div>
                ))
              : featured.slice(0, 8).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
          </div>
          {!featuredLoading && featured.length === 0 && (
            <p className="text-center text-gray-400 text-sm">
              No products are available yet. Check back soon!
            </p>
          )}
          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Shop With Us?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <span className="text-5xl block mb-4">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Join thousands of vendors and reach millions of customers. Start
            your online store today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;