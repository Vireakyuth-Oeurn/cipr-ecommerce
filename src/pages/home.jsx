import PromotionProduct from "../components/promotion-product";
import QRCodeGenerator from "../components/qr-code-generator";
import ProductCard from "../components/ProductCard";
import ScrollToTop from "../components/ScrollToTop";
import ApiStatusBanner from "../components/ApiStatusBanner";
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/services';

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [popularProducts, setPopularProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDown, setApiDown] = useState(false);
  const navigate = useNavigate();

  const trendingSearches = ['Basic T-Shirt', 'Denim Jacket', 'Polo Shirt', 'Chino Pants'];
  const recentSearches = ['Cotton Shirt', 'Black Jeans', 'Summer Collection'];

//   useEffect(() => {
//   const fetchHomeData = async () => {
//     try {
//       setLoading(true);
//       console.log('🏠 Fetching home page products...');

//       // Fetch products with correct destructuring
//       const productsData = await getProducts(12); // Get more products for home page
//       console.log('🏠 Received products data:', productsData);

//       // Use the correct property names from getProducts response
//       const {
//         latest_products = [],
//         best_selling_products = [],
//         recommended_products = [],
//       } = productsData;

//       // Set products for each section
//       setPopularProducts(best_selling_products.slice(0, 4));
//       setFeaturedProducts(latest_products.slice(0, 4));
//       setCollections(recommended_products.slice(0, 4));

//       console.log('🏠 Set products:', {
//         popular: best_selling_products.length,
//         featured: latest_products.length,
//         collections: recommended_products.length
//       });

