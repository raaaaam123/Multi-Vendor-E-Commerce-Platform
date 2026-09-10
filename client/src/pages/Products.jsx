import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "../components/product/SearchBar";
import SortDropdown from "../components/product/SortDropdown";
import FilterSidebar from "../components/product/FilterSidebar";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/product/Pagination";
import {
  fetchPublicProducts,
  fetchCatalogCategories,
  fetchCatalogSubcategories,
  fetchCatalogBrands,
} from "../redux/slices/catalogSlice";

const Products = () => {
  const dispatch = useDispatch();
  const { products, pagination, categories, brands, loading, error } =
    useSelector((state) => state.catalog);
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const brand = searchParams.get("brand") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;
  const rating = searchParams.get("rating") || "";
  const availability = searchParams.get("availability") || "";
  const price = searchParams.get("price") || "";

  const applyParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      if (updates.page === 1) next.delete("page");
      else if (updates.page !== undefined && updates.page !== null) {
        next.set("page", updates.page);
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    dispatch(fetchCatalogCategories());
    dispatch(fetchCatalogBrands());
  }, [dispatch]);

  useEffect(() => {
    if (category) {
      dispatch(fetchCatalogSubcategories({ category }));
    } else {
      dispatch(fetchCatalogSubcategories({}));
    }
  }, [dispatch, category]);

  const { subcategories } = useSelector((state) => state.catalog);

  useEffect(() => {
    let minPrice, maxPrice;
    if (price) {
      const [min, max] = price.split("-");
      minPrice = min !== "0" ? min : "";
      maxPrice = max === "max" ? "" : max;
    }
    dispatch(
      fetchPublicProducts({
        category,
        subcategory,
        brand,
        search,
        sort,
        page,
        rating: rating || undefined,
        availability: availability || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
      })
    );
  }, [
    dispatch,
    category,
    subcategory,
    brand,
    search,
    sort,
    page,
    rating,
    availability,
    price,
  ]);

  const handleSearch = (term) => {
    applyParams({ search: term, page: 1 });
  };

  const handlePageChange = (newPage) => {
    applyParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentCategory = categories.find(
    (c) => c.slug === category
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {currentCategory ? currentCategory.name : search ? `Search: ${search}` : "All Products"}
        </h1>
        <p className="text-gray-600 mt-2">
          {pagination.totalProducts} product{pagination.totalProducts !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} initialValue={search} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div
          className={`${
            mobileFiltersOpen ? "block" : "hidden"
          } lg:block w-full lg:w-64 shrink-0`}
        >
          <div className="lg:sticky lg:top-24">
            <FilterSidebar
              categories={categories}
              subcategories={subcategories}
              brands={brands}
              selectedCategory={category}
              selectedSubcategory={subcategory}
              selectedBrand={brand}
              selectedRating={rating ? Number(rating) : ""}
              selectedAvailability={availability}
              selectedPrice={price}
              onCategoryChange={(value) =>
                applyParams({
                  category: value,
                  subcategory: "",
                  page: 1,
                })
              }
              onSubcategoryChange={(value) =>
                applyParams({ subcategory: value, page: 1 })
              }
              onBrandChange={(value) =>
                applyParams({ brand: value, page: 1 })
              }
              onRatingChange={(value) =>
                applyParams({ rating: value, page: 1 })
              }
              onAvailabilityChange={(value) =>
                applyParams({ availability: value, page: 1 })
              }
              onPriceChange={(value) => applyParams({ price: value, page: 1 })}
              onClear={() => setSearchParams(search ? { search } : {})}
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 gap-4">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
            >
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-gray-500 hidden sm:inline">
                Sort by:
              </span>
              <SortDropdown
                value={sort}
                onChange={(value) => applyParams({ sort: value, page: 1 })}
              />
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-8 text-center">
              <p className="font-medium">Failed to load products</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : (
            <ProductGrid products={products} loading={loading} />
          )}

          {!loading && !error && products.length === 0 && (
            <div className="bg-white rounded-xl p-16 shadow-sm border border-gray-100 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                No products found
              </h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => setSearchParams({})}
                className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            </div>
          )}

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Products;
