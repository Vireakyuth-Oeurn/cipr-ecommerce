import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { searchProducts } from "../api/services";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import ScrollToTop from "../components/ScrollToTop";
import Toast from "../components/Toast";
import ApiStatusBanner from "../components/ApiStatusBanner";
import useDebounce from "../hooks/useDebounce";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { useAsyncState } from "../hooks/useAsyncState";

const Products = () => {
  const { handleError } = useErrorHandler();
  const {
    data: products,
    loading,
    error,
    execute: executeProductFetch,
  } = useAsyncState([]);

  const [activeFilters, setActiveFilters] = useState({
    availability: true,
    category: false,
    colors: false,
    priceRange: false,
    collections: false,
    tags: false,
    ratings: false,
  });

  const [selectedCategory, setSelectedCategory] = useState("NEW");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiDown, setApiDown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Function to fetch products based on category or search
  const fetchProductsData = async (category = "ALL", searchTerm = "") => {
    try {
      let data;

      // If there's a search term, use search API
      if (searchTerm.trim()) {
        console.log("Searching for:", searchTerm);
        data = await searchProducts(searchTerm, 50); // Get more results for search
      }
      // If category is one of the special categories, use search API with keywords
      else if (category === "NEW" || category === "LATEST") {
        console.log("Fetching new products");
        data = await searchProducts("new", 50);
      } else if (category === "BEST SELLERS") {
        console.log("Fetching best sellers");
        data = await searchProducts("best", 50);
      } else if (category === "RECOMMENDED") {
        console.log("Fetching recommended products");
        data = await searchProducts("recommended", 50);
      }
      // For ALL or other categories, get all products and filter client-side
      else {
        console.log("Fetching product category:", category);
        data = await searchProducts(category.toLowerCase(), 50);
      }

      let filteredProducts = data.products || [];

      // Apply category filter client-side for non-special categories
      if (
        category !== "ALL" &&
        !["NEW", "LATEST", "BEST SELLERS", "RECOMMENDED"].includes(category)
      ) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.category &&
            product.category.toUpperCase() === category.toUpperCase()
        );
      }

      return filteredProducts;
    } catch (err) {
      console.error("Failed to fetch products:", err);
      throw err;
    }
  };

  // Initialize products on component mount
  useEffect(() => {
    const loadInitialProducts = async () => {
      try {
        const products = await fetchProductsData(selectedCategory);
        return products;
      } catch (err) {
        // Check if it's an API server error
        if (
          err.message.includes("500") ||
          err.message.includes("Failed to fetch")
        ) {
          setApiDown(true);
        }
        throw err;
      }
    };

    executeProductFetch(loadInitialProducts).catch((err) => {
      handleError(err, {
        fallbackMessage: "Failed to load products. Please try again.",
        showToast: true,
        context: "initial_product_fetch",
      });
    });
  }, []); // Only run on mount

  // Handle category changes
  useEffect(() => {
    // Don't fetch if we're currently searching by text
    if (debouncedSearchQuery.trim()) {
      return;
    }

    const loadCategoryProducts = async () => {
      try {
        const products = await fetchProductsData(selectedCategory);
        return products;
      } catch (err) {
        if (
          err.message.includes("500") ||
          err.message.includes("Failed to fetch")
        ) {
          setApiDown(true);
        }
        throw err;
      }
    };

    executeProductFetch(loadCategoryProducts).catch((err) => {
      handleError(err, {
        fallbackMessage: "Failed to load products for selected category.",
        showToast: true,
        context: "category_filter",
      });
    });
  }, [selectedCategory, executeProductFetch, handleError]);

  // Handle search query changes
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      // If search is cleared, reload category products
      const loadCategoryProducts = async () => {
        try {
          const products = await fetchProductsData(selectedCategory);
          return products;
        } catch (err) {
          if (
            err.message.includes("500") ||
            err.message.includes("Failed to fetch")
          ) {
            setApiDown(true);
          }
          throw err;
        }
      };

      executeProductFetch(loadCategoryProducts).catch((err) => {
        handleError(err, {
          fallbackMessage: "Failed to reload products.",
          showToast: true,
          context: "search_clear",
        });
      });
      return;
    }

    // Perform search
    const performSearch = async () => {
      setIsSearching(true);
      try {
        const products = await fetchProductsData(
          selectedCategory,
          debouncedSearchQuery
        );
        return products;
      } catch (err) {
        if (
          err.message.includes("500") ||
          err.message.includes("Failed to fetch")
        ) {
          setApiDown(true);
        }
        throw err;
      } finally {
        setIsSearching(false);
      }
    };

    executeProductFetch(performSearch).catch((err) => {
      setIsSearching(false);
      handleError(err, {
        fallbackMessage: "Search failed. Please try again.",
        showToast: true,
        context: "product_search",
      });
    });
  }, [debouncedSearchQuery, executeProductFetch, handleError]);

  const handleRetry = () => {
    const retryFetch = async () => {
      try {
        const products = await fetchProductsData(
          selectedCategory,
          debouncedSearchQuery
        );
        return products;
      } catch (err) {
        if (
          err.message.includes("500") ||
          err.message.includes("Failed to fetch")
        ) {
          setApiDown(true);
        }
        throw err;
      }
    };

    executeProductFetch(retryFetch).catch((err) => {
      handleError(err, {
        fallbackMessage: "Retry failed. Please try again.",
        showToast: true,
        context: "product_fetch_retry",
      });
    });
  };

  const handleRetryApi = () => {
    setApiDown(false);
    handleRetry();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Clear search when changing category
    setSearchQuery("");
  };

  const toggleFilter = (filter) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const categories = [
    "NEW",
    "BEST SELLERS",
    "RECOMMENDED",
    "SUIT",
    "SHOES",
    "PYJAMAS",
    "SHORT",
    "DRESS",
    "T-SHIRT",
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "2X"];

  // Show loading state
  if (loading && !products.length) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Status Banner */}
        {apiDown && <ApiStatusBanner onRetry={handleRetryApi} />}

        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PRODUCTS</h1>
            <p className="text-sm text-gray-600 mt-1">
              {isSearching
                ? "Searching..."
                : debouncedSearchQuery.trim()
                ? `Search results for "${debouncedSearchQuery}" (${products.length} found)`
                : `${selectedCategory} (${products.length})`}
            </p>
          </div>
          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              <span>
                {error.message || "Using demo data (API unavailable)"}
              </span>
              {error.canRetry && (
                <button
                  onClick={handleRetry}
                  className="ml-2 text-yellow-800 hover:text-yellow-900 underline text-sm flex items-center gap-1"
                  disabled={loading}
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>

              {/* Search Results Info */}
              {debouncedSearchQuery.trim() && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Search:</strong> "{debouncedSearchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                  >
                    Clear search
                  </button>
                </div>
              )}

              {/* Size Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <button
                  onClick={() => toggleFilter("availability")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">
                    Availability
                  </h3>
                  {activeFilters.availability ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {activeFilters.availability && (
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Available
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Out Of Stock
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <button
                  onClick={() => toggleFilter("category")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">
                    Category
                  </h3>
                  {activeFilters.category ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {/* Colors Filter */}
              <div>
                <button
                  onClick={() => toggleFilter("colors")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">Colors</h3>
                  {activeFilters.colors ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {/* Price Range Filter */}
              <div>
                <button
                  onClick={() => toggleFilter("priceRange")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">
                    Price Range
                  </h3>
                  {activeFilters.priceRange ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {/* Collections Filter */}
              <div>
                <button
                  onClick={() => toggleFilter("collections")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">
                    Collections
                  </h3>
                  {activeFilters.collections ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {/* Tags Filter */}
              <div>
                <button
                  onClick={() => toggleFilter("tags")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">Tags</h3>
                  {activeFilters.tags ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {/* Ratings Filter */}
              <div>
                <button
                  onClick={() => toggleFilter("ratings")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">Ratings</h3>
                  {activeFilters.ratings ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  disabled={loading || isSearching}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                    selectedCategory === category
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Loading indicator for search/filter */}
            {(loading || isSearching) && products.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin mr-2" />
                  <span className="text-sm text-blue-800">
                    {isSearching ? "Searching..." : "Loading..."}
                  </span>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading && !products.length ? (
                // Show skeleton loading states for initial load
                Array.from({ length: 6 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600">
                    {debouncedSearchQuery.trim()
                      ? `No results found for "${debouncedSearchQuery}"`
                      : "Try adjusting your search or filters"}
                  </p>
                  {debouncedSearchQuery.trim() && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-3 text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear search and show {selectedCategory.toLowerCase()}{" "}
                      products
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <ScrollToTop />
      </div>
    </div>
  );
};

export default Products;
