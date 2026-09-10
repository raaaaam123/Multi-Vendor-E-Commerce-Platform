import { Link } from "react-router-dom";

const CategoryMenu = ({ categories }) => {
  return (
    <div className="relative group/dropdown">
      <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
        Categories
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div className="absolute left-0 top-full pt-3 hidden group-hover/dropdown:block z-40">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-56">
          <Link
            to="/products"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
