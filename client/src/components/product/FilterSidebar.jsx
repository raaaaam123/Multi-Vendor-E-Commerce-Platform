const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹5000", min: 1000, max: 5000 },
  { label: "₹5000 - ₹10000", min: 5000, max: 10000 },
  { label: "Over ₹10000", min: 10000, max: null },
];

const RATINGS = [4, 3, 2, 1];

const FilterSidebar = ({
  categories,
  subcategories,
  brands,
  selectedCategory,
  selectedSubcategory,
  selectedBrand,
  selectedRating,
  selectedAvailability,
  selectedPrice,
  onCategoryChange,
  onSubcategoryChange,
  onBrandChange,
  onRatingChange,
  onAvailabilityChange,
  onPriceChange,
  onClear,
}) => {
  const activeCount =
    (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (selectedRating ? 1 : 0) +
    (selectedAvailability ? 1 : 0) +
    (selectedPrice ? 1 : 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label
                  key={cat._id}
                  className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.slug}
                    onChange={() => onCategoryChange(cat.slug)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {subcategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <div className="space-y-2">
              {subcategories.map((sub) => (
                <label
                  key={sub._id}
                  className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="subcategory"
                    checked={selectedSubcategory === sub.slug}
                    onChange={() => onSubcategoryChange(sub.slug)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  {sub.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {brands.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {brands.map((brand) => (
                <label
                  key={brand._id}
                  className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="brand"
                    checked={selectedBrand === brand.slug}
                    onChange={() => onBrandChange(brand.slug)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price
          </label>
          <div className="space-y-2">
            {PRICE_RANGES.map((range) => (
              <label
                key={range.label}
                className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
              >
                <input
                  type="radio"
                  name="price"
                  checked={
                    selectedPrice ===
                    `${range.min}-${range.max ?? "max"}`
                  }
                  onChange={() =>
                    onPriceChange(`${range.min}-${range.max ?? "max"}`)
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                {range.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="space-y-2">
            {RATINGS.map((r) => (
              <label
                key={r}
                className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === r}
                  onChange={() => onRatingChange(r)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                {r}★ & above
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                name="availability"
                checked={selectedAvailability === "in-stock"}
                onChange={() => onAvailabilityChange("in-stock")}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              In Stock
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                name="availability"
                checked={selectedAvailability === "out-of-stock"}
                onChange={() => onAvailabilityChange("out-of-stock")}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              Out of Stock
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