//       setApiDown(false);
//     } catch (error) {
//       console.error('❌ Error fetching home data:', error);
//       if (error.message.includes('500') || error.message.includes('Failed to fetch')) {
//         setApiDown(true);
//       }
//       // Set empty arrays as fallback
//       setPopularProducts([]);
//       setFeaturedProducts([]);
//       setCollections([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchHomeData();
// }, []);
  useEffect(() => {
  const fetchHomeData = async () => {
    try {
      setLoading(true);
      console.log('🏠 Fetching home page products...');
      console.log('🏠 API URL:', import.meta.env.VITE_API_URL);

      // Fetch products with better error handling
      const productsData = await getProducts(12);
      console.log('🏠 Raw products response:', productsData);
      console.log('🏠 Response type:', typeof productsData);
      console.log('🏠 Response keys:', Object.keys(productsData || {}));

      // Validate response structure
      if (!productsData || typeof productsData !== 'object') {
        console.error('🏠 Invalid response structure:', productsData);
        throw new Error('Invalid API response: expected object, got ' + typeof productsData);
      }

      // Use the correct property names from getProducts response with safer access
      const latest_products = Array.isArray(productsData.latest_products) ? productsData.latest_products : [];
      const best_selling_products = Array.isArray(productsData.best_selling_products) ? productsData.best_selling_products : [];
      const recommended_products = Array.isArray(productsData.recommended_products) ? productsData.recommended_products : [];
      const all_products = Array.isArray(productsData.all) ? productsData.all : [];

      console.log('🏠 Extracted arrays:', {
        latest: latest_products.length,
        bestSelling: best_selling_products.length,
        recommended: recommended_products.length,
        all: all_products.length
      });

      // Set products for each section with fallbacks
      setPopularProducts((best_selling_products.length > 0 ? best_selling_products : all_products).slice(0, 4));
      setFeaturedProducts((latest_products.length > 0 ? latest_products : all_products).slice(0, 4));
      setCollections((recommended_products.length > 0 ? recommended_products : all_products).slice(0, 4));

      console.log('🏠 Successfully set products for home page');
      setApiDown(false);
    } catch (error) {
      console.error('❌ Error fetching home data:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.message.includes('500') || 
          error.message.includes('Failed to fetch') || 
          error.message.includes('Network Error') ||
          error.message.includes('target must be an object')) {
        setApiDown(true);
      }
      
      // Set empty arrays as fallback
      setPopularProducts([]);
      setFeaturedProducts([]);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  fetchHomeData();
}, []);

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setIsSearchFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  // Filter suggestions based on search query
  const filteredTrending = trendingSearches.filter(term => 
    term.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRecent = recentSearches.filter(term => 
    term.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ProductSection = ({ title, products, loading }) => (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-lg aspect-square animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const handleRetryApi = () => {
  setApiDown(false);
  setLoading(true);
  
  const fetchHomeData = async () => {
    try {
      console.log('🔄 Retrying home API call...');
      console.log('🔄 API URL:', import.meta.env.VITE_API_URL);
      
      const productsData = await getProducts(12);
      console.log('🔄 Retry raw response:', productsData);
      
      // Validate response structure
      if (!productsData || typeof productsData !== 'object') {
        console.error('🔄 Invalid retry response:', productsData);
        throw new Error('Invalid API response on retry: expected object, got ' + typeof productsData);
      }
      
      // Use safer array access
      const latest_products = Array.isArray(productsData.latest_products) ? productsData.latest_products : [];
      const best_selling_products = Array.isArray(productsData.best_selling_products) ? productsData.best_selling_products : [];
      const recommended_products = Array.isArray(productsData.recommended_products) ? productsData.recommended_products : [];
      const all_products = Array.isArray(productsData.all) ? productsData.all : [];
      
      // Set products with fallbacks
      setPopularProducts((best_selling_products.length > 0 ? best_selling_products : all_products).slice(0, 4));
      setFeaturedProducts((latest_products.length > 0 ? latest_products : all_products).slice(0, 4));
      setCollections((recommended_products.length > 0 ? recommended_products : all_products).slice(0, 4));
      
      setApiDown(false);
      console.log('✅ Home retry successful');
    } catch (error) {
      console.error('❌ Home retry failed:', error);
      console.error('❌ Retry error response:', error.response?.data);
      setApiDown(true);
      setPopularProducts([]);
      setFeaturedProducts([]);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };
  
  fetchHomeData();
};

  return (
    <>
      {/* API Status Banner */}
      {apiDown && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <ApiStatusBanner onRetry={handleRetryApi} />
        </div>
      )}
      
      {/* Hero Section with Enhanced Search */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-[70vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Discover Your Perfect Style
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Explore our curated collection of premium fashion essentials designed for the modern lifestyle
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder="Search for products, brands, or categories..."
                />
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
                >
                  <span className="bg-blue-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base font-medium">
                    Search
                  </span>
                </button>
              </div>

              {/* Search Suggestions Dropdown */}
              {isSearchFocused && (searchQuery || filteredTrending.length > 0 || filteredRecent.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                  {/* Close button */}
                  <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Search Suggestions</span>
                    <button
                      onClick={() => setIsSearchFocused(false)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>
                  
                  {/* Trending Searches */}
                  {filteredTrending.length > 0 && (
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp size={16} className="text-blue-500" />
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Trending</span>
                      </div>
                      <div className="space-y-1">
                        {filteredTrending.map((term, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(term)}
                            className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-700"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recent Searches */}
                  {filteredRecent.length > 0 && (
                    <div className="p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Recent</span>
                      </div>
                      <div className="space-y-1">
                        {filteredRecent.map((term, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(term)}
                            className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-700"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Access Links */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
              <button onClick={() => navigate('/new')} className="px-4 sm:px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-full hover:border-gray-300 hover:shadow-md transition-all duration-200 text-sm sm:text-base">
                New Arrivals
              </button>
              <button onClick={() => navigate('/collections')} className="px-4 sm:px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-full hover:border-gray-300 hover:shadow-md transition-all duration-200 text-sm sm:text-base">
                Collections
              </button>
              <button onClick={() => navigate('/products')} className="px-4 sm:px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-full hover:border-gray-300 hover:shadow-md transition-all duration-200 text-sm sm:text-base">
                All Products
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Best Selling Products Section */}
      <ProductSection
        title="BEST SELLING PRODUCTS"
        products={popularProducts}
        loading={loading}
      />

      {/* Latest Arrivals Section */}
      <div className="bg-gray-50">
        <ProductSection
          title="LATEST ARRIVALS"
          products={featuredProducts}
          loading={loading}
        />
      </div>

      {/* Recommended Products Section */}
      <ProductSection
        title="RECOMMENDED FOR YOU"
        products={collections}
        loading={loading}
      />

      {/* AI Badge */}
      <div className="text-center pb-12">
        <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-600 font-medium">Powered by CIPR Recommendation Engine</span>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="py-16 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Shop on the Go
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Scan to discover our latest collections and exclusive offers
          </p>
          
          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-4 sm:space-y-6 mt-8 sm:mt-12">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8 rounded-2xl shadow-lg">
              <QRCodeGenerator 
                url="https://www.youtube.com/shorts/Ay8lynMZ4mE?feature=share" 
                size={200}
                className="mx-auto sm:hidden"
              />
              <QRCodeGenerator 
                url="https://www.youtube.com/shorts/Ay8lynMZ4mE?feature=share" 
                size={250}
                className="mx-auto hidden sm:block"
              />
            </div>
            
            <div className="text-center">
              <p className="text-xs sm:text-sm text-blue-100 mb-3">Point your camera at the QR code</p>
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Ready to scan
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <PromotionProduct /> */}

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  );
}

export default Home;
