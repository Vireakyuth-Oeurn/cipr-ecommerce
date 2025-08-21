import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react';
import { getProducts } from '../api/services';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import ScrollToTop from '../components/ScrollToTop';
import Toast from '../components/Toast';
import ApiStatusBanner from '../components/ApiStatusBanner';
import useDebounce from '../hooks/useDebounce';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useAsyncState } from '../hooks/useAsyncState';

const Products = () => {
  const { handleError } = useErrorHandler();
  const {
    data: products,
    loading,
    error,
    execute: executeProductFetch
  } = useAsyncState([]);

  const [activeFilters, setActiveFilters] = useState({
    availability: true,
    category: false,
    colors: false,
    priceRange: false,
    collections: false,
    tags: false,
    ratings: false
  });

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiDown, setApiDown] = useState(false);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Initialize products on component mount
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        console.log('📄 Products: Fetching products...');
        const data = await getProducts();
        console.log('📄 Products: Received data:', data);
        
        // Use the 'all' array which contains all products combined
        const allProducts = data.all || data.products || [];
        console.log('📄 Products: Extracted products:', allProducts.length);
        
        return allProducts;
      } catch (err) {
        console.error('📄 Products: Failed to fetch products:', err);
        throw err;
      }
    };

    executeProductFetch(fetchProductsData).catch((err) => {
      // Check if it's an API server error
      if (err.message.includes('500') || err.message.includes('Failed to fetch')) {
        setApiDown(true);
      }
      handleError(err, {
        fallbackMessage: 'Failed to load products. Please try again.',
        showToast: true,
        context: 'product_fetch'
      });
    });
  }, [executeProductFetch, handleError]);

  const fetchProducts = async () => {
    const fetchProductsData = async () => {
      try {
        console.log('🔄 Products: Refetching products...');
        const data = await getProducts();
        console.log('🔄 Products: Received data:', data);
        
        // Use the 'all' array which contains all products combined
        const allProducts = data.all || data.products || [];
        console.log('🔄 Products: Extracted products:', allProducts.length);
        
        return allProducts;
      } catch (err) {
        console.error('🔄 Products: Failed to fetch products:', err);
        throw err;
      }
    };

    return executeProductFetch(fetchProductsData).catch((err) => {
      handleError(err, {
        fallbackMessage: 'Failed to load products. Please try again.',
        showToast: true,
        context: 'product_fetch_retry'
      });
    });
  };

  const handleRetry = () => {
    fetchProducts();
  };

  // Enhanced filtering with better category matching
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
                         (product.category && product.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    
    let matchesCategory = true;
    if (selectedCategory !== 'ALL') {
      if (selectedCategory === 'NEW' || selectedCategory === 'LATEST') {
        // Show latest products (this would need API categorization)
        matchesCategory = true; // For now, show all as we can't distinguish without timestamps
      } else if (selectedCategory === 'BEST SELLERS') {
        matchesCategory = true; // Similar issue - need API categorization
      } else if (selectedCategory === 'RECOMMENDED') {
        matchesCategory = true;
      } else {
        matchesCategory = product.category === selectedCategory;
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  const toggleFilter = (filter) => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const categories = [
    'ALL', 'NEW', 'BEST SELLERS', 'RECOMMENDED', 'COAT', 'SUIT', 'SHOES', 
    'PYJAMAS', 'SHORT', 'DRESS', 'UNDIES', 'JACKET', 'T-SHIRT', 'SPORTWEAR', 'HAT'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2X'];

  if (loading) {
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

  const handleRetryApi = () => {
    setApiDown(false);
    // Re-fetch products
    const fetchProductsData = async () => {
      try {
        console.log('🔄 Products: Retrying API...');
        const data = await getProducts();
        console.log('🔄 Products: Retry received data:', data);
        
        // Use the 'all' array which contains all products combined
        const allProducts = data.all || data.products || [];
        console.log('🔄 Products: Retry extracted products:', allProducts.length);
        
        return allProducts;
      } catch (err) {
        console.error('🔄 Products: Retry failed:', err);
        if (err.message.includes('500') || err.message.includes('Failed to fetch')) {
          setApiDown(true);
        }
        throw err;
      }
    };

    executeProductFetch(fetchProductsData).catch((err) => {
      handleError(err, {
        fallbackMessage: 'Failed to load products. Please try again.',
        showToast: true,
        context: 'product_fetch_retry'
      });
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Status Banner */}
        {apiDown && <ApiStatusBanner onRetry={handleRetryApi} />}
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900">Products</span>
        </div>

        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PRODUCTS</h1>
          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error.message || 'Using demo data (API unavailable)'}</span>
              {error.canRetry && (
                <button
                  onClick={handleRetry}
                  className="ml-2 text-yellow-800 hover:text-yellow-900 underline text-sm flex items-center gap-1"
                  disabled={loading}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
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
                  onClick={() => toggleFilter('availability')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">Availability</h3>
                  {activeFilters.availability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeFilters.availability && (
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="ml-2 text-sm text-gray-600">Available (450)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="ml-2 text-sm text-gray-600">Out Of Stock (18)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <button
                  onClick={() => toggleFilter('category')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">Category</h3>
                  {activeFilters.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Colors Filter */}
              <div>
                <button
                  onClick={() => toggleFilter('colors')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">Colors</h3>
                  {activeFilters.colors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Price Range Filter */}
              <div>
                <button
                  onClick={() => toggleFilter('priceRange')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
                  {activeFilters.priceRange ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Collections Filter */}
              <div>
                <button
                  onClick={() => toggleFilter('collections')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">Collections</h3>
                  {activeFilters.collections ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Tags Filter */}
              <div>
                <button
                  onClick={() => toggleFilter('tags')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">Tags</h3>
                  {activeFilters.tags ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Ratings Filter */}
              <div>
                <button
                  onClick={() => toggleFilter('ratings')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-medium text-gray-900">Ratings</h3>
                  {activeFilters.ratings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedCategory === category
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Show skeleton loading states
                Array.from({ length: 6 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
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
